from django.urls import path
from .views import index, register, user_dashboard, CustomLoginView, pvp, pve_session_setup, mp_session_setup, pve
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView


urlpatterns = [
    path('', index, name='index'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', register, name='register'),
    path('userdashboard/', user_dashboard, name='userdashboard'),
    path('logout/', LogoutView.as_view(next_page='index'), name='logout'),
    path('userdashboard/mp_session_setup/', mp_session_setup, name='mp_session_setup'),
    path('userdashboard/pve_session_setup/', pve_session_setup, name='pve_session_setup'),
    path('pvp/<str:game_id>/', pvp, name='pvp_game'),
    path('pve/<str:game_id>/', pve, name='pve_game'),
    ]   