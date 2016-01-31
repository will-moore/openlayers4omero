from django.shortcuts import render
from django.http.response import HttpResponse
from django.http import JsonResponse

from app import App

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

        