from django.conf.urls import patterns
from django.conf.urls import url

from openlayers4omero import views

urlpatterns = patterns('django.views.generic.simple',

     url( r'^$', views.index, name='openlayers4omero_index' ),
     url( r'^datasets$', views.list_datasets, name='openlayers4omero_datasets' ),
     url( r'^thumbnail/(?P<imageid>[0-9]+)?$', views.thumbnail, name='openlayers4omero_thumbnail' ),
     url( r'^image/(?P<imageid>[0-9]+)?(/(?P<z>[0-9]+)?)?(/(?P<t>[0-9]+)?)?(/(?P<c>[0-9]+)?)?(/(?P<x>[0-9]+)?)?(/(?P<y>[0-9]+)?)?(/(?P<w>[0-9]+)?)?(/(?P<h>[0-9]+)?)?(/(?P<l>[0-9]+)?)?$', views.image, name='openlayers4omero_image'),
     url( r'^rois/(?P<imageId>[0-9]+)?$', views.rois, name='openlayers4omero_rois'),
     url( r'^addrois/(?P<imageId>[0-9]+)?$', views.addRoi, name='openlayers4omero_addrois')
 )

