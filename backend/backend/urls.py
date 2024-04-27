from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from processDataApp.views import \
    HealthCheckAPIView, \
    UserListCreateAPIView, \
    UserRetrieveUpdateDestroyAPIView, \
    LoginAPIView , \
    ProcessCvsDataAPIView, \
    ProcessUnprocessedDataAPIView, \
    BatchDataRetrieveAPIView, \
    DataRetrieveAPIView \


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/healthcheck/', HealthCheckAPIView.as_view(), name='healthcheck'),
    path('api/users/', UserListCreateAPIView.as_view(), name='user-list-create'),
    path('api/users/<int:pk>/', UserRetrieveUpdateDestroyAPIView.as_view(), name='user-retrieve-update-destroy'),
    path('api/login/', LoginAPIView.as_view(), name='login'),
    path('api/process-data/', ProcessCvsDataAPIView.as_view(), name='process-cvs-data'),
    path('api/process-unprocessed-data/', ProcessUnprocessedDataAPIView.as_view(), name='process-unprocessed-data'),
    path('api/batch/', BatchDataRetrieveAPIView.as_view(), name='batch-retrieve'),
    path('api/data/', DataRetrieveAPIView.as_view(), name='data-retrieve'),
]   