from django.http import HttpResponseForbidden
from .models import AuthToken

class TokenAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get('auth_token')
        if token:
            token_hash = hashlib.sha256(token.encode()).hexdigest()

            if not AuthToken.objects.filter(token_hash=token_hash).exists():
                return HttpResponseForbidden()

        response = self.get_response(request)
        return response