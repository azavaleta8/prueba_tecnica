from .models import User
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Obtener el token JWT de la solicitud
        raw_token = self.get_raw_token_from_header(request)

        if not raw_token:
            raise AuthenticationFailed('No se encontró token')

        # Decodificar y validar el token JWT
        validated_token = self.get_validated_token(raw_token)

        # Obtener el ID de usuario del token (ejemplo: user_id)
        user_id = validated_token['user_id']

        try:
            # Buscar al usuario en la base de datos por su ID
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed('No se encontró un usuario con este ID')

        # Retornar el usuario autenticado
        return (user, None)

    def get_raw_token_from_header(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header is None:
            return None
        # El formato típico del encabezado de autorización es "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
        return parts[1]