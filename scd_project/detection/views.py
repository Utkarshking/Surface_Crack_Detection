from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.http import HttpResponseBadRequest
from django.urls import resolve
from .forms import *
from tensorflow import keras
import cv2 as cv
import numpy as np
import json
from django.http import HttpResponse, JsonResponse
from django.middleware import csrf
from django.views.decorators.csrf import csrf_exempt
import tempfile
from PIL import Image
import base64
from django.urls import reverse
from urllib.parse import urljoin

# Create your views here.
def Welcome(request):
    return redirect('image_upload')

# this function is used to get the csrf token for the following request authentication
def get_csrf_token(request):
    csrf_token = csrf.get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

# functions to get the number of pixels in a image
def get_num_pixels(filepath):
    width, height = Image.open(filepath).size 
    return width*height
 
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
            img = cv.imread(img_path)
            img = cv.resize(img,(224,224))
            img = np.reshape(img,[1,224,224,3])
            pred = model.predict(img)
            if(pred[0][0]==1):
                prediction_var = 'Surface Crack Detected'
            else:
                prediction_var = 'No Surface Crack'
            resultpath="E:/major2/crackdetection/scd_project/detection/result.jpg"
            binarypath="E:/major2/crackdetection/scd_project/detection/binary.jpg"
            src = cv.imread(img_path)
            pixels = get_num_pixels(img_path)
            gray = cv.cvtColor(src, cv.COLOR_BGR2GRAY)
            ret, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU)
            se = cv.getStructuringElement(cv.MORPH_RECT, (10, 10), (-1, -1))
            binary = cv.morphologyEx(binary, cv.MORPH_OPEN, se)
            cv.imwrite(binarypath, binary)
            contours,hierachy=cv.findContours(binary,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE)
            height, width = src.shape[:2]
            for c in range(len(contours)):
                x, y, w, h = cv.boundingRect(contours[c])
                area = cv.contourArea(contours[c])
                print(area)
                cv.drawContours(src, contours, c, (0, 255, 0), 1, 8)
            area_percent=area/pixels
            cv.imwrite(resultpath, src)
            with open(binarypath, "rb") as binary_file:
                binary_data = base64.b64encode(binary_file.read()).decode('utf-8')
            with open(resultpath, "rb") as result_file:
                result_data = base64.b64encode(result_file.read()).decode('utf-8')
            resultdict={
                "prediction":prediction_var,
                "localisationimage":[binary_data,result_data],
                "areapercent":area_percent
            }
            return JsonResponse(resultdict)
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

