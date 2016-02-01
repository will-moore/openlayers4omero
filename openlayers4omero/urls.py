from django.conf.urls import patterns
from django.conf.urls import url

from openlayers4omero import views

urlpatterns = patterns('django.views.generic.simple',

     url( r'^$', views.index, name='openlayers4omero_index' ),
     url( r'^is_connected$', views.is_connected, name='openlayers4omero_is_connected' ),
     url( r'^connect$', views.connect, name='openlayers4omero_connect' ),
     url( r'^clean$', views.clean, name='openlayers4omero_clean' ),
     url( r'^datasets$', views.list_datasets, name='openlayers4omero_datasets' ),
     url( r'^image/(?P<imageid>[0-9]+)?$', views.image, name='openlayers4omero_image' ),
 )

