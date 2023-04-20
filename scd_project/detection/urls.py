from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import *
from . import views

urlpatterns = [
	# path('image_upload', surface_image_view, name='image_upload'),
	path('api/csrf_token/', views.get_csrf_token, name='get_csrf_token'),
	path('upload_file/', upload_file, name='upload_file'),
]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL,
						document_root=settings.MEDIA_ROOT)

# urls.py
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
