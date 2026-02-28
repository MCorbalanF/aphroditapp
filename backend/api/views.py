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
from django.http import JsonResponse
import re
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import ListAPIView

from .models import (
    User, Relationship, RelationshipInvitation, Notification,
    Note, SharedList, SharedListItem, Checklist, ChecklistItem,
    Event, Media, Nickname, RelationshipType
)
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    RelationshipListSerializer, RelationshipDetailSerializer, RelationshipCreateSerializer,
    InvitationSerializer, InvitationCreateSerializer,
    NotificationSerializer, NicknameSerializer,
    ContentCreateSerializer, DashboardSerializer,UserSearchSerializer,
    NoteSerializer, SharedListSerializer, SharedListItemSerializer,
    ChecklistSerializer, ChecklistItemSerializer, EventSerializer, MediaSerializer, RelationshipTypeSerializer
)
from .permissions import IsRelationshipMember, IsRelationshipOwner
from rest_framework.exceptions import ValidationError

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


def get_tokens_for_user(user):
    """Genera access + refresh JWT tokens."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def landing(request):
    from django.conf import settings
    installed = getattr(settings, 'INSTALLED_APPS', [])
    auth_methods = [{
        'id': 'credentials', 'label': 'Usuario y contraseña', 'type': 'form',
        'endpoints': {'login': '/api/auth/login/', 'register': '/api/auth/register/'},
        'enabled': True,
    }]
    if 'allauth.socialaccount.providers.google' in installed:
        auth_methods.append({
            'id': 'google', 'label': 'Google', 'type': 'oauth2',
            'endpoint': '/api/auth/social/google/', 'enabled': True,
        })
    return success({
        'app': 'Couples & Friends API', 'version': '1.0.0',
        'auth_methods': auth_methods,
        'token_auth': {'type': 'JWT', 'scheme': 'Bearer', 'format': 'Bearer <token>'},
    })


class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Error de validación', errors=serializer.errors)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return success({'tokens': tokens, 'user': UserProfileSerializer(user).data}, status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error('Credenciales incorrectas', errors=serializer.errors, status_code=status.HTTP_401_UNAUTHORIZED)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        relationships = user.relationships.filter(is_active=True).order_by('-created_at')
        notifications = user.notifications.order_by('-created_at')[:20]
        pending_invitations = user.invitations_received.filter(status='pending')
        return success({
            'tokens': tokens, 'user': UserProfileSerializer(user).data,
            'relationships': RelationshipListSerializer(relationships, many=True, context={'request': request}).data,
            'notifications': NotificationSerializer(notifications, many=True).data,
            'pending_invitations': InvitationSerializer(pending_invitations, many=True, context={'request': request}).data,
            'unread_notification_count': user.notifications.filter(is_read=False).count(),
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh = request.data.get('refresh')
            if refresh:
                RefreshToken(refresh).blacklist()
        except: pass
        return success({'message': 'Sesión cerrada.'})


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        relationships = user.relationships.filter(is_active=True).select_related('relationship_type').order_by('-created_at')
        notifications = user.notifications.order_by('-created_at')[:30]
        pending_invitations = user.invitations_received.filter(status='pending', expires_at__gt=timezone.now()).select_related('sent_by', 'relationship')
        return success({
            'user': UserProfileSerializer(user).data,
            'relationships': RelationshipListSerializer(relationships, many=True, context={'request': request}).data,
            'notifications': NotificationSerializer(notifications, many=True).data,
            'pending_invitations': InvitationSerializer(pending_invitations, many=True, context={'request': request}).data,
            'unread_notification_count': user.notifications.filter(is_read=False).count(),
        })


class RelationshipListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        rels = request.user.relationships.filter(is_active=True).select_related('relationship_type').order_by('-created_at')
        return success(RelationshipListSerializer(rels, many=True, context={'request': request}).data)
    def post(self, request):
        serializer = RelationshipCreateSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error('Error al crear', errors=serializer.errors)
        relationship = serializer.save()
        return success(RelationshipListSerializer(relationship, context={'request': request}).data, status.HTTP_201_CREATED)


class RelationshipDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def get(self, request, relationship_id):
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        rel = Relationship.objects.prefetch_related('memberships__user', 'nicknames__given_by', 'nicknames__given_to', 'note_items', 'sharedlist_items__items', 'checklist_items__items', 'event_items', 'media_items').get(id=relationship_id)
        return success(RelationshipDetailSerializer(rel, context={'request': request}).data)
    def patch(self, request, relationship_id):
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        serializer = RelationshipCreateSerializer(rel, data=request.data, partial=True, context={'request': request})
        if not serializer.is_valid(): return error('Error', errors=serializer.errors)
        serializer.save()
        return success(serializer.data)


class InviteToRelationshipView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def post(self, request, relationship_id):
        serializer = InvitationCreateSerializer(data={**request.data, 'relationship_id': relationship_id}, context={'request': request})
        if not serializer.is_valid(): return error('Error', errors=serializer.errors)
        invitation = serializer.save()
        return success(InvitationSerializer(invitation, context={'request': request}).data, status.HTTP_201_CREATED)


class InvitationRespondView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, invitation_id):
        try:
            invitation = RelationshipInvitation.objects.get(id=invitation_id, sent_to=request.user)
        except: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        if invitation.status != 'pending': return error(f'Ya fue {invitation.get_status_display().lower()}.')
        if invitation.expires_at < timezone.now():
            invitation.status = 'expired'
            invitation.save()
            return error('Expirada.')
        action = request.data.get('action')
        if action == 'accept':
            invitation.accept()
            return success({'message': f"Unido a '{invitation.relationship.name}'!"})
        elif action == 'reject':
            invitation.reject()
            return success({'message': 'Rechazada.'})
        return error('action debe ser accept o reject.')


class NicknameView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def get(self, request, relationship_id):
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        nicknames = rel.nicknames.select_related('given_by', 'given_to').all()
        return success(NicknameSerializer(nicknames, many=True, context={'request': request}).data)
    def post(self, request, relationship_id):
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        serializer = NicknameSerializer(data=request.data, context={'request': request, 'relationship': rel})
        if not serializer.is_valid(): return error('Error', errors=serializer.errors)
        nickname = serializer.save()
        return success(NicknameSerializer(nickname, context={'request': request}).data, status.HTTP_201_CREATED)


class ContentView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def get(self, request, relationship_id):
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        return success({
            'notes': NoteSerializer(rel.note_items.all(), many=True).data,
            'lists': SharedListSerializer(rel.sharedlist_items.prefetch_related('items').all(), many=True).data,
            'checklists': ChecklistSerializer(rel.checklist_items.prefetch_related('items').all(), many=True).data,
            'events': EventSerializer(rel.event_items.all(), many=True).data,
            'media': MediaSerializer(rel.media_items.all(), many=True).data,
        })
    def post(self, request, relationship_id):
        rel = get_relationship_or_404(relationship_id, request.user)
        if not rel: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        serializer = ContentCreateSerializer(data=request.data, context={'request': request, 'relationship': rel})
        if not serializer.is_valid(): return error('Error', errors=serializer.errors)
        obj = serializer.save()
        members = rel.members.exclude(id=request.user.id)
        ct = serializer.validated_data['content_type']
        type_label = {'note': 'una nota', 'list': 'una lista', 'checklist': 'un checklist', 'event': 'un evento', 'media': 'media'}.get(ct, 'contenido')
        for member in members:
            Notification.objects.create(recipient=member, notification_type='new_content', title=f"{request.user.username} añadió {type_label}", body=getattr(obj, 'title', '') or '', related_relationship=rel)
        serializer_map = {'note': NoteSerializer, 'list': SharedListSerializer, 'checklist': ChecklistSerializer, 'event': EventSerializer, 'media': MediaSerializer}
        return_serializer = serializer_map[ct](obj)
        return success({'content_type': ct, 'item': return_serializer.data}, status.HTTP_201_CREATED)


MODEL_MAP = {'note': (Note, NoteSerializer), 'list': (SharedList, SharedListSerializer), 'checklist': (Checklist, ChecklistSerializer), 'event': (Event, EventSerializer), 'media': (Media, MediaSerializer)}

class ContentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def _get_object(self, content_type, pk, relationship_id):
        if content_type not in MODEL_MAP: return None, None, 'Tipo inválido.'
        model, serializer_class = MODEL_MAP[content_type]
        try:
            obj = model.objects.get(id=pk, relationship_id=relationship_id)
            return obj, serializer_class, None
        except model.DoesNotExist: return None, None, 'No encontrado.'
    def get(self, request, relationship_id, content_type, pk):
        obj, sc, err = self._get_object(content_type, pk, relationship_id)
        if err: return error(err, status.HTTP_404_NOT_FOUND)
        return success(sc(obj).data)
    def patch(self, request, relationship_id, content_type, pk):
        obj, sc, err = self._get_object(content_type, pk, relationship_id)
        if err: return error(err, status.HTTP_404_NOT_FOUND)
        serializer = sc(obj, data=request.data, partial=True)
        if not serializer.is_valid(): return error('Error', errors=serializer.errors)
        serializer.save()
        return success(serializer.data)
    def delete(self, request, relationship_id, content_type, pk):
        obj, _, err = self._get_object(content_type, pk, relationship_id)
        if err: return error(err, status.HTTP_404_NOT_FOUND)
        obj.delete()
        return success({'message': 'Eliminado.'})


class ChecklistItemToggleView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def post(self, request, relationship_id, pk, item_pk):
        try: item = ChecklistItem.objects.get(id=item_pk, checklist_id=pk)
        except: return error('No encontrado.', status.HTTP_404_NOT_FOUND)
        item.toggle(request.user)
        return success(ChecklistItemSerializer(item).data)


class ChecklistItemView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def post(self, request, relationship_id, pk):
        try: checklist = Checklist.objects.get(id=pk, relationship_id=relationship_id)
        except: return error('No encontrado.', status.HTTP_404_NOT_FOUND)
        text = request.data.get('text', '').strip()
        if not text: return error('Texto vacío.')
        order = checklist.items.count()
        item = ChecklistItem.objects.create(checklist=checklist, text=text, order=order)
        return success(ChecklistItemSerializer(item).data, status.HTTP_201_CREATED)
    def delete(self, request, relationship_id, pk, item_pk):
        try: item = ChecklistItem.objects.get(id=item_pk, checklist_id=pk)
        except: return error('No encontrado.', status.HTTP_404_NOT_FOUND)
        item.delete()
        return success({'message': 'Eliminado.'})


class SharedListItemView(APIView):
    permission_classes = [IsAuthenticated, IsRelationshipMember]
    def post(self, request, relationship_id, pk):
        try: shared_list = SharedList.objects.get(id=pk, relationship_id=relationship_id)
        except: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        text = request.data.get('text', '').strip()
        if not text: return error('Texto vacío.')
        order = shared_list.items.count()
        item = SharedListItem.objects.create(shared_list=shared_list, text=text, order=order, added_by=request.user)
        return success(SharedListItemSerializer(item).data, status.HTTP_201_CREATED)
    def delete(self, request, relationship_id, pk, item_pk):
        try: item = SharedListItem.objects.get(id=item_pk, shared_list_id=pk)
        except: return error('No encontrado.', status.HTTP_404_NOT_FOUND)
        item.delete()
        return success({'message': 'Eliminado.'})


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        qs = request.user.notifications.all()
        if request.query_params.get('unread') == 'true': qs = qs.filter(is_read=False)
        return success({'notifications': NotificationSerializer(qs[:50], many=True).data, 'unread_count': request.user.notifications.filter(is_read=False).count()})
    def post(self, request):
        request.user.notifications.filter(is_read=False).update(is_read=True, read_at=timezone.now())
        return success({'message': 'Todas marcadas.'})


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, notification_id):
        try: notif = Notification.objects.get(id=notification_id, recipient=request.user)
        except: return error('No encontrada.', status.HTTP_404_NOT_FOUND)
        notif.mark_as_read()
        return success(NotificationSerializer(notif).data)


class RelationshipTypeListView(ListAPIView):
    """
    Devuelve todos los tipos de relación.
    """
    queryset = RelationshipType.objects.all().order_by("name")
    serializer_class = RelationshipTypeSerializer
    permission_classes = [AllowAny]
    
class UserSearchView(ListAPIView):
    """
    Search users by:
    - phone (only digits)
    - email (contains @)
    - username (alphanumeric mix)
    """
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get("query", "").strip()

        if not query:
            raise ValidationError({"query": "Query parameter is required."})

        if len(query) < 3:
            raise ValidationError({"query": "Query must be at least 3 characters long."})

        base_queryset = User.objects.all()

        # Excluir usuario actual
        if self.request.user.is_authenticated:
            base_queryset = base_queryset.exclude(id=self.request.user.id)

        # Solo números → phone
        if query.isdigit():
            return base_queryset.filter(phone__icontains=query)

        # Contiene arroba → email
        if "@" in query:
            return base_queryset.filter(email__icontains=query)

        # Mezcla letras/números → username
        return base_queryset.filter(username__icontains=query)
    
def health(request):
    return JsonResponse({"status": "ok"})