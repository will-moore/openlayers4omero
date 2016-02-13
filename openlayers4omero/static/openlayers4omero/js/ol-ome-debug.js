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
	this.imageId_ = opts.image || 0;
	this.plane_ = opts.plane || 0;
	this.time_ =  opts.time || 0;
	this.channel_ = opts.channel || 0

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

	var url = opts.url + "/" + this.imageId_;

	function tileUrlFunction(tileCoord, pixelRatio, projection) {
		if (!tileCoord) {
			return undefined;
		} else {
			var zoom = this.tileGrid.resolutions_.length - tileCoord[0] - 1;
    	
			return url + 
      			'/' + this.getPlane() + '/' + this.getTime() + '/' + this.getChannel() +
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

ol.source.Omero.prototype.getImageId = function() {
	  return this.imageId_;
}

ol.source.Omero.prototype.setImageId = function(value) {
	  this.imageId_ = value;
}

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

ol.source.Omero.prototype.getChannel = function() {
	  return this.channel_;
}

ol.source.Omero.prototype.setChannel = function(value) {
	  this.channel_ = value;
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
	'getPlane',
	ol.source.Omero.prototype.getPlane);

goog.exportProperty(
	ol.source.Omero.prototype,
	'setPlane',
	ol.source.Omero.prototype.setPlane);

goog.exportProperty(
	ol.source.Omero.prototype,
	'getTime',
	ol.source.Omero.prototype.getTime);

goog.exportProperty(
	ol.source.Omero.prototype,
	'setTime',
	ol.source.Omero.prototype.setTime);

goog.exportProperty(
	ol.source.Omero.prototype,
	'getChannel',
	ol.source.Omero.prototype.getChannel);

goog.exportProperty(
	ol.source.Omero.prototype,
	'setChannel',
	ol.source.Omero.prototype.setChannel);

goog.exportProperty(
	ol.source.Omero.prototype,
	'getImageId',
	ol.source.Omero.prototype.getImageId);

goog.exportProperty(
	ol.source.Omero.prototype,
	'setImageId',
	ol.source.Omero.prototype.setImageId);

goog.provide('ol.control.CustomOverviewMap');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('ol');
goog.require('ol.Collection');
goog.require('ol.Map');
goog.require('ol.MapEventType');
goog.require('ol.Object');
goog.require('ol.ObjectEventType');
goog.require('ol.Overlay');
goog.require('ol.OverlayPositioning');
goog.require('ol.View');
goog.require('ol.ViewProperty');
goog.require('ol.control.Control');
goog.require('ol.coordinate');
goog.require('ol.css');
goog.require('ol.extent');

ol.control.CustomOverviewMap = function(opt_options) {

  var options = opt_options ? opt_options : {};
  this.collapsed_ = options.collapsed !== undefined ? options.collapsed : true;

  this.collapsible_ = options.collapsible !== undefined ?
      options.collapsible : true;

  if (!this.collapsible_) {
    this.collapsed_ = false;
  }

  var className = options.className ? options.className : 'ol-overviewmap';
  var tipLabel = options.tipLabel ? options.tipLabel : 'Overview map';
  var collapseLabel = options.collapseLabel ? options.collapseLabel : '\u00AB';
  this.collapseLabel_ = goog.isString(collapseLabel) ?
      goog.dom.createDom('SPAN', {}, collapseLabel) :
      collapseLabel;

  var label = options.label ? options.label : '\u00BB';

  this.label_ = goog.isString(label) ?
      goog.dom.createDom('SPAN', {}, label) :
      label;

  var activeLabel = (this.collapsible_ && !this.collapsed_) ?
      this.collapseLabel_ : this.label_;
  var button = goog.dom.createDom('BUTTON', {
    'type': 'button',
    'title': tipLabel
  }, activeLabel);

  goog.events.listen(button, goog.events.EventType.CLICK,
      this.handleClick_, false, this);

  var ovmapDiv = goog.dom.createDom('DIV', 'ol-overviewmap-map');

  /**
   * @type {ol.Map}
   * @private
   */
  this.ovmap_ = new ol.Map({
    controls: new ol.Collection(),
    interactions: new ol.Collection(),
    target: ovmapDiv,
    view: options.view
  });
  var ovmap = this.ovmap_;

  if (options.layers) {
    options.layers.forEach(
        function(layer) {
          ovmap.addLayer(layer);
        }, this);
  }

  var box = goog.dom.createDom('DIV', 'ol-overviewmap-box');

  this.boxOverlay_ = new ol.Overlay({
    position: [0, 0],
    positioning: ol.OverlayPositioning.BOTTOM_LEFT,
    element: box,
    stopEvent: false,
  });
  this.ovmap_.addOverlay(this.boxOverlay_);

  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
      ol.css.CLASS_CONTROL +
      (this.collapsed_ && this.collapsible_ ? ' ol-collapsed' : '') +
      (this.collapsible_ ? '' : ' ol-uncollapsible');
  var element = goog.dom.createDom('DIV',
      cssClasses, ovmapDiv, button);

  var render = options.render ? options.render : ol.control.CustomOverviewMap.render;

  this.isdragging = false;
  goog.events.listen(this.ovmap_, ol.MapBrowserEvent.EventType.POINTERDOWN,
		  ol.control.CustomOverviewMap.prototype.handleDownEvent, false, this);
  goog.events.listen(this.ovmap_, ol.MapBrowserEvent.EventType.POINTERDRAG,
		  ol.control.CustomOverviewMap.prototype.handleDragEvent, false, this);
  goog.events.listen(this.ovmap_, ol.MapBrowserEvent.EventType.POINTERUP,
		  ol.control.CustomOverviewMap.prototype.handleUpEvent, false, this);

  goog.base(this, {
    element: element,
    render: render,
    target: options.target
  });
};
goog.inherits(ol.control.CustomOverviewMap, ol.control.Control);

ol.control.CustomOverviewMap.prototype.handleDownEvent = function(evt) {
   if (this.isdragging)
	   return false;
   
   var bottomLeft = this.getOverviewMap().getPixelFromCoordinate(
		   this.boxOverlay_.getPosition());
   var dims = this.getOverviewBoxDimensions();
   var topRight = [bottomLeft[0]+dims[0], bottomLeft[1]-dims[1]];
   var pix = this.getOverviewMap().getPixelFromCoordinate(evt.coordinate);
   if (pix[0] > bottomLeft[0] && pix[1] > topRight[1] &&
		   pix[0] < topRight[0] && pix[1] < bottomLeft[1]) {
	   this.isdragging = true;
	   return true;
   }

	  return false;
 };
 ol.control.CustomOverviewMap.prototype.handleDragEvent = function(evt) {
	   
	   if (!this.isdragging)
		   return;
	   if (!(evt.browserEvent.event_ instanceof MouseEvent))
		   return;
	   
	   var oldCenter = this.getOverviewMap().getPixelFromCoordinate(evt.coordinate);
	   var boxdims = this.getOverviewBoxDimensions();
	   newCenter = this.getOverviewMap().getCoordinateFromPixel(oldCenter);
	   
	   if (evt.browserEvent.event_.button & 1) evt.browserEvent.event_.which = 1;
	   if (evt.browserEvent.event_.which == 0) {
	   		this.isdragging = false;
		   this.dispatchEvent(ol.MapBrowserEvent.EventType.POINTERUP);
		   this.getMap().getView().setCenter(newCenter);
	   }

	   var dimsOfOverview = this.getOverviewMapDimensions();
	   if (oldCenter[0] < 0 || oldCenter[0] > dimsOfOverview[0] ||
			   oldCenter[1] > dimsOfOverview[1] || oldCenter[1] < 0)
			return;
	   
	   this.boxOverlay_.setPosition(
			   this.getOverviewMap().getCoordinateFromPixel(
					   [oldCenter[0]-boxdims[0]/2,oldCenter[1]+boxdims[1]/2]));
	   if (newCenter[0] < 0 || newCenter[1] > 0)
		   return;

	   this.getMap().getView().setCenter(newCenter);
	   
};

ol.control.CustomOverviewMap.prototype.getOverviewBoxDimensions = function(){
	if (this.boxOverlay_) {
		var el = this.boxOverlay_.getElement();
		return [ol.dom.outerWidth(el), ol.dom.outerHeight(el)];
	}
	return null;
};

ol.control.CustomOverviewMap.prototype.getOverviewMapDimensions = function() {
	if (this.getOverviewMap()) {
		var el = this.getOverviewMap().getViewport();
		return [ol.dom.outerWidth(el), ol.dom.outerHeight(el)];
	}
	return null;
};

ol.control.CustomOverviewMap.prototype.handleUpEvent = function(evt) {
	   this.isdragging = false;

	return false;
};
 
ol.control.CustomOverviewMap.prototype.setMap = function(map) {
  var oldMap = this.getMap();
  if (map === oldMap) {
    return;
  }
  if (oldMap) {
    var oldView = oldMap.getView();
    if (oldView) {
      this.unbindView_(oldView);
    }
  }
  goog.base(this, 'setMap', map);

  if (map) {
    this.listenerKeys.push(goog.events.listen(
        map, ol.ObjectEventType.PROPERTYCHANGE,
        this.handleMapPropertyChange_, false, this));

    // TODO: to really support map switching, this would need to be reworked
    if (this.ovmap_.getLayers().getLength() === 0) {
      this.ovmap_.setLayerGroup(map.getLayerGroup());
    }

    var view = map.getView();
    if (view) {
      this.bindView_(view);
      if (view.isDef()) {
        this.ovmap_.updateSize();
        this.resetExtent_();
      }
    }
  }
};
ol.control.CustomOverviewMap.prototype.handleMapPropertyChange_ = function(event) {
  if (event.key === ol.MapProperty.VIEW) {
    var oldView = /** @type {ol.View} */ (event.oldValue);
    if (oldView) {
      this.unbindView_(oldView);
    }
    var newView = this.getMap().getView();
    this.bindView_(newView);
  }
};
ol.control.CustomOverviewMap.prototype.bindView_ = function(view) {
  goog.events.listen(view,
      ol.Object.getChangeEventType(ol.ViewProperty.ROTATION),
      this.handleRotationChanged_, false, this);
};


/**
 * Unregister listeners for view property changes.
 * @param {ol.View} view The view.
 * @private
 */
ol.control.CustomOverviewMap.prototype.unbindView_ = function(view) {
  goog.events.unlisten(view,
      ol.Object.getChangeEventType(ol.ViewProperty.ROTATION),
      this.handleRotationChanged_, false, this);
};
ol.control.CustomOverviewMap.prototype.handleRotationChanged_ = function() {
  this.ovmap_.getView().setRotation(this.getMap().getView().getRotation());
};
ol.control.CustomOverviewMap.render = function(mapEvent) {
  this.validateExtent_();
  this.updateBox_();
};
ol.control.CustomOverviewMap.prototype.validateExtent_ = function() {
  var map = this.getMap();
  var ovmap = this.ovmap_;

  if (!map.isRendered() || !ovmap.isRendered()) {
    return;
  }

  var mapSize = map.getSize();
  goog.asserts.assertArray(mapSize, 'mapSize should be an array');

  var view = map.getView();
  goog.asserts.assert(view, 'view should be defined');
  var extent = view.calculateExtent(mapSize);

  var ovmapSize = ovmap.getSize();
  goog.asserts.assertArray(ovmapSize, 'ovmapSize should be an array');

  var ovview = ovmap.getView();
  goog.asserts.assert(ovview, 'ovview should be defined');
  var ovextent = ovview.calculateExtent(ovmapSize);

  var topLeftPixel =
      ovmap.getPixelFromCoordinate(ol.extent.getTopLeft(extent));
  var bottomRightPixel =
      ovmap.getPixelFromCoordinate(ol.extent.getBottomRight(extent));
  var boxSize = new goog.math.Size(
      Math.abs(topLeftPixel[0] - bottomRightPixel[0]),
      Math.abs(topLeftPixel[1] - bottomRightPixel[1]));

  var ovmapWidth = ovmapSize[0];
  var ovmapHeight = ovmapSize[1];

  if (boxSize.width < ovmapWidth * ol.OVERVIEWMAP_MIN_RATIO ||
      boxSize.height < ovmapHeight * ol.OVERVIEWMAP_MIN_RATIO ||
      boxSize.width > ovmapWidth * ol.OVERVIEWMAP_MAX_RATIO ||
      boxSize.height > ovmapHeight * ol.OVERVIEWMAP_MAX_RATIO) {
    this.resetExtent_();
  } else if (!ol.extent.containsExtent(ovextent, extent)) {
    this.recenter_();
  }
};
ol.control.CustomOverviewMap.prototype.resetExtent_ = function() {
  if (ol.OVERVIEWMAP_MAX_RATIO === 0 || ol.OVERVIEWMAP_MIN_RATIO === 0) {
    return;
  }

  var map = this.getMap();
  var ovmap = this.ovmap_;

  var mapSize = map.getSize();
  goog.asserts.assertArray(mapSize, 'mapSize should be an array');

  var view = map.getView();
  goog.asserts.assert(view, 'view should be defined');
  var extent = view.calculateExtent(mapSize);

  var ovmapSize = ovmap.getSize();
  goog.asserts.assertArray(ovmapSize, 'ovmapSize should be an array');

  var ovview = ovmap.getView();
  goog.asserts.assert(ovview, 'ovview should be defined');

  // get how many times the current map overview could hold different
  // box sizes using the min and max ratio, pick the step in the middle used
  // to calculate the extent from the main map to set it to the overview map,
  var steps = Math.log(
      ol.OVERVIEWMAP_MAX_RATIO / ol.OVERVIEWMAP_MIN_RATIO) / Math.LN2;
  var ratio = 1 / (Math.pow(2, steps / 2) * ol.OVERVIEWMAP_MIN_RATIO);
  ol.extent.scaleFromCenter(extent, ratio);
  ovview.fit(extent, ovmapSize);
};
ol.control.CustomOverviewMap.prototype.recenter_ = function() {
  var map = this.getMap();
  var ovmap = this.ovmap_;

  var view = map.getView();
  goog.asserts.assert(view, 'view should be defined');

  var ovview = ovmap.getView();
  goog.asserts.assert(ovview, 'ovview should be defined');

  ovview.setCenter(view.getCenter());
};
ol.control.CustomOverviewMap.prototype.updateBox_ = function() {
  var map = this.getMap();
  var ovmap = this.ovmap_;

  if (!map.isRendered() || !ovmap.isRendered()) {
    return;
  }

  var mapSize = map.getSize();
  goog.asserts.assertArray(mapSize, 'mapSize should be an array');

  var view = map.getView();
  goog.asserts.assert(view, 'view should be defined');

  var ovview = ovmap.getView();
  goog.asserts.assert(ovview, 'ovview should be defined');

  var ovmapSize = ovmap.getSize();
  goog.asserts.assertArray(ovmapSize, 'ovmapSize should be an array');

  var rotation = view.getRotation();
  goog.asserts.assert(rotation !== undefined, 'rotation should be defined');

  var overlay = this.boxOverlay_;
  var box = this.boxOverlay_.getElement();
  var extent = view.calculateExtent(mapSize);
  var ovresolution = ovview.getResolution();
  var bottomLeft = ol.extent.getBottomLeft(extent);
  var topRight = ol.extent.getTopRight(extent);

  // set position using bottom left coordinates
  var rotateBottomLeft = this.calculateCoordinateRotate_(rotation, bottomLeft);
  overlay.setPosition(rotateBottomLeft);

  // set box size calculated from map extent size and overview map resolution
  if (box) {
    var boxWidth = Math.abs((bottomLeft[0] - topRight[0]) / ovresolution);
    var boxHeight = Math.abs((topRight[1] - bottomLeft[1]) / ovresolution);
    goog.style.setBorderBoxSize(box, new goog.math.Size(
        boxWidth, boxHeight));
  }
};
ol.control.CustomOverviewMap.prototype.calculateCoordinateRotate_ = function(
    rotation, coordinate) {
  var coordinateRotate;

  var map = this.getMap();
  var view = map.getView();
  goog.asserts.assert(view, 'view should be defined');

  var currentCenter = view.getCenter();

  if (currentCenter) {
    coordinateRotate = [
      coordinate[0] - currentCenter[0],
      coordinate[1] - currentCenter[1]
    ];
    ol.coordinate.rotate(coordinateRotate, rotation);
    ol.coordinate.add(coordinateRotate, currentCenter);
  }
  return coordinateRotate;
};
ol.control.CustomOverviewMap.prototype.handleClick_ = function(event) {
  event.preventDefault();
  this.handleToggle_();
};
ol.control.CustomOverviewMap.prototype.handleToggle_ = function() {
  goog.dom.classlist.toggle(this.element, 'ol-collapsed');
  if (this.collapsed_) {
    goog.dom.replaceNode(this.collapseLabel_, this.label_);
  } else {
    goog.dom.replaceNode(this.label_, this.collapseLabel_);
  }
  this.collapsed_ = !this.collapsed_;

  // manage overview map if it had not been rendered before and control
  // is expanded
  var ovmap = this.ovmap_;
  if (!this.collapsed_ && !ovmap.isRendered()) {
    ovmap.updateSize();
    this.resetExtent_();
    goog.events.listenOnce(ovmap, ol.MapEventType.POSTRENDER,
        function(event) {
          this.updateBox_();
        },
        false, this);
  }
};
ol.control.CustomOverviewMap.prototype.getCollapsible = function() {
  return this.collapsible_;
};
ol.control.CustomOverviewMap.prototype.setCollapsible = function(collapsible) {
  if (this.collapsible_ === collapsible) {
    return;
  }
  this.collapsible_ = collapsible;
  goog.dom.classlist.toggle(this.element, 'ol-uncollapsible');
  if (!collapsible && this.collapsed_) {
    this.handleToggle_();
  }
};
ol.control.CustomOverviewMap.prototype.setCollapsed = function(collapsed) {
  if (!this.collapsible_ || this.collapsed_ === collapsed) {
    return;
  }
  this.handleToggle_();
};
ol.control.CustomOverviewMap.prototype.getCollapsed = function() {
  return this.collapsed_;
};
ol.control.CustomOverviewMap.prototype.getOverviewMap = function() {
  return this.ovmap_;
};

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'getOverviewMap',
    ol.control.CustomOverviewMap.prototype.getOverviewMap);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'getMap',
    ol.control.CustomOverviewMap.prototype.getMap);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'setMap',
    ol.control.CustomOverviewMap.prototype.setMap);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'setTarget',
    ol.control.CustomOverviewMap.prototype.setTarget);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'get',
    ol.control.CustomOverviewMap.prototype.get);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'getKeys',
    ol.control.CustomOverviewMap.prototype.getKeys);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'getProperties',
    ol.control.CustomOverviewMap.prototype.getProperties);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'set',
    ol.control.CustomOverviewMap.prototype.set);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'setProperties',
    ol.control.CustomOverviewMap.prototype.setProperties);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'unset',
    ol.control.CustomOverviewMap.prototype.unset);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'changed',
    ol.control.CustomOverviewMap.prototype.changed);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'dispatchEvent',
    ol.control.CustomOverviewMap.prototype.dispatchEvent);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'getRevision',
    ol.control.OverviewMap.prototype.getRevision);

goog.exportProperty(
    ol.control.OverviewMap.prototype,
    'on',
    ol.control.OverviewMap.prototype.on);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'once',
    ol.control.CustomOverviewMap.prototype.once);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'un',
    ol.control.CustomOverviewMap.prototype.un);

goog.exportProperty(
    ol.control.CustomOverviewMap.prototype,
    'unByKey',
    ol.control.OverviewMap.prototype.unByKey);
