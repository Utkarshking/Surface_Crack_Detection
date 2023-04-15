from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.http import HttpResponseBadRequest
from django.urls import resolve
from .forms import *
from tensorflow import keras
import cv2
import numpy as np
import json
from django.http import HttpResponse, JsonResponse
from django.middleware import csrf
from django.views.decorators.csrf import csrf_exempt
import tempfile

# Create your views here.


def Welcome(request):
    return redirect('image_upload')

# this function is used 
def get_csrf_token(request):
    csrf_token = csrf.get_token(request)
    return JsonResponse({'csrfToken': csrf_token})
 
def surface_image_view(request):
 
    if request.method == 'POST':
        print("url printed",resolve(request.path_info).url_name)
        uploaded_file=request.FILES['image_path']
        print(uploaded_file)
        print("here are files being uploaded -->",request.FILES)
        form = SurfaceForm(request.POST, request.FILES)
        surface = Surface()
        surface.surface_image = request.FILES['surface_image']
        image_path = str(surface.surface_image)
        request.session['image_path'] = json.dumps(image_path)
        print("Session Value:", request.session.get('image_path'))
        if form.is_valid():
            form.save()
            return redirect('prediction')
    else:
        form = SurfaceForm()
    return render(request, 'surface_image_form.html', {'form': form})

    

@csrf_exempt
def upload_file(request):
    prediction_var = ''
    model = keras.models.load_model('savedModels/custom_cnn.h5')
    if request.method == "POST":
        try:
            file = request.FILES.get("file")
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                for chunk in file.chunks():
                    tmp.write(chunk)
                img_path = tmp.name
            img = cv2.imread(img_path)
            img = cv2.resize(img,(224,224))
            img = np.reshape(img,[1,224,224,3])
            pred = model.predict(img)
            if(pred[0][0]==1):
                prediction_var = 'Surface Crack Detected'
            else:
                prediction_var = 'No Surface Crack'
            return JsonResponse({"message": prediction_var})
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)})
    elif request.method == "OPTIONS":
        # This is an example of how you can handle the OPTIONS request
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Max-Age"] = "86400"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
        return response
    else:
        return JsonResponse({"error": "Invalid request method."})

