from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from .auth import CustomJWTAuthentication
from django.core.paginator import Paginator, EmptyPage

import csv
import json
from .helpers import ParseData
from .models import User, BatchData, Data
from huggingFaceAPI.huggingFace import huggingFaceAPI
from .task import process_csv_data, process_unprocessed_data
from .serializers import \
    UserSerializer, \
    UserSerializerResponse, \
    BatchDataSerializer, \
    DataSerializer


           
class HealthCheckAPIView(APIView):
    def get(self, request):
        return Response("OK")

class UserListCreateAPIView(APIView):

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializerResponse(users, many=True)

        return Response({
            "success": True,
            "payload": serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                "success": False,
                "errors": serializer.errors
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        password = serializer.validated_data['password']
        hashed_password = make_password(password)
        serializer.validated_data['password'] = hashed_password
        user = serializer.save()

        serializer = UserSerializerResponse(user)

        return Response({
            "success": True,
            "payload": serializer.data
        }, status=status.HTTP_201_CREATED)
           
class UserRetrieveUpdateDestroyAPIView(APIView):

    authentication_classes = [CustomJWTAuthentication] 
    def get(self, request, pk):
        
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['User not Found']}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializerResponse(user)

        return Response({
            "success": True,
            "payload": [serializer.data]
        }, status=status.HTTP_200_OK)

class LoginAPIView(APIView):
    def post(self, request):
        
        email = request.data.get('email')
        password = request.data.get('password')

        if email is None or password is None:
            return Response({
                "success": False,
                "errors": {'error': ['Invalid fields']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['Invalid credentials']}
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password):
            return Response({
                "success": False,
                "errors": {'error': ['Invalid credentials']}
            }, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({
            "success": True,
            "payload": {
                'user_id': user.id,
                'access_token': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class ProcessCvsDataAPIView(APIView):

    authentication_classes = [CustomJWTAuthentication] 
    def post(self, request):

        name = request.data.get('name')
        user_id = request.data.get('user_id')

        if name is None or user_id is None:
            return Response({
                "success": False,
                "errors": {'error': ['Invalid fields']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        # Validamos si el user_id es de un usuario valido
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['User not Found']}
            }, status=status.HTTP_404_NOT_FOUND)
        
        if 'file' not in request.FILES:
            return Response({
                'success': False,
                'errors': {'error': ['No se proporcionó ningún archivo CSV']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


        csv_file = request.FILES['file']

        # Verificar la extensión del archivo
        if not csv_file.name.endswith('.csv'):
            return Response({
                'success': False,
                'errors': {'error': ['El archivo no tiene la extensión CSV']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            line_number = 0
            parsed_data = []
        
            for line_bytes in csv_file:
                line_number += 1

                try:
                    # Decodificar la línea
                    line_text = line_bytes.decode('utf-8')

                    # Procesar la línea del archivo CSV
                    parsed_line = ParseData(line_text)
                    if parsed_line is not None:
                        parsed_data.append(parsed_line)

                except UnicodeDecodeError as e:
                    print(f"Error de decodificación en la línea {line_number}: {e}")
                    continue
                
        except csv.Error as e:
            return Response(
                {
                    'success': False,
                    'errors': {'error': [f'Error al leer el archivo CSV {e}']}
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        parsed_data.pop(0)

        serializer = BatchDataSerializer(data={
            'user': user.id,
            'name': name,
            'size': len(parsed_data),
            'processed_data': 0,
            'status': "In Progress"
        })

        if not serializer.is_valid():
            return Response({
                "success": False,
                "errors": serializer.errors
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        serializer.save()

        process_csv_data.delay(serializer.data['id'], parsed_data)

        return Response(
            {
                'success': True,
                'payload': [serializer.data],
                'message': 'Los datos del archivo CSV estan siendo procesados.'
            },
            status=status.HTTP_200_OK
        )

class ProcessUnprocessedDataAPIView(APIView):

    authentication_classes = [CustomJWTAuthentication] 
    def post(self, request):

        batch_data_id = request.data.get('batch_data_id')

        if batch_data_id is None:
            return Response({
                "success": False,
                "errors": {'error': ['Invalid fields']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        # Validamos si el user_id es de un usuario valido
        try:
            batch = BatchData.objects.get(pk=batch_data_id)
        except BatchData.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['Batch not Found']}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            batch.status = 'In Progress'
            batch.save()
        except Exception as e:
            print(f"Error al actualizar el campo: {e}")

        process_unprocessed_data.delay(batch_data_id)
        serializer = BatchDataSerializer(batch)

        return Response(
            {
                'success': True,
                'payload': [serializer.data],
                'message': 'Los datos del archivo CSV estan siendo procesados.'
            },
            status=status.HTTP_200_OK
        )


class BatchDataRetrieveAPIView(APIView):

    authentication_classes = [CustomJWTAuthentication] 
    def post(self, request):
        
        
        user_id = request.data.get('user_id')

        if user_id is None:
            return Response({
                "success": False,
                "errors": {'error': ['Invalid fields']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

         # Validamos si el user_id es de un usuario valido
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['User not Found']}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            batches = BatchData.objects.filter(user=user_id)
            serializer = BatchDataSerializer(batches, many=True)

        except BatchData.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['Batch not Found']}
            }, status=status.HTTP_404_NOT_FOUND)


        return Response({
            "success": True,
            "payload": [serializer.data]
        }, status=status.HTTP_200_OK)

class DataRetrieveAPIView(APIView):

    authentication_classes = [CustomJWTAuthentication] 
    def post(self, request):
        
        batch_id = request.data.get('batch_id')
        page = request.query_params.get('page')
        page_size = request.query_params.get('size')

        if batch_id is None or page is None or page_size is None:
            return Response({
                "success": False,
                "errors": {'error': ['Invalid fields']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        page = int(page)
        page_size = int(page_size)

        if page < 0 or page_size < 0:
            return Response({
                "success": False,
                "errors": {'error': ['page and pageSize must be positive']}
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

         # Validamos si el user_id es de un usuario valido
        try:
            batch = BatchData.objects.get(pk=batch_id)
        except BatchData.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['Batch not Found']}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            data = Data.objects.filter(batch=batch_id)

            paginator = Paginator(data, page_size)
            try:
                paginated_data = paginator.page(page)
            except EmptyPage:
                paginated_data = paginator.page(paginator.num_pages)

            serializer = DataSerializer(paginated_data, many=True)
            serialized_data = serializer.data

            for item in serialized_data:
                item['emotions'] = json.loads(item['emotions'])
                item['sentiments'] = json.loads(item['sentiments'])

        except Data.DoesNotExist:
            return Response({
                "success": False,
                "errors": {'error': ['Data not Found']}
            }, status=status.HTTP_404_NOT_FOUND)


        return Response({
            "success": True,
            "payload": [serializer.data]
        }, status=status.HTTP_200_OK)