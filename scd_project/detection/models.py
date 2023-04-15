from django.db import models
import os
# Create your models here.

class Surface(models.Model):
    surface_type = models.CharField(max_length=50)
    surface_image = models.ImageField(upload_to='images/')