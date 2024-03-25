from django.urls import path
from .views import index, register, user_dashboard, CustomLoginView


urlpatterns = [
    path('', index, name='index'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', register, name='register'),
    path('userdashboard/', user_dashboard, name='userdashboard'),

]