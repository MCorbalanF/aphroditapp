"""
Django Models — Couples & Friends Sharing App
==============================================
FIXES aplicados:
  ✅ ChecklistItem.check() → renombrado a mark_done() (conflicto con Model.check())
  ✅ User.groups/user_permissions → related_name para evitar clash con auth.User
  ✅ ImageField → FileField (sin Pillow obligatorio)
  ✅ Reaction: imports movidos al top-level, fuera de la clase
  ✅ ContentTypeRegistry renombrado (evitar conflicto con django.contenttypes)

REQUISITOS en settings.py:
  AUTH_USER_MODEL = 'api.User'   ← imprescindible para evitar el clash de User
  INSTALLED_APPS incluye 'django.contrib.contenttypes'
"""

import uuid
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils import timezone


# ==============================================================================
# USERS
# ==============================================================================

class User(AbstractUser):
    """
    Usuario custom. En settings.py: AUTH_USER_MODEL = 'api.User'
    related_name únicos en groups/user_permissions evitan el clash con auth.User.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # FileField en lugar de ImageField: no requiere Pillow instalado.
    # Cambia a ImageField si instalas: pip install Pillow
    avatar = models.FileField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # FIX: related_name únicos para no colisionar con auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        verbose_name='user permissions',
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.username


# ==============================================================================
# RELATIONSHIPS
# ==============================================================================

class RelationshipType(models.Model):
    """Tipo de relación extensible: pareja, amigos, familia, etc."""
    name = models.CharField(max_length=50, unique=True)
    icon = models.CharField(max_length=10, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tipo de relación'
        verbose_name_plural = 'Tipos de relación'

    def __str__(self):
        return self.name


class Relationship(models.Model):
    """El espacio compartido entre usuarios (2 o más)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, blank=True)
    relationship_type = models.ForeignKey(
        RelationshipType, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='relationships'
    )
    members = models.ManyToManyField(
        User,
        through='RelationshipMember',
        related_name='relationships'
    )
    cover_image = models.FileField(upload_to='relationships/covers/', blank=True, null=True)
    anniversary_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Relación'
        verbose_name_plural = 'Relaciones'

    def __str__(self):
        return self.name or f"Relación {self.id}"


class RelationshipMember(models.Model):
    """Tabla intermedia User ↔ Relationship con rol y fecha de ingreso."""
    ROLE_CHOICES = [
        ('owner', 'Propietario'),
        ('member', 'Miembro'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relationship = models.ForeignKey(Relationship, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('relationship', 'user')
        verbose_name = 'Miembro de relación'
        verbose_name_plural = 'Miembros de relación'

    def __str__(self):
        return f"{self.user.username} en {self.relationship}"


class Nickname(models.Model):
    """Apodo que un usuario le pone a otro dentro de una relación."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relationship = models.ForeignKey(Relationship, on_delete=models.CASCADE, related_name='nicknames')
    given_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='nicknames_given')
    given_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='nicknames_received')
    nickname = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('relationship', 'given_by', 'given_to')
        verbose_name = 'Apodo'
        verbose_name_plural = 'Apodos'

    def __str__(self):
        return f"{self.given_by.username} llama '{self.nickname}' a {self.given_to.username}"


# ==============================================================================
# INVITATIONS & NOTIFICATIONS
# ==============================================================================

class RelationshipInvitation(models.Model):
    """Invitación para unirse a una relación con token único y expiración."""
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptada'),
        ('rejected', 'Rechazada'),
        ('expired', 'Expirada'),
        ('cancelled', 'Cancelada'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relationship = models.ForeignKey(Relationship, on_delete=models.CASCADE, related_name='invitations')
    sent_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations_sent')
    sent_to = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='invitations_received',
        null=True, blank=True
    )
    invited_email = models.EmailField(blank=True)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)
    expires_at = models.DateTimeField()
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Invitación'
        verbose_name_plural = 'Invitaciones'

    def __str__(self):
        return f"Invitación de {self.sent_by.username} → {self.relationship}"

    def accept(self):
        """Acepta la invitación, añade al usuario y crea notificación."""
        if self.sent_to and self.status == 'pending':
            RelationshipMember.objects.get_or_create(
                relationship=self.relationship,
                user=self.sent_to,
                defaults={'role': 'member'}
            )
            self.status = 'accepted'
            self.responded_at = timezone.now()
            self.save()
            Notification.objects.create(
                recipient=self.sent_by,
                notification_type='invitation_accepted',
                title=f"{self.sent_to.username} aceptó tu invitación",
                body=f"Ya sois parte de '{self.relationship.name}'",
                related_invitation=self,
            )

    def reject(self):
        self.status = 'rejected'
        self.responded_at = timezone.now()
        self.save()


class Notification(models.Model):
    """Notificaciones in-app para los usuarios."""
    NOTIFICATION_TYPES = [
        ('invitation_received', 'Invitación recibida'),
        ('invitation_accepted', 'Invitación aceptada'),
        ('invitation_rejected', 'Invitación rechazada'),
        ('new_content', 'Nuevo contenido en relación'),
        ('event_reminder', 'Recordatorio de evento'),
        ('member_left', 'Miembro abandonó la relación'),
        ('content_reaction', 'Reacción en tu contenido'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    related_invitation = models.ForeignKey(
        RelationshipInvitation, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='notifications'
    )
    related_relationship = models.ForeignKey(
        Relationship, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='notifications'
    )
    action_url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'

    def __str__(self):
        return f"[{self.notification_type}] → {self.recipient.username}"

    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


# ==============================================================================
# CONTENT — Sistema extensible de contenido compartido
# ==============================================================================

class BaseContent(models.Model):
    """
    Clase base abstracta para todo el contenido compartido.
    Hereda de aquí para añadir nuevos tipos de contenido fácilmente.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    relationship = models.ForeignKey(
        Relationship, on_delete=models.CASCADE,
        related_name='%(class)s_items'
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='%(class)s_created'
    )
    title = models.CharField(max_length=200, blank=True)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class Reaction(models.Model):
    """
    Reacciones con emojis a cualquier contenido via GenericForeignKey.
    FIX: imports de contenttypes están al top del archivo, no dentro de la clase.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    emoji = models.CharField(max_length=10)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'emoji', 'content_type', 'object_id')
        verbose_name = 'Reacción'
        verbose_name_plural = 'Reacciones'

    def __str__(self):
        return f"{self.user.username} reaccionó {self.emoji}"


# ------------------------------------------------------------------------------
# NOTES
# ------------------------------------------------------------------------------

class Note(BaseContent):
    """Nota de texto libre con color de fondo."""
    body = models.TextField()
    color = models.CharField(max_length=7, default='#FFFFFF')

    class Meta(BaseContent.Meta):
        verbose_name = 'Nota'
        verbose_name_plural = 'Notas'

    def __str__(self):
        return self.title or f"Nota de {self.created_by}"


# ------------------------------------------------------------------------------
# LISTS
# ------------------------------------------------------------------------------

class SharedList(BaseContent):
    """Lista de texto compartida (deseos, películas, lugares...)."""
    description = models.TextField(blank=True)
    emoji = models.CharField(max_length=5, blank=True)

    class Meta(BaseContent.Meta):
        verbose_name = 'Lista'
        verbose_name_plural = 'Listas'

    def __str__(self):
        return self.title or f"Lista de {self.created_by}"


class SharedListItem(models.Model):
    """Ítem dentro de una SharedList."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shared_list = models.ForeignKey(SharedList, on_delete=models.CASCADE, related_name='items')
    text = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='list_items')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Ítem de lista'

    def __str__(self):
        return self.text


# ------------------------------------------------------------------------------
# CHECKLISTS
# ------------------------------------------------------------------------------

class Checklist(BaseContent):
    """Lista de verificación con checkboxes y % de completado."""
    description = models.TextField(blank=True)

    class Meta(BaseContent.Meta):
        verbose_name = 'Checklist'
        verbose_name_plural = 'Checklists'

    def __str__(self):
        return self.title or f"Checklist de {self.created_by}"

    @property
    def completion_percentage(self):
        total = self.items.count()
        if total == 0:
            return 0
        done = self.items.filter(is_checked=True).count()
        return round((done / total) * 100)


class ChecklistItem(models.Model):
    """
    Ítem con checkbox.
    FIX: método renombrado check() → mark_done() para no solapar
    con el classmethod Model.check() que usa Django internamente.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name='items')
    text = models.CharField(max_length=500)
    is_checked = models.BooleanField(default=False)
    checked_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='checked_items'
    )
    checked_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Ítem de checklist'

    def mark_done(self, user):
        """Marca el ítem como completado."""
        self.is_checked = True
        self.checked_by = user
        self.checked_at = timezone.now()
        self.save()

    def unmark(self):
        """Desmarca el ítem."""
        self.is_checked = False
        self.checked_by = None
        self.checked_at = None
        self.save()

    def toggle(self, user):
        """Alterna el estado del ítem."""
        if self.is_checked:
            self.unmark()
        else:
            self.mark_done(user)

    def __str__(self):
        return f"{'✅' if self.is_checked else '⬜'} {self.text}"


# ------------------------------------------------------------------------------
# EVENTS
# ------------------------------------------------------------------------------

class Event(BaseContent):
    """
    Evento compartido con recurrencia y recordatorios.
    FIX: ningún campo ni método se llama 'check' — sin conflicto con Model.check().
    """
    RECURRENCE_CHOICES = [
        ('none', 'Sin repetición'),
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('yearly', 'Anual'),
    ]
    description = models.TextField(blank=True)
    location = models.CharField(max_length=300, blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(null=True, blank=True)
    is_all_day = models.BooleanField(default=False)
    recurrence = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, default='none')
    reminder_minutes_before = models.PositiveIntegerField(default=60)
    color = models.CharField(max_length=7, default='#FF6B9D')

    class Meta(BaseContent.Meta):
        verbose_name = 'Evento'
        verbose_name_plural = 'Eventos'

    def __str__(self):
        return self.title or f"Evento {self.start_datetime.date()}"


# ------------------------------------------------------------------------------
# MEDIA
# ------------------------------------------------------------------------------

class Media(BaseContent):
    """
    Fotos, vídeos y audios compartidos.
    FIX: FileField en lugar de ImageField — no requiere Pillow.
    Para usar ImageField instala: pip install Pillow
    """
    MEDIA_TYPE_CHOICES = [
        ('photo', 'Foto'),
        ('video', 'Vídeo'),
        ('audio', 'Audio'),
    ]
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    file = models.FileField(upload_to='media/%Y/%m/')
    thumbnail = models.FileField(upload_to='media/thumbnails/', blank=True, null=True)
    caption = models.TextField(blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    file_size_bytes = models.PositiveBigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    taken_at = models.DateTimeField(null=True, blank=True)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta(BaseContent.Meta):
        verbose_name = 'Media'
        verbose_name_plural = 'Media'

    def __str__(self):
        return f"{self.get_media_type_display()} — {self.title or self.id}"


# ==============================================================================
# CONTENT TYPE REGISTRY
# FIX: renombrado ContentType → ContentTypeRegistry para no colisionar con
#      django.contrib.contenttypes.models.ContentType (importado arriba).
# ==============================================================================

class ContentTypeRegistry(models.Model):
    """
    Registro de tipos de contenido disponibles en la app.
    Permite activar/desactivar tipos sin hacer deploy.
    """
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Registro de tipo de contenido'
        verbose_name_plural = 'Registro de tipos de contenido'

    def __str__(self):
        return self.display_name