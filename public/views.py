import secrets
import hashlib
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django import forms
from django.contrib.auth import authenticate, login
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
from .models import AuthToken

class CustomLoginView(LoginView):
    template_name = 'index.html'

    def get_success_url(self):
        return redirect('userdashboard').url
    
def custom_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            print("user logged in")
            login(request, user)
            token = secrets.token_hex(32)

            token_hash = hashlib.sha256(token.encode()).hexdigest()
            AuthToken.objects.create(user=user, token_hash=token_hash)

            response = HttpResponseRedirect('/userdashboard/')
            max_age = 7200
            response.set_cookie('auth_token', token, httponly=True, max_age=max_age)
            return response

    return render(request, 'index.html', {'show_login_modal': True})

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('index')
        else:
            print(form.errors)
            print("made it to invalid password")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                # this should fix the stupid bug so not all te html is refresged
                form_html = render_to_string('public/register_modal.html', {'form': form}, request=request)
                print(form_html)
                return JsonResponse({"form_html": form_html})
            else:
                return render(request, 'public/index.html', {'form': form, 'show_register_modal': True})
    else:
        print("wasnt a post?")
        form = UserCreationForm()
        return render(request, 'public/index.html', {'form': form})


def index(request):
    return render(request, 'public/index.html')

@login_required
def user_dashboard(request):
    return render(request, 'public/dashboard.html')

def custom_logout(request):
    logout(request)
    return redirect('public/index.html')

def pvp(request, game_id):
    print("pvp request", request)
    gameState = request.session.get('gameState')
    context = {'gameState': gameState}
    print("made it here")
    return render(request, 'public/board.html', context)

def logout(request):
    response = HttpResponseRedirect('/')
    response.delete_cookie('auth_token')
    return response
def pve(request, game_id):
    print("pve request", request)
    gameState = request.session.get('gameState')
    context = {'gameState': gameState}
    return render(request, 'public/board.html', context)

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