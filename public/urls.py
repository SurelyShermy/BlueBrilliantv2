from django.urls import path
from .views import index, register, user_dashboard, CustomLoginView, game
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView


urlpatterns = [
    path('', index, name='index'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', register, name='register'),
    path('userdashboard/', user_dashboard, name='userdashboard'),
    path('logout/', LogoutView.as_view(next_page='index'), name='logout'),
    path('game/', game, name='game')
]