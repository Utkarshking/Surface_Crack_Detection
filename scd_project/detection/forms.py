# forms.py
from django import forms
from .models import *
 
 
class SurfaceForm(forms.ModelForm):
 
    class Meta:
        model = Surface
        fields = '__all__'