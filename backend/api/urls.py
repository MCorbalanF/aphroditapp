"""
urls.py — Couples & Friends App
================================
Incluye este archivo en tu urls.py principal:
  path('api/', include('api.urls')),

Endpoints completos:
  GET  /api/                                                      → landing
  POST /api/auth/register/                                        → registro
  POST /api/auth/login/                                           → login
  POST /api/auth/logout/                                          → logout

  GET  /api/dashboard/                                            → dashboard

  GET  /api/relationships/                                        → mis relaciones
  POST /api/relationships/                                        → crear relación
  GET  /api/relationships/<id>/                                   → detalle relación
  PATCH /api/relationships/<id>/                                  → editar relación

  POST /api/relationships/<id>/invite/                            → invitar usuario
  POST /api/invitations/<id>/respond/                             → aceptar/rechazar

  GET  /api/relationships/<id>/nicknames/                         → ver apodos
  POST /api/relationships/<id>/nicknames/                         → crear/actualizar apodo

  GET  /api/relationships/<id>/content/                           → todo el contenido
  POST /api/relationships/<id>/content/                           → crear contenido (cualquier tipo)
  GET  /api/relationships/<id>/content/<type>/<pk>/               → detalle de un contenido
  PATCH /api/relationships/<id>/content/<type>/<pk>/              → editar contenido
  DELETE /api/relationships/<id>/content/<type>/<pk>/             → borrar contenido

  POST /api/relationships/<id>/checklists/<pk>/items/             → añadir ítem al checklist
  POST /api/relationships/<id>/checklists/<pk>/items/<item>/toggle/ → toggle ítem
  DELETE /api/relationships/<id>/checklists/<pk>/items/<item>/    → borrar ítem

  POST /api/relationships/<id>/lists/<pk>/items/                  → añadir ítem a lista
  DELETE /api/relationships/<id>/lists/<pk>/items/<item>/         → borrar ítem de lista

  GET  /api/notifications/                                        → mis notificaciones (?unread=true)
  POST /api/notifications/                                        → marcar todas como leídas
  PATCH /api/notifications/<id>/read/                             → marcar una como leída

WebSocket (Django Channels):
  ws://host/ws/relationship/<rel_id>/content/<type>/<content_id>/
"""

from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    # ──────────────────────────────────────────────
    # LANDING
    # ──────────────────────────────────────────────
    path('', views.landing, name='landing'),

    # ──────────────────────────────────────────────
    # AUTH
    # ──────────────────────────────────────────────
    path('auth/register/', views.RegisterView.as_view(), name='auth-register'),
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),

    # ──────────────────────────────────────────────
    # DASHBOARD
    # ──────────────────────────────────────────────
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),

    # ──────────────────────────────────────────────
    # RELATIONSHIPS
    # ──────────────────────────────────────────────
    path('relationships/', views.RelationshipListCreateView.as_view(), name='relationship-list'),
    path('relationships/<uuid:relationship_id>/', views.RelationshipDetailView.as_view(), name='relationship-detail'),

    # ──────────────────────────────────────────────
    # INVITATIONS
    # ──────────────────────────────────────────────
    path('relationships/<uuid:relationship_id>/invite/', views.InviteToRelationshipView.as_view(), name='relationship-invite'),
    path('invitations/<uuid:invitation_id>/respond/', views.InvitationRespondView.as_view(), name='invitation-respond'),

    # ──────────────────────────────────────────────
    # NICKNAMES
    # ──────────────────────────────────────────────
    path('relationships/<uuid:relationship_id>/nicknames/', views.NicknameView.as_view(), name='nickname-list-create'),

    # ──────────────────────────────────────────────
    # CONTENT — CRUD genérico
    # ──────────────────────────────────────────────
    path('relationships/<uuid:relationship_id>/content/', views.ContentView.as_view(), name='content-list-create'),
    path('relationships/<uuid:relationship_id>/content/<str:content_type>/<uuid:pk>/', views.ContentDetailView.as_view(), name='content-detail'),

    # ──────────────────────────────────────────────
    # CHECKLIST ITEMS
    # ──────────────────────────────────────────────
    path('relationships/<uuid:relationship_id>/checklists/<uuid:pk>/items/', views.ChecklistItemView.as_view(), name='checklist-item-add'),
    path('relationships/<uuid:relationship_id>/checklists/<uuid:pk>/items/<uuid:item_pk>/toggle/', views.ChecklistItemToggleView.as_view(), name='checklist-item-toggle'),
    path('relationships/<uuid:relationship_id>/checklists/<uuid:pk>/items/<uuid:item_pk>/', views.ChecklistItemView.as_view(), name='checklist-item-delete'),

    # ──────────────────────────────────────────────
    # SHARED LIST ITEMS
    # ──────────────────────────────────────────────
    path('relationships/<uuid:relationship_id>/lists/<uuid:pk>/items/', views.SharedListItemView.as_view(), name='list-item-add'),
    path('relationships/<uuid:relationship_id>/lists/<uuid:pk>/items/<uuid:item_pk>/', views.SharedListItemView.as_view(), name='list-item-delete'),

    # ──────────────────────────────────────────────
    # NOTIFICATIONS
    # ──────────────────────────────────────────────
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<uuid:notification_id>/read/', views.NotificationReadView.as_view(), name='notification-read'),
]