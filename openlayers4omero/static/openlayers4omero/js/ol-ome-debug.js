goog.provide('ol.source.Omero');

goog.require('goog.asserts');
goog.require('ol');
goog.require('ol.ImageTile');
goog.require('ol.TileCoord');
goog.require('ol.TileState');
goog.require('ol.dom');
goog.require('ol.extent');
goog.require('ol.proj');
goog.require('ol.source.TileImage');
goog.require('ol.tilegrid.TileGrid');

ol.source.Omero = function(opts) {
	this.plane_ = opts.plane || 0;
	this.time_ =  opts.time || 0;

	var size = opts.sizeX;
	var tileSize = opts.tile_size || ol.DEFAULT_TILE_SIZE;
  
	var width = opts.sizeX;
	var height = opts.sizeY;

	var extent = [0, -height, width, 0];
	var tileGrid = new ol.tilegrid.TileGrid({
		tileSize: [tileSize, tileSize],
	    extent: extent,
	    origin: ol.extent.getTopLeft(extent),
	    resolutions: opts.resolutions || [1]
	});

	var url = opts.url;

	function tileUrlFunction(tileCoord, pixelRatio, projection) {
		if (!tileCoord) {
			return undefined;
		} else {
			var zoom = this.tileGrid.resolutions_.length - tileCoord[0] - 1;
    	
			return url + 
      			'/' + this.getPlane() + '/' + this.getTime() +
      			'/' + tileCoord[1] + '/' + (-tileCoord[2]-1) + '/' +
      			this.tileGrid.tileSize_[0] + '/' + this.tileGrid.tileSize_[1] +
      			'/' + zoom; 
			}
	}
  
	goog.base(this, {
		attributions: opts.attributions,
		crossOrigin: opts.crossOrigin,
		logo: opts.logo,
		reprojectionErrorThreshold: opts.reprojectionErrorThreshold,
		tileGrid: tileGrid,
		tileUrlFunction: tileUrlFunction
	});

};
goog.inherits(ol.source.Omero, ol.source.TileImage);

ol.source.Omero.prototype.getPlane = function() {
	  return this.plane_;
}

ol.source.Omero.prototype.setPlane = function(value) {
	  this.plane_ = value;
}

ol.source.Omero.prototype.getTime = function() {
	  return this.time_;
}

ol.source.Omero.prototype.setTime = function(value) {
	  this.time_ = value;
}

goog.exportProperty(
	    ol.source.Omero.prototype,
	    'setRenderReprojectionEdges',
    ol.source.Omero.prototype.setRenderReprojectionEdges);

goog.exportProperty(
    ol.source.Omero.prototype,
    'setTileGridForProjection',
    ol.source.Omero.prototype.setTileGridForProjection);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getTileLoadFunction',
    ol.source.Omero.prototype.getTileLoadFunction);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getTileUrlFunction',
    ol.source.Omero.prototype.getTileUrlFunction);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getUrls',
    ol.source.Omero.prototype.getUrls);

goog.exportProperty(
    ol.source.Omero.prototype,
    'setTileLoadFunction',
    ol.source.Omero.prototype.setTileLoadFunction);

goog.exportProperty(
    ol.source.Omero.prototype,
    'setTileUrlFunction',
    ol.source.Omero.prototype.setTileUrlFunction);

goog.exportProperty(
    ol.source.Omero.prototype,
    'setUrl',
    ol.source.Omero.prototype.setUrl);

goog.exportProperty(
    ol.source.Omero.prototype,
    'setUrls',
    ol.source.Omero.prototype.setUrls);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getTileGrid',
    ol.source.Omero.prototype.getTileGrid);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getAttributions',
    ol.source.Omero.prototype.getAttributions);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getLogo',
    ol.source.Omero.prototype.getLogo);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getProjection',
    ol.source.Omero.prototype.getProjection);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getState',
    ol.source.Omero.prototype.getState);

goog.exportProperty(
    ol.source.Omero.prototype,
    'setAttributions',
    ol.source.Omero.prototype.setAttributions);

goog.exportProperty(
    ol.source.Omero.prototype,
    'get',
    ol.source.Omero.prototype.get);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getKeys',
    ol.source.Omero.prototype.getKeys);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getProperties',
    ol.source.Omero.prototype.getProperties);

goog.exportProperty(
    ol.source.Omero.prototype,
    'set',
    ol.source.Omero.prototype.set);

goog.exportProperty(
    ol.source.Omero.prototype,
    'setProperties',
    ol.source.Omero.prototype.setProperties);

goog.exportProperty(
    ol.source.Omero.prototype,
    'unset',
    ol.source.Omero.prototype.unset);

goog.exportProperty(
    ol.source.Omero.prototype,
    'changed',
    ol.source.Omero.prototype.changed);

goog.exportProperty(
    ol.source.Omero.prototype,
    'dispatchEvent',
    ol.source.Omero.prototype.dispatchEvent);

goog.exportProperty(
    ol.source.Omero.prototype,
    'getRevision',
    ol.source.Omero.prototype.getRevision);

goog.exportProperty(
    ol.source.Omero.prototype,
    'on',
    ol.source.Omero.prototype.on);

goog.exportProperty(
    ol.source.Omero.prototype,
    'once',
    ol.source.Omero.prototype.once);

goog.exportProperty(
    ol.source.Omero.prototype,
    'un',
    ol.source.Omero.prototype.un);

goog.exportProperty(
    ol.source.Omero.prototype,
    'unByKey',
    ol.source.Omero.prototype.unByKey);

goog.exportProperty(
	ol.source.Omero.prototype,
	'updatePlane',
	ol.source.Omero.prototype.getTime);

goog.exportProperty(
	ol.source.Omero.prototype,
	'updateTime',
	ol.source.Omero.prototype.setTime);

goog.exportProperty(
	ol.source.Omero.prototype,
	'getPlane',
	ol.source.Omero.prototype.getPlane);

goog.exportProperty(
	ol.source.Omero.prototype,
	'getTime',
	ol.source.Omero.prototype.getTime);