from django.contrib import admin
from .models import User, BatchData, Data

admin.site.register(User)
admin.site.register(BatchData)
admin.site.register(Data)