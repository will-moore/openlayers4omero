from django.shortcuts import render
from django.http.response import HttpResponse
from django.http import JsonResponse
from omeroweb.decorators import login_required

from app import App

@login_required()
def index(request, conn=None, **kwargs):
    return render(request, 'openlayers4omero/index.html')

@login_required()
def list_datasets(request, conn=None, **kwargs):
    datasetId = request.GET.get("datasetId", None)
    return JsonResponse(App(conn).listDatasets(datasetId=datasetId), safe=False)

@login_required()
def thumbnail(request, imageid, conn=None, **kwargs):
    if imageid is None:
        return JsonResponse({ "error" : "no image id supplied"})
    
    img_data = App(conn).getThumbnail(imageid)
    
    return renderResponse(img_data)

@login_required()
def image(request, imageid, z=0, t=0, c=0, x=None, y=None, w=None, h=None, l=None, conn=None, **kwargs):
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
    img_data = App(conn).getImage(imageid, z, t, c, tile, l)
    
    return renderResponse(img_data)

@login_required()
def rois(request, imageId, conn=None, **kwargs):
    if imageId is None:
        return JsonResponse({ "error" : "no image id supplied"})
    return JsonResponse(App(conn).get_rois(imageId), safe=False)

@login_required()
def addRoi(request, imageId, conn=None, **kwargs):
    if imageId is None:
        return JsonResponse({ "error" : "no image id supplied"})
    
    ret = App(conn).addRoi(request, imageId)
    if ret is None:
        return JsonResponse({ "error" : "adding roi failed!"})
    
    return JsonResponse(ret, safe=False)
   
def renderResponse(img_data):
    if img_data is None:
        return JsonResponse({ "error" : "did not receive image data!"})
    
    rsp = HttpResponse(img_data, content_type='image/jpeg')
    rsp['Content-Length'] = len(img_data)
    
    return rsp