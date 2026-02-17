"""
serializers.py — Couples & Friends App
"""
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers
from .models import (
    User, RelationshipType, Relationship, RelationshipMember,
    Nickname, RelationshipInvitation, Notification,
    Note, SharedList, SharedListItem, Checklist, ChecklistItem,
    Event, Media, ContentTypeRegistry,
)


# ==============================================================================
# AUTH
# ==============================================================================

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'phone']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden.'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'Este email ya está registrado.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Credenciales incorrectas.')
        if not user.is_active:
            raise serializers.ValidationError('Esta cuenta está desactivada.')
        data['user'] = user
        return data


# ==============================================================================
# USERS
# ==============================================================================

class UserMiniSerializer(serializers.ModelSerializer):
    """Serializer compacto para usar dentro de otros (ej: miembros de relación)."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'bio', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']


# ==============================================================================
# NICKNAMES
# ==============================================================================

class NicknameSerializer(serializers.ModelSerializer):
    given_by = UserMiniSerializer(read_only=True)
    given_to = UserMiniSerializer(read_only=True)
    given_to_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Nickname
        fields = ['id', 'relationship', 'given_by', 'given_to', 'given_to_id', 'nickname', 'created_at']
        read_only_fields = ['id', 'given_by', 'created_at', 'relationship']

    def validate(self, data):
        relationship = self.context['relationship']
        request_user = self.context['request'].user
        given_to_id = data['given_to_id']

        # El usuario destino debe ser miembro de la relación
        if not relationship.members.filter(id=given_to_id).exists():
            raise serializers.ValidationError({'given_to_id': 'Este usuario no pertenece a la relación.'})
        # No puedes ponerte apodo a ti mismo
        if str(given_to_id) == str(request_user.id):
            raise serializers.ValidationError({'given_to_id': 'No puedes ponerte un apodo a ti mismo.'})
        return data

    def create(self, validated_data):
        given_to_id = validated_data.pop('given_to_id')
        given_to = User.objects.get(id=given_to_id)
        relationship = self.context['relationship']
        request_user = self.context['request'].user

        obj, _ = Nickname.objects.update_or_create(
            relationship=relationship,
            given_by=request_user,
            given_to=given_to,
            defaults={'nickname': validated_data['nickname']}
        )
        return obj


# ==============================================================================
# RELATIONSHIPS
# ==============================================================================

class RelationshipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelationshipType
        fields = ['id', 'name', 'icon', 'description']


class RelationshipMemberSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    nickname_for_me = serializers.SerializerMethodField()

    class Meta:
        model = RelationshipMember
        fields = ['id', 'user', 'role', 'joined_at', 'nickname_for_me']

    def get_nickname_for_me(self, obj):
        """Devuelve el apodo que el usuario actual le tiene puesto a este miembro."""
        request_user = self.context.get('request').user
        nick = Nickname.objects.filter(
            relationship=obj.relationship,
            given_by=request_user,
            given_to=obj.user,
        ).first()
        return nick.nickname if nick else None


class RelationshipListSerializer(serializers.ModelSerializer):
    """Serializer ligero para el listado de relaciones en el dashboard."""
    relationship_type = RelationshipTypeSerializer(read_only=True)
    member_count = serializers.IntegerField(source='members.count', read_only=True)
    members_preview = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Relationship
        fields = [
            'id', 'name', 'relationship_type', 'cover_image',
            'anniversary_date', 'is_active', 'created_at',
            'member_count', 'members_preview', 'my_role',
        ]

    def get_members_preview(self, obj):
        members = obj.memberships.select_related('user')[:3]
        return RelationshipMemberSerializer(members, many=True, context=self.context).data

    def get_my_role(self, obj):
        user = self.context['request'].user
        membership = obj.memberships.filter(user=user).first()
        return membership.role if membership else None


class RelationshipCreateSerializer(serializers.ModelSerializer):
    relationship_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RelationshipType.objects.all(), source='relationship_type', write_only=True
    )

    class Meta:
        model = Relationship
        fields = ['name', 'relationship_type_id', 'anniversary_date', 'cover_image']

    def create(self, validated_data):
        user = self.context['request'].user
        relationship = Relationship.objects.create(**validated_data)
        RelationshipMember.objects.create(relationship=relationship, user=user, role='owner')
        return relationship


# ==============================================================================
# INVITATIONS
# ==============================================================================

class InvitationSerializer(serializers.ModelSerializer):
    sent_by = UserMiniSerializer(read_only=True)
    sent_to = UserMiniSerializer(read_only=True)
    relationship = RelationshipListSerializer(read_only=True)

    class Meta:
        model = RelationshipInvitation
        fields = [
            'id', 'relationship', 'sent_by', 'sent_to',
            'invited_email', 'token', 'status', 'message',
            'expires_at', 'responded_at', 'created_at',
        ]
        read_only_fields = ['id', 'token', 'status', 'responded_at', 'created_at']


class InvitationCreateSerializer(serializers.Serializer):
    relationship_id = serializers.UUIDField()
    username_or_email = serializers.CharField(help_text='Username o email del destinatario')
    message = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        from datetime import timedelta
        request_user = self.context['request'].user
        rel_id = data['relationship_id']

        try:
            relationship = Relationship.objects.get(id=rel_id)
        except Relationship.DoesNotExist:
            raise serializers.ValidationError({'relationship_id': 'Relación no encontrada.'})

        if not relationship.memberships.filter(user=request_user).exists():
            raise serializers.ValidationError({'relationship_id': 'No perteneces a esta relación.'})

        val = data['username_or_email']
        sent_to = User.objects.filter(username=val).first() or User.objects.filter(email=val).first()

        if sent_to:
            if relationship.members.filter(id=sent_to.id).exists():
                raise serializers.ValidationError('Este usuario ya es miembro de la relación.')
            pending = RelationshipInvitation.objects.filter(
                relationship=relationship, sent_to=sent_to, status='pending'
            ).exists()
            if pending:
                raise serializers.ValidationError('Ya existe una invitación pendiente para este usuario.')

        data['relationship'] = relationship
        data['sent_to'] = sent_to
        data['expires_at'] = timezone.now() + timedelta(days=7)
        return data

    def create(self, validated_data):
        sent_to = validated_data.get('sent_to')
        invitation = RelationshipInvitation.objects.create(
            relationship=validated_data['relationship'],
            sent_by=self.context['request'].user,
            sent_to=sent_to,
            invited_email='' if sent_to else validated_data.get('username_or_email', ''),
            message=validated_data.get('message', ''),
            expires_at=validated_data['expires_at'],
        )
        # Crear notificación si el destinatario existe
        if sent_to:
            Notification.objects.create(
                recipient=sent_to,
                notification_type='invitation_received',
                title=f"{self.context['request'].user.username} te invitó a '{invitation.relationship.name}'",
                body=invitation.message,
                related_invitation=invitation,
                related_relationship=invitation.relationship,
            )
        return invitation


# ==============================================================================
# NOTIFICATIONS
# ==============================================================================

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'body',
            'is_read', 'read_at', 'action_url',
            'related_invitation', 'related_relationship', 'created_at',
        ]


# ==============================================================================
# CONTENT SERIALIZERS
# ==============================================================================

class NoteSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'body', 'color', 'is_pinned', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class SharedListItemSerializer(serializers.ModelSerializer):
    added_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = SharedListItem
        fields = ['id', 'text', 'order', 'added_by', 'created_at']
        read_only_fields = ['id', 'added_by', 'created_at']


class SharedListSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    items = SharedListItemSerializer(many=True, read_only=True)

    class Meta:
        model = SharedList
        fields = ['id', 'title', 'description', 'emoji', 'is_pinned', 'created_by', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ChecklistItemSerializer(serializers.ModelSerializer):
    checked_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = ChecklistItem
        fields = ['id', 'text', 'is_checked', 'checked_by', 'checked_at', 'order', 'created_at']
        read_only_fields = ['id', 'checked_by', 'checked_at', 'created_at']


class ChecklistSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)
    items = ChecklistItemSerializer(many=True, read_only=True)
    completion_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Checklist
        fields = ['id', 'title', 'description', 'is_pinned', 'created_by', 'items', 'completion_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class EventSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'start_datetime', 'end_datetime', 'is_all_day',
            'recurrence', 'reminder_minutes_before', 'color',
            'is_pinned', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class MediaSerializer(serializers.ModelSerializer):
    created_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = Media
        fields = [
            'id', 'title', 'media_type', 'file', 'thumbnail',
            'caption', 'duration_seconds', 'file_size_bytes',
            'mime_type', 'taken_at', 'location_lat', 'location_lng',
            'is_pinned', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


# ==============================================================================
# GENERIC CONTENT CREATE
# ==============================================================================

class ContentCreateSerializer(serializers.Serializer):
    """
    Serializer unificado para crear cualquier tipo de contenido.
    El campo 'type' determina qué modelo se crea.
    """
    CONTENT_TYPES = ['note', 'list', 'checklist', 'event', 'media']

    content_type = serializers.ChoiceField(choices=CONTENT_TYPES)
    title = serializers.CharField(required=False, allow_blank=True)

    # Note
    body = serializers.CharField(required=False, allow_blank=True)
    color = serializers.CharField(required=False, default='#FFFFFF')

    # List / Checklist
    description = serializers.CharField(required=False, allow_blank=True)
    emoji = serializers.CharField(required=False, allow_blank=True, max_length=5)
    items = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )

    # Event
    location = serializers.CharField(required=False, allow_blank=True)
    start_datetime = serializers.DateTimeField(required=False, allow_null=True)
    end_datetime = serializers.DateTimeField(required=False, allow_null=True)
    is_all_day = serializers.BooleanField(required=False, default=False)
    recurrence = serializers.ChoiceField(
        choices=['none', 'daily', 'weekly', 'monthly', 'yearly'],
        required=False, default='none'
    )
    reminder_minutes_before = serializers.IntegerField(required=False, default=60)
    event_color = serializers.CharField(required=False, default='#FF6B9D')

    # Media
    file = serializers.FileField(required=False, allow_null=True)
    media_type = serializers.ChoiceField(choices=['photo', 'video', 'audio'], required=False)
    caption = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        ct = data.get('content_type')
        if ct == 'note' and not data.get('body'):
            raise serializers.ValidationError({'body': 'Una nota requiere body.'})
        if ct == 'event' and not data.get('start_datetime'):
            raise serializers.ValidationError({'start_datetime': 'Un evento requiere start_datetime.'})
        if ct == 'media' and not data.get('file'):
            raise serializers.ValidationError({'file': 'Media requiere un fichero.'})
        if ct == 'media' and not data.get('media_type'):
            raise serializers.ValidationError({'media_type': 'Indica el tipo: photo, video o audio.'})
        return data

    def create(self, validated_data):
        relationship = self.context['relationship']
        user = self.context['request'].user
        ct = validated_data['content_type']
        common = {'relationship': relationship, 'created_by': user, 'title': validated_data.get('title', '')}

        if ct == 'note':
            return Note.objects.create(**common, body=validated_data['body'], color=validated_data.get('color', '#FFFFFF'))

        if ct == 'list':
            obj = SharedList.objects.create(**common, description=validated_data.get('description', ''), emoji=validated_data.get('emoji', ''))
            for i, text in enumerate(validated_data.get('items', [])):
                SharedListItem.objects.create(shared_list=obj, text=text, order=i, added_by=user)
            return obj

        if ct == 'checklist':
            obj = Checklist.objects.create(**common, description=validated_data.get('description', ''))
            for i, text in enumerate(validated_data.get('items', [])):
                ChecklistItem.objects.create(checklist=obj, text=text, order=i)
            return obj

        if ct == 'event':
            return Event.objects.create(
                **common,
                description=validated_data.get('description', ''),
                location=validated_data.get('location', ''),
                start_datetime=validated_data['start_datetime'],
                end_datetime=validated_data.get('end_datetime'),
                is_all_day=validated_data.get('is_all_day', False),
                recurrence=validated_data.get('recurrence', 'none'),
                reminder_minutes_before=validated_data.get('reminder_minutes_before', 60),
                color=validated_data.get('event_color', '#FF6B9D'),
            )

        if ct == 'media':
            return Media.objects.create(
                **common,
                file=validated_data['file'],
                media_type=validated_data['media_type'],
                caption=validated_data.get('caption', ''),
            )


# ==============================================================================
# RELATIONSHIP DETAIL — Todo el contenido de una relación
# ==============================================================================

class RelationshipDetailSerializer(serializers.ModelSerializer):
    relationship_type = RelationshipTypeSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    notes = NoteSerializer(many=True, source='note_items', read_only=True)
    lists = SharedListSerializer(many=True, source='sharedlist_items', read_only=True)
    checklists = ChecklistSerializer(many=True, source='checklist_items', read_only=True)
    events = EventSerializer(many=True, source='event_items', read_only=True)
    media = MediaSerializer(many=True, source='media_items', read_only=True)
    nicknames = NicknameSerializer(many=True, read_only=True)
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Relationship
        fields = [
            'id', 'name', 'relationship_type', 'cover_image',
            'anniversary_date', 'is_active', 'created_at',
            'my_role', 'members', 'nicknames',
            'notes', 'lists', 'checklists', 'events', 'media',
        ]

    def get_members(self, obj):
        memberships = obj.memberships.select_related('user').all()
        return RelationshipMemberSerializer(memberships, many=True, context=self.context).data

    def get_my_role(self, obj):
        user = self.context['request'].user
        membership = obj.memberships.filter(user=user).first()
        return membership.role if membership else None


# ==============================================================================
# DASHBOARD
# ==============================================================================

class DashboardSerializer(serializers.Serializer):
    """Serializer de respuesta del dashboard: relaciones + notificaciones + invitaciones."""
    user = UserProfileSerializer()
    relationships = RelationshipListSerializer(many=True)
    notifications = NotificationSerializer(many=True)
    pending_invitations = InvitationSerializer(many=True)
    unread_notification_count = serializers.IntegerField()