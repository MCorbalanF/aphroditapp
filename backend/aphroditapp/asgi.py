"""
asgi.py — Configuración ASGI con Django Channels
=================================================
Reemplaza el asgi.py que genera Django por defecto.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Importar consumers después de configurar DJANGO_SETTINGS_MODULE
from api.consumers import ContentEditConsumer

websocket_urlpatterns = [
    path(
        'ws/relationship/<uuid:relationship_id>/content/<str:content_type>/<uuid:content_id>/',
        ContentEditConsumer.as_asgi(),
    ),
]

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})