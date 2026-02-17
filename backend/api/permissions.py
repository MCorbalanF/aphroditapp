"""
permissions.py — Custom DRF permissions
"""
from rest_framework.permissions import BasePermission
from .models import Relationship


class IsRelationshipMember(BasePermission):
    """
    Permite el acceso solo si el usuario autenticado es miembro de la relación.
    Espera que la view tenga get_relationship() o que el kwarg sea 'relationship_id'.
    """
    message = 'No perteneces a esta relación.'

    def has_permission(self, request, view):
        relationship_id = view.kwargs.get('relationship_id')
        if not relationship_id:
            return False
        return Relationship.objects.filter(
            id=relationship_id,
            members=request.user,
            is_active=True,
        ).exists()


class IsRelationshipOwner(BasePermission):
    """Solo el owner de la relación puede realizar esta acción."""
    message = 'Solo el propietario puede realizar esta acción.'

    def has_permission(self, request, view):
        from .models import RelationshipMember
        relationship_id = view.kwargs.get('relationship_id')
        if not relationship_id:
            return False
        return RelationshipMember.objects.filter(
            relationship_id=relationship_id,
            user=request.user,
            role='owner',
        ).exists()