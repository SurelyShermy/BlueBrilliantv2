import secrets
import hashlib
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth.views import LogoutView
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token

from django.views import View
from .models import AuthToken
from django.http import FileResponse
import os
def files(request):
    path = request.path
    try:
        bytes = FileResponse(open('frontend/bluebrilliantreact/public'+path, 'rb'))
        return bytes
    except:
        return HttpResponse(status=404)
    
@method_decorator(ensure_csrf_cookie, name='dispatch')
class CustomLoginView(LoginView):
    def post (self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            token = secrets.token_hex(32)
            return JsonResponse({'success': True, 'token': token})
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
        
@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(View):
    def post(self, request):
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = user.username
            return JsonResponse({'success': True, 'username': username})
        else:
            errors = form.errors.as_json()
            print(errors)
            return JsonResponse({'success': False, 'errors': errors}, status=400)
    def get(self, request):
        return JsonResponse({'message': 'Registration endpoint.'})
    
@method_decorator(ensure_csrf_cookie, name='dispatch')
class logoutView(LogoutView):
    def post(self, request):
        logout(request)
        return JsonResponse({'success': True})
    
def check_session(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'isAuthenticated': True,
            'username': request.user.username,
        })
    else:
        return JsonResponse({'isAuthenticated': False}, status=401)
        

def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})


def index(request):
    return render(request, 'index.html')

def pvp(request, game_id):
    print("pvp request", request)
    gameState = request.session.get('gameState')
    context = {'gameState': gameState}
    print("made it here")
    return render(request, 'board.html', context)


def pve(request, game_id):
    print("pve request", request)
    gameState = request.session.get('gameState')
    context = {'gameState': gameState}
    return render(request, 'board.html', context)

@require_POST
def mp_session_setup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        gameState = data.get('gameState')
        game_id = data.get('game_id')

        request.session['gameState'] = gameState
        request.session['game_id'] = game_id

        print("this is the reversed url", reverse('game', kwargs={'game_id': game_id}))
        return redirect(reverse('pvp_game', kwargs={'game_id': game_id}))

    return JsonResponse({'success': False, 'error': 'Invalid request'})
@require_POST
def pve_session_setup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        gameState = data.get('gameState')
        game_id = data.get('game_id')

        request.session['gameState'] = gameState
        request.session['game_id'] = game_id

        print("this is the reversed url", reverse('game', kwargs={'game_id': game_id}))
        return redirect(reverse('engine', kwargs={'game_id': game_id}))

    return JsonResponse({'success': False, 'error': 'Invalid request'})