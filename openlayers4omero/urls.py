from django.conf.urls import *
from openlayers4omero import views

urlpatterns = patterns('django.views.generic.simple',

     # index 'home page' of the <your-app> app
     url( r'^$', views.index, name='openlayers4omero_index' ),

 )

