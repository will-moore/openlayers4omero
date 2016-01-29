from django.shortcuts import render

def index(request):

    return render(request,
                  'openlayers4omero/index.html')