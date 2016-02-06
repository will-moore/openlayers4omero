from django.shortcuts import render
from django.http.response import HttpResponse
from django.http import JsonResponse

from app import App
from numpy import tile

def index(request):
    return render(request, 'openlayers4omero/index.html')

def is_connected(request):
    if not App(request).isConnected():
        return JsonResponse({'connected': False})
    
    return JsonResponse({'connected': True})

def connect(request):
    if not App(request).isConnected() and not App(request).connect():
        return JsonResponse({'error': 'Could not get session!'})
    
    return JsonResponse({'sessionId': request.session['sessionId']})

def clean(request):
    App(request).disconnect()
    return JsonResponse({'disconnected': True})

def list_datasets(request):
    return JsonResponse(App(request).listDatasets(), safe=False)

def thumbnail(request, imageid):
    if imageid is None:
        return JsonResponse({ "error" : "no image id supplied"})
    
    img_data = App(request).getThumbnail(imageid)
    
    return renderResponse(img_data)

def image(request, imageid, z=0, t=0, c=0, x=None, y=None, w=None, h=None, l=None):
    if imageid is None:
        return JsonResponse({ "error" : "no image id supplied"})
    
    tile = None
    if x and y and w and h:
        tile = {
            'x' : x,
            'y' : y,
            'w' : w,
            'h' : h
            }
    img_data = App(request).getImage(imageid, z, t, c, tile, l)
    
    return renderResponse(img_data)
    
def renderResponse(img_data):
    if img_data is None:
        return JsonResponse({ "error" : "did not receive image data!"})
    
    rsp = HttpResponse(img_data, content_type='image/jpeg')
    rsp['Content-Length'] = len(img_data)
    
    return rsp
