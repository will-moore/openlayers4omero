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


/**
 * @classdesc
 * Layer source for tile data from an Omero Server.
 *
 * @constructor
 * @extends {ol.source.TileImage}
 * @param {olx.source.OmeroOptions=} opt_options Options.
 * @api stable
 */
ol.source.Omero = function(opt_options) {

  var options = opt_options || {};
  var size = options.size;
  var tileSize = opt_options.tile_size || ol.DEFAULT_TILE_SIZE;
  
  var imageWidth = size[0];
  var imageHeight = size[1];

  var extent = [0, -imageHeight, imageWidth, 0];
  var tileGrid = new ol.tilegrid.TileGrid({
	tileSize: [tileSize, tileSize],
    extent: extent,
    origin: ol.extent.getTopLeft(extent),
    resolutions: options.resolutions || [1]
  });

  var url = options.url;

  /**
   * @this {ol.source.TileImage}
   * @param {ol.TileCoord} tileCoord Tile Coordinate.
   * @param {number} pixelRatio Pixel ratio.
   * @param {ol.proj.Projection} projection Projection.
   * @return {string|undefined} Tile URL.
   */
  function tileUrlFunction(tileCoord, pixelRatio, projection) {
    if (!tileCoord) {
      return undefined;
    } else {
      var tileCoordZ = tileCoord[0];
      var tileCoordX = tileCoord[1];
      var tileCoordY = -tileCoord[2] - 1;
      
      var zoom = this.tileGrid.resolutions_.length - tileCoordZ - 1;
      return url + '/' + tileCoordX + '/' + tileCoordY + '/' + this.tileGrid.tileSize_[0] + '/' + this.tileGrid.tileSize_[1] + '/' + zoom; 
    }
  }

  goog.base(this, {
    attributions: options.attributions,
    crossOrigin: options.crossOrigin,
    logo: options.logo,
    reprojectionErrorThreshold: options.reprojectionErrorThreshold,
    tileGrid: tileGrid,
    tileUrlFunction: tileUrlFunction
  });

};

goog.inherits(ol.source.Omero, ol.source.TileImage);
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
