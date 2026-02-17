"""
consumers.py — WebSocket consumer para edición en tiempo real
==============================================================
Usa Django Channels + Redis como channel layer.

Instalación:
  pip install channels channels-redis

settings.py:
  INSTALLED_APPS += ['channels']
  ASGI_APPLICATION = 'myproject.asgi.application'
  CHANNEL_LAYERS = {
      'default': {
          'BACKEND': 'channels_redis.core.RedisChannelLayer',
          'CONFIG': {'hosts': [('127.0.0.1', 6379)]},
      }
  }

asgi.py:
  from channels.routing import ProtocolTypeRouter, URLRouter
  from channels.auth import AuthMiddlewareStack
  from django.urls import path
  from api.consumers import ContentEditConsumer

  application = ProtocolTypeRouter({
      'http': get_asgi_application(),
      'websocket': AuthMiddlewareStack(
          URLRouter([
              path('ws/relationship/<uuid:relationship_id>/content/<str:content_type>/<uuid:content_id>/', ContentEditConsumer.as_asgi()),
          ])
      ),
  })

Flujo:
  1. Cliente conecta al WS pasando el token en el header o querystring
  2. Entra en un grupo específico: "content_{content_type}_{content_id}"
  3. Cualquier mensaje de tipo "text_update" se propaga a todos en el grupo
  4. El servidor también persiste el cambio en BD (debounced via campo)

Tipos de mensajes:
  → Cliente envía:
      { "type": "text_update", "field": "body"|"title", "value": "..." }
      { "type": "cursor",      "position": 42 }   # posición del cursor (opcional)

  ← Servidor broadcast a todos excepto el emisor:
      { "type": "text_update", "field": "body", "value": "...", "user_id": "...", "username": "..." }
      { "type": "cursor",      "position": 42, "user_id": "...", "username": "..." }
      { "type": "user_joined", "user_id": "...", "username": "..." }
      { "type": "user_left",   "user_id": "...", "username": "..." }
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ContentEditConsumer(AsyncWebsocketConsumer):
    """
    Consumer para edición colaborativa en tiempo real de Note, SharedList y Checklist.
    Media y Event no son editables en tiempo real (se publican directamente).
    """

    EDITABLE_TYPES = {'note', 'list', 'checklist'}
    EDITABLE_FIELDS = {
        'note': ['title', 'body', 'color'],
        'list': ['title', 'description'],
        'checklist': ['title', 'description'],
    }

    async def connect(self):
        self.user = self.scope.get('user')
        self.relationship_id = self.scope['url_route']['kwargs']['relationship_id']
        self.content_type = self.scope['url_route']['kwargs']['content_type']
        self.content_id = self.scope['url_route']['kwargs']['content_id']

        # Validaciones
        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return

        if self.content_type not in self.EDITABLE_TYPES:
            await self.close(code=4003)
            return

        is_member = await self.check_membership()
        if not is_member:
            await self.close(code=4003)
            return

        # Grupo único por contenido
        self.group_name = f"content_{self.content_type}_{self.content_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Avisar al grupo de que alguien se conectó
        await self.channel_layer.group_send(self.group_name, {
            'type': 'broadcast_event',
            'payload': {
                'type': 'user_joined',
                'user_id': str(self.user.id),
                'username': self.user.username,
            },
            'exclude_channel': self.channel_name,
        })

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_send(self.group_name, {
                'type': 'broadcast_event',
                'payload': {
                    'type': 'user_left',
                    'user_id': str(self.user.id),
                    'username': self.user.username,
                },
                'exclude_channel': self.channel_name,
            })
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error('JSON inválido.')
            return

        msg_type = data.get('type')

        if msg_type == 'text_update':
            await self.handle_text_update(data)

        elif msg_type == 'cursor':
            # Propagar posición de cursor sin persistir
            await self.channel_layer.group_send(self.group_name, {
                'type': 'broadcast_event',
                'payload': {
                    'type': 'cursor',
                    'position': data.get('position', 0),
                    'user_id': str(self.user.id),
                    'username': self.user.username,
                },
                'exclude_channel': self.channel_name,
            })

        elif msg_type == 'checklist_toggle':
            await self.handle_checklist_toggle(data)

        else:
            await self.send_error(f"Tipo de mensaje desconocido: {msg_type}")

    async def handle_text_update(self, data):
        field = data.get('field')
        value = data.get('value', '')
        allowed = self.EDITABLE_FIELDS.get(self.content_type, [])

        if field not in allowed:
            await self.send_error(f"Campo '{field}' no editable en {self.content_type}.")
            return

        # Persistir en BD
        saved = await self.save_field(field, value)
        if not saved:
            await self.send_error('No se pudo guardar el cambio.')
            return

        # Broadcast al resto del grupo
        await self.channel_layer.group_send(self.group_name, {
            'type': 'broadcast_event',
            'payload': {
                'type': 'text_update',
                'field': field,
                'value': value,
                'user_id': str(self.user.id),
                'username': self.user.username,
            },
            'exclude_channel': self.channel_name,
        })

    async def handle_checklist_toggle(self, data):
        """Solo válido para content_type == 'checklist'. Hace toggle de un ítem."""
        if self.content_type != 'checklist':
            await self.send_error('checklist_toggle solo está disponible para checklists.')
            return

        item_id = data.get('item_id')
        if not item_id:
            await self.send_error('Falta item_id.')
            return

        result = await self.toggle_checklist_item(item_id)
        if not result:
            await self.send_error('Ítem no encontrado.')
            return

        await self.channel_layer.group_send(self.group_name, {
            'type': 'broadcast_event',
            'payload': {
                'type': 'checklist_toggle',
                'item_id': str(item_id),
                'is_checked': result['is_checked'],
                'user_id': str(self.user.id),
                'username': self.user.username,
            },
            'exclude_channel': None,  # broadcast a TODOS incluyendo emisor
        })

    # ------------------------------------------------------------------
    # Channel layer event handlers
    # ------------------------------------------------------------------

    async def broadcast_event(self, event):
        """Recibe un evento del grupo y lo envía al WebSocket del cliente."""
        if event.get('exclude_channel') == self.channel_name:
            return
        await self.send(text_data=json.dumps(event['payload']))

    # ------------------------------------------------------------------
    # DB helpers (sync → async)
    # ------------------------------------------------------------------

    @database_sync_to_async
    def check_membership(self):
        from .models import Relationship
        return Relationship.objects.filter(
            id=self.relationship_id,
            members=self.user,
            is_active=True,
        ).exists()

    @database_sync_to_async
    def save_field(self, field, value):
        from .models import Note, SharedList, Checklist
        model_map = {'note': Note, 'list': SharedList, 'checklist': Checklist}
        model = model_map.get(self.content_type)
        if not model:
            return False
        try:
            obj = model.objects.get(id=self.content_id, relationship_id=self.relationship_id)
            setattr(obj, field, value)
            obj.save(update_fields=[field, 'updated_at'])
            return True
        except model.DoesNotExist:
            return False

    @database_sync_to_async
    def toggle_checklist_item(self, item_id):
        from .models import ChecklistItem
        try:
            item = ChecklistItem.objects.get(id=item_id, checklist_id=self.content_id)
            item.toggle(self.user)
            return {'is_checked': item.is_checked}
        except ChecklistItem.DoesNotExist:
            return None

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    async def send_error(self, message):
        await self.send(text_data=json.dumps({'type': 'error', 'message': message}))