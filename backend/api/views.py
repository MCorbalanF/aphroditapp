"""
views.py — Couples & Friends App
=================================
Endpoints implementados:
  GET  /                          → landing (auth methods disponibles)
  POST /auth/register/            → registro
  POST /auth/login/               → login (devuelve token)
  POST /auth/logout/              → logout

  GET  /dashboard/                → relaciones + notificaciones + invitaciones pendientes

  GET  /relationships/            → listar relaciones del usuario
  POST /relationships/            → crear relación
  GET  /relationships/<id>/       → detalle completo de una relación
  PATCH/PUT /relationships/<id>/  → editar relación

  POST /relationships/<id>/invite/                → invitar a alguien
  POST /invitations/<id>/respond/                 → aceptar o rechazar
  POST /relationships/<id>/nicknames/             → crear/actualizar apodo
  GET  /relationships/<id>/nicknames/             → listar apodos de la relación

  POST /relationships/<id>/content/               → crear cualquier contenido
  GET  /relationships/<id>/content/               → listar todo el contenido
  PATCH /relationships/<id>/content/<type>/<pk>/  → editar contenido
  DELETE /relationships/<id>/content/<type>/<pk>/ → borrar contenido

  PATCH /relationships/<id>/checklist/<pk>/items/<item_pk>/toggle/  → toggle checkbox
  POST  /relationships/<id>/checklist/<pk>/items/                   → añadir ítem
  DELETE /relationships/<id>/checklist/<pk>/items/<item_pk>/        → borrar ítem

  POST  /relationships/<id>/lists/<pk>/items/                       → añadir ítem a lista
  DELETE /relationships/<id>/lists/<pk>/items/<item_pk>/            → borrar ítem de lista

  GET  /notifications/            → listar notificaciones
  POST /notifications/read-all/   → marcar todas como leídas
  PATCH /notifications/<id>/read/ → marcar una como leída
"""

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import (
    User, Relationship, RelationshipInvitation, Notification,
    Note, SharedList, SharedListItem, Checklist, ChecklistItem,
    Event, Media, Nickname,
)
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    RelationshipListSerializer, RelationshipDetailSerializer, RelationshipCreateSerializer,
    InvitationSerializer, InvitationCreateSerializer,
    NotificationSerializer, NicknameSerializer,
    ContentCreateSerializer, DashboardSerializer,
    NoteSerializer, SharedListSerializer, SharedListItemSerializer,
    ChecklistSerializer, ChecklistItemSerializer, EventSerializer, MediaSerializer,
)
from .permissions import IsRelationshipMember, IsRelationshipOwner


# ==============================================================================
# HELPERS
# ==============================================================================

def success(data, status_code=status.HTTP_200_OK):
    return Response({'success': True, 'data': data}, status=status_code)


def error(message, status_code=status.HTTP_400_BAD_REQUEST, errors=None):
    payload = {'success': False, 'message': message}
    if errors:
        payload['errors'] = errors
    return Response(payload, status=status_code)


def get_relationship_or_404(relationship_id, user):
    try:
        return Relationship.objects.get(id=relationship_id, members=user, is_active=True)
    except Relationship.DoesNotExist:
        return None


# ==============================================================================
# LANDING — Métodos de autenticación disponibles
# ==============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def landing(request):
    """
    Devuelve dinámicamente los métodos de autenticación disponibles
    según la configuración del backend.
    """
    from django.conf import settings

    auth_methods = []

    # Auth básica siempre disponible
    auth_methods.append({
        'id': 'credentials',
        'label': 'Usuario y contraseña',
        'type': 'form',
        'endpoints': {
            'login': '/api/auth/login/',
            'register': '/api/auth/register/',
        },
        'fields': ['username', 'password'],
        'enabled': True,
    })

    # Social auth — detecta si allauth/social está instalado
    installed = getattr(settings, 'INSTALLED_APPS', [])

    if 'allauth.socialaccount.providers.google' in installed:
        auth_methods.append({
            'id': 'google',
            'label': 'Google',
            'type': 'oauth2',
            'endpoint': '/api/auth/social/google/',
            'icon': 'google',
            'enabled': True,
        })

    if 'allauth.socialaccount.providers.apple' in installed:
        auth_methods.append({
            'id': 'apple',
            'label': 'Apple',
            'type': 'oauth2',
            'endpoint': '/api/auth/social/apple/',
            'icon': 'apple',
            'enabled': True,
        })

    # JWT disponible si simplejwt está instalado
    jwt_available = 'rest_framework_simplejwt' in installed
    token_auth = {
        'type': 'token',
        'scheme': 'JWT' if jwt_available else 'Token',
        'header': 'Authorization',
        'format': 'JWT <token>' if jwt_available else 'Token <token>',
    }

    return success({
        'app': 'Couples & Friends API',
        'version': '1.0.0',
        'auth_methods': auth_methods,
        'token_auth': token_auth,
        'endpoints': {
            'register': '/api/auth/register/',
            'login': '/api/auth/login/',
            'logout': '/api/auth/logout/',
            'dashboard': '/api/dashboard/',
        },
    })


# ==============================================================================
# AUTH
# ==============================================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Error de validación', errors=serializer.errors)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return success({
            'token': token.key,
            'user': UserProfileSerializer(user).data,
        }, status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Credenciales incorrectas', errors=serializer.errors, status_code=status.HTTP_401_UNAUTHORIZED)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        # Dashboard data incluido en el login para reducir requests
        relationships = user.relationships.filter(is_active=True).order_by('-created_at')
        notifications = user.notifications.order_by('-created_at')[:20]
        pending_invitations = user.invitations_received.filter(status='pending')

        return success({
            'token': token.key,
            'user': UserProfileSerializer(user).data,
            'relationships': RelationshipListSerializer(relationships, many=True, context={'request': request}).data,
            'notifications': NotificationSerializer(notifications, many=True).data,
            'pending_invitations': InvitationSerializer(pending_invitations, many=True, context={'request': request}).data,
            'unread_notification_count': user.notifications.filter(is_read=False).count(),
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return success({'message': 'Sesión cerrada correctamente.'})


# ==============================================================================
# DASHBOARD
# ==============================================================================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        relationships = user.relationships.filter(is_active=True).select_related('relationship_type').order_by('-created_at')
        notifications = user.notifications.order_by('-created_at')[:30]
        pending_invitations = user.invitations_received.filter(
            status='pending', expires_at__gt=timezone.now()
        ).select_related('sent_by', 'relationship')

        return success({
            'user': UserProfileSerializer(user).data,
            'relationships': RelationshipListSerializer(relationships, many=True, context={'request': request}).data,
            'notifications': NotificationSerializer(notifications, many=True).data,
            'pending_invitations': InvitationSerializer(pending_invitations, many=True, context={'request': request}).data,
            'unread_notification_count': user.notifications.filter(is_read=False).count(),
        })


# ==============================================================================
# RELATIONSHIPS
# ==============================================================================

class RelationshipListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Lista todas las relaciones activas del usuario."""
        rels = request.user.relationships.filter(is_active=True).select_related('relationship_type').order_by('-created_at')
        return success(RelationshipListSerializer(rels, many=True, context={'request': request}).data)

    def post(self, request):
        """Crea una nueva relación. El creador se añade automáticamente como owner."""
        serializer = RelationshipCreateSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error('Error al crear la relación', errors=serializer.errors)
        relationship = serializer.save()
        return success(RelationshipListSerializer(relationship, context={'request': request}).data, status.HTTP_201_CREATED)


class RelationshipDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def get(self, request, relationship_id):
        """Devuelve toda la información de una relación: miembros, contenido, apodos..."""
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel:
            return error('Relación no encontrada.', status.HTTP_404_NOT_FOUND)

        rel = Relationship.objects.prefetch_related(
            'memberships__user',
            'nicknames__given_by',
            'nicknames__given_to',
            'note_items',
            'sharedlist_items__items',
            'checklist_items__items',
            'event_items',
            'media_items',
        ).get(id=relationship_id)

        return success(RelationshipDetailSerializer(rel, context={'request': request}).data)

    def patch(self, request, relationship_id):
        """Editar nombre, tipo, imagen o fecha de la relación."""
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel:
            return error('Relación no encontrada.', status.HTTP_404_NOT_FOUND)
        serializer = RelationshipCreateSerializer(rel, data=request.data, partial=True, context={'request': request})
        if not serializer.is_valid():
            return error('Error al actualizar', errors=serializer.errors)
        serializer.save()
        return success(serializer.data)


# ==============================================================================
# INVITATIONS
# ==============================================================================

class InviteToRelationshipView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def post(self, request, relationship_id):
        """Invita a un usuario a la relación por username o email."""
        serializer = InvitationCreateSerializer(data={**request.data, 'relationship_id': relationship_id}, context={'request': request})
        if not serializer.is_valid():
            return error('Error en la invitación', errors=serializer.errors)
        invitation = serializer.save()
        return success(InvitationSerializer(invitation, context={'request': request}).data, status.HTTP_201_CREATED)


class InvitationRespondView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invitation_id):
        """
        Acepta o rechaza una invitación.
        Body: { "action": "accept" | "reject" }
        """
        try:
            invitation = RelationshipInvitation.objects.get(id=invitation_id, sent_to=request.user)
        except RelationshipInvitation.DoesNotExist:
            return error('Invitación no encontrada.', status.HTTP_404_NOT_FOUND)

        if invitation.status != 'pending':
            return error(f'Esta invitación ya fue {invitation.get_status_display().lower()}.')

        if invitation.expires_at < timezone.now():
            invitation.status = 'expired'
            invitation.save()
            return error('Esta invitación ha expirado.')

        action = request.data.get('action')
        if action == 'accept':
            invitation.accept()
            return success({'message': f"Te has unido a '{invitation.relationship.name}'!"})
        elif action == 'reject':
            invitation.reject()
            return success({'message': 'Invitación rechazada.'})
        else:
            return error('action debe ser "accept" o "reject".')


# ==============================================================================
# NICKNAMES
# ==============================================================================

class NicknameView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def get(self, request, relationship_id):
        """Lista todos los apodos de la relación."""
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel:
            return error('Relación no encontrada.', status.HTTP_404_NOT_FOUND)
        nicknames = rel.nicknames.select_related('given_by', 'given_to').all()
        return success(NicknameSerializer(nicknames, many=True, context={'request': request}).data)

    def post(self, request, relationship_id):
        """Crea o actualiza el apodo que el usuario le da a otro en esta relación."""
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel:
            return error('Relación no encontrada.', status.HTTP_404_NOT_FOUND)
        serializer = NicknameSerializer(data=request.data, context={'request': request, 'relationship': rel})
        if not serializer.is_valid():
            return error('Error al guardar el apodo', errors=serializer.errors)
        nickname = serializer.save()
        return success(NicknameSerializer(nickname, context={'request': request}).data, status.HTTP_201_CREATED)


# ==============================================================================
# CONTENT — Crear y listar
# ==============================================================================

class ContentView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def get(self, request, relationship_id):
        """Devuelve todo el contenido de la relación separado por tipo."""
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel:
            return error('Relación no encontrada.', status.HTTP_404_NOT_FOUND)

        return success({
            'notes': NoteSerializer(rel.note_items.all(), many=True).data,
            'lists': SharedListSerializer(rel.sharedlist_items.prefetch_related('items').all(), many=True).data,
            'checklists': ChecklistSerializer(rel.checklist_items.prefetch_related('items').all(), many=True).data,
            'events': EventSerializer(rel.event_items.all(), many=True).data,
            'media': MediaSerializer(rel.media_items.all(), many=True).data,
        })

    def post(self, request, relationship_id):
        """Crea cualquier tipo de contenido en la relación."""
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel:
            return error('Relación no encontrada.', status.HTTP_404_NOT_FOUND)

        serializer = ContentCreateSerializer(data=request.data, context={'request': request, 'relationship': rel})
        if not serializer.is_valid():
            return error('Error al crear el contenido', errors=serializer.errors)

        obj = serializer.save()

        # Notificar al resto de miembros
        members = rel.members.exclude(id=request.user.id)
        ct = serializer.validated_data['content_type']
        type_label = {'note': 'una nota', 'list': 'una lista', 'checklist': 'un checklist', 'event': 'un evento', 'media': 'media'}.get(ct, 'contenido')
        for member in members:
            Notification.objects.create(
                recipient=member,
                notification_type='new_content',
                title=f"{request.user.username} añadió {type_label}",
                body=getattr(obj, 'title', '') or '',
                related_relationship=rel,
            )

        # Devolver el objeto serializado con el tipo correcto
        serializer_map = {
            'note': NoteSerializer,
            'list': SharedListSerializer,
            'checklist': ChecklistSerializer,
            'event': EventSerializer,
            'media': MediaSerializer,
        }
        return_serializer = serializer_map[ct](obj)
        return success({'content_type': ct, 'item': return_serializer.data}, status.HTTP_201_CREATED)


# ==============================================================================
# CONTENT — Editar y borrar por tipo
# ==============================================================================

MODEL_MAP = {
    'note': (Note, NoteSerializer),
    'list': (SharedList, SharedListSerializer),
    'checklist': (Checklist, ChecklistSerializer),
    'event': (Event, EventSerializer),
    'media': (Media, MediaSerializer),
}


class ContentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def _get_object(self, content_type, pk, relationship_id):
        if content_type not in MODEL_MAP:
            return None, None, 'Tipo de contenido no válido.'
        model, serializer_class = MODEL_MAP[content_type]
        try:
            obj = model.objects.get(id=pk, relationship_id=relationship_id)
            return obj, serializer_class, None
        except model.DoesNotExist:
            return None, None, 'Contenido no encontrado.'

    def get(self, request, relationship_id, content_type, pk):
        obj, serializer_class, err = self._get_object(content_type, pk, relationship_id)
        if err:
            return error(err, status.HTTP_404_NOT_FOUND)
        return success(serializer_class(obj).data)

    def patch(self, request, relationship_id, content_type, pk):
        obj, serializer_class, err = self._get_object(content_type, pk, relationship_id)
        if err:
            return error(err, status.HTTP_404_NOT_FOUND)
        serializer = serializer_class(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return error('Error al actualizar', errors=serializer.errors)
        serializer.save()
        return success(serializer.data)

    def delete(self, request, relationship_id, content_type, pk):
        obj, _, err = self._get_object(content_type, pk, relationship_id)
        if err:
            return error(err, status.HTTP_404_NOT_FOUND)
        obj.delete()
        return success({'message': 'Eliminado correctamente.'})


# ==============================================================================
# CHECKLIST ITEMS — Toggle, añadir, borrar
# ==============================================================================

class ChecklistItemToggleView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def post(self, request, relationship_id, pk, item_pk):
        """Alterna el estado de un ítem de checklist. Ideal para llamar en tiempo real."""
        try:
            item = ChecklistItem.objects.get(id=item_pk, checklist_id=pk)
        except ChecklistItem.DoesNotExist:
            return error('Ítem no encontrado.', status.HTTP_404_NOT_FOUND)
        item.toggle(request.user)
        return success(ChecklistItemSerializer(item).data)


class ChecklistItemView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def post(self, request, relationship_id, pk):
        """Añade un ítem a un checklist existente."""
        try:
            checklist = Checklist.objects.get(id=pk, relationship_id=relationship_id)
        except Checklist.DoesNotExist:
            return error('Checklist no encontrado.', status.HTTP_404_NOT_FOUND)
        text = request.data.get('text', '').strip()
        if not text:
            return error('El texto no puede estar vacío.')
        order = checklist.items.count()
        item = ChecklistItem.objects.create(checklist=checklist, text=text, order=order)
        return success(ChecklistItemSerializer(item).data, status.HTTP_201_CREATED)

    def delete(self, request, relationship_id, pk, item_pk):
        try:
            item = ChecklistItem.objects.get(id=item_pk, checklist_id=pk)
        except ChecklistItem.DoesNotExist:
            return error('Ítem no encontrado.', status.HTTP_404_NOT_FOUND)
        item.delete()
        return success({'message': 'Ítem eliminado.'})


# ==============================================================================
# SHARED LIST ITEMS — Añadir y borrar
# ==============================================================================

class SharedListItemView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]

    def post(self, request, relationship_id, pk):
        """Añade un ítem a una lista existente."""
        try:
            shared_list = SharedList.objects.get(id=pk, relationship_id=relationship_id)
        except SharedList.DoesNotExist:
            return error('Lista no encontrada.', status.HTTP_404_NOT_FOUND)
        text = request.data.get('text', '').strip()
        if not text:
            return error('El texto no puede estar vacío.')
        order = shared_list.items.count()
        item = SharedListItem.objects.create(shared_list=shared_list, text=text, order=order, added_by=request.user)
        return success(SharedListItemSerializer(item).data, status.HTTP_201_CREATED)

    def delete(self, request, relationship_id, pk, item_pk):
        try:
            item = SharedListItem.objects.get(id=item_pk, shared_list_id=pk)
        except SharedListItem.DoesNotExist:
            return error('Ítem no encontrado.', status.HTTP_404_NOT_FOUND)
        item.delete()
        return success({'message': 'Ítem eliminado.'})


# ==============================================================================
# NOTIFICATIONS
# ==============================================================================

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Lista las notificaciones del usuario. ?unread=true para solo las no leídas."""
        qs = request.user.notifications.all()
        if request.query_params.get('unread') == 'true':
            qs = qs.filter(is_read=False)
        return success({
            'notifications': NotificationSerializer(qs[:50], many=True).data,
            'unread_count': request.user.notifications.filter(is_read=False).count(),
        })

    def post(self, request):
        """Marcar todas las notificaciones como leídas."""
        now = timezone.now()
        request.user.notifications.filter(is_read=False).update(is_read=True, read_at=now)
        return success({'message': 'Todas las notificaciones marcadas como leídas.'})


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        """Marca una notificación concreta como leída."""
        try:
            notif = Notification.objects.get(id=notification_id, recipient=request.user)
        except Notification.DoesNotExist:
            return error('Notificación no encontrada.', status.HTTP_404_NOT_FOUND)
        notif.mark_as_read()
        return success(NotificationSerializer(notif).data)