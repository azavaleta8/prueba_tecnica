from rest_framework import serializers
from .models import User, BatchData, Data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password']

class UserSerializerResponse(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

class BatchDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchData
        fields = ['id', 'user', 'name', 'size', 'processed_data', 'status']

class DataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Data
        fields = [
            'id', 
            'batch',
            'text',
            'likes',
            'comments',
            'shares',
            'reactions',
            'emotions',
            'sentiments',
            'processed'
        ]