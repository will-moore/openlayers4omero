goog.provide('ome.source.Omero');

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

ome.source.Omero = function(opts) {
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
goog.inherits(ome.source.Omero, ol.source.TileImage);

ome.source.Omero.prototype.getImageId = function() {
	  return this.imageId_;
}

ome.source.Omero.prototype.setImageId = function(value) {
	  this.imageId_ = value;
}

ome.source.Omero.prototype.getPlane = function() {
	  return this.plane_;
}

ome.source.Omero.prototype.setPlane = function(value) {
	  this.plane_ = value;
}

ome.source.Omero.prototype.getTime = function() {
	  return this.time_;
}

ome.source.Omero.prototype.setTime = function(value) {
	  this.time_ = value;
}

ome.source.Omero.prototype.getChannel = function() {
	  return this.channel_;
}

ome.source.Omero.prototype.setChannel = function(value) {
	  this.channel_ = value;
}






goog.provide('ome.control.Draw');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('ol.animation');
goog.require('ol.control.Control');
goog.require('ol.css');
goog.require('ol.easing');


ome.control.Draw = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var className = options.className ? options.className : 'ol-draw';

  var rectElement = goog.dom.createDom('BUTTON', {
    'class': className + '-rectangle',
    'type' : 'button',
    'title': 'Draw Rectangle'
  }, '[R]');

  goog.events.listen(rectElement,
      goog.events.EventType.CLICK, goog.partial(
          ome.control.Draw.prototype.drawRectangle_), false, this);

  var polyElement = goog.dom.createDom('BUTTON', {
    'class': className + '-polygon',
    'type' : 'button',
    'title': 'Draw Polygon'
  }, '[G]');

  goog.events.listen(polyElement,
      goog.events.EventType.CLICK, goog.partial(
          ome.control.Draw.prototype.drawPolygon_), false, this);

  var lineElement = goog.dom.createDom('BUTTON', {
	    'class': className + '-line',
	    'type' : 'button',
	    'title': 'Draw Line'
	  }, '[L]');

  goog.events.listen(lineElement,
      goog.events.EventType.CLICK, goog.partial(
          ome.control.Draw.prototype.drawLine_), false, this);

  var pointElement = goog.dom.createDom('BUTTON', {
	    'class': className + '-point',
	    'type' : 'button',
	    'title': 'Draw Point'
	  }, '[P]');

goog.events.listen(pointElement,
    goog.events.EventType.CLICK, goog.partial(
        ome.control.Draw.prototype.drawPoint_), false, this);

var circleElement = goog.dom.createDom('BUTTON', {
    'class': className + '-circle',
    'type' : 'button',
    'title': 'Draw Circle'
  }, '[C]');

goog.events.listen(circleElement,
goog.events.EventType.CLICK, goog.partial(
    ome.control.Draw.prototype.drawCircle_), false, this);

var drawBar = goog.dom.createDom('DIV', className + '-bar left',  
	rectElement, polyElement, lineElement, pointElement, circleElement);

var textFont = goog.dom.createDom('SELECT', 
	{'title': 'Font Family', 'id' : 'featFont','value' : 'Arial', 'style' : 'margin-top: 3px;width:150px'});
goog.dom.append(textFont, goog.dom.createDom('OPTION', {'value' : 'Arial'}, 'Arial'));
goog.dom.append(textFont, goog.dom.createDom('OPTION', {'value' : 'Courier New'}, 'Courier New'));
goog.dom.append(textFont, goog.dom.createDom('OPTION', {'value' : 'Verdana'}, 'Verdana'));

var textInput = goog.dom.createDom('INPUT',
	{'title': 'Text', 'id' : 'featText', 'type' : 'text', 'style' : 'margin-top: 3px'});
var fontSize = goog.dom.createDom('INPUT',
	{'title': 'Font Size (incl. units, e.g. px)', 'id' : 'featFontSize', 'type' : 'text', 'value' : '15px', 'style' : 'margin-top: 3px; margin-left: 3px;width: 50px'});
var fontStyle = goog.dom.createDom('INPUT',
	{'title': 'Font Style, e.g. Normal, Bold','id' : 'featFontStyle', 'type' : 'text', 'value' : 'Normal', 'style' : 'margin-top: 3px; margin-left: 3px;width: 50px'});

var fillColor = goog.dom.createDom('INPUT',
	{'title': 'Fill Color','id' : 'fillColor', 'type' : 'text', 'style' : 'margin-top: 3px;margin-left: 3px;width: 50px'});
var fillAlpha = goog.dom.createDom('INPUT',
	{'title': 'Fill Alpha (>= 0 && <= 1.0)','id' : 'fillAlpha', 'type' : 'text', 'style' : 'margin-top: 3px;margin-left: 3px;width: 50px'});

var strokeColor = goog.dom.createDom('INPUT', 
	{'title': 'Stroke Color', 'id' : 'strokeColor', 'type' : 'text', 'style' : 'margin-top: 3px;'});
var strokeAlpha = goog.dom.createDom('INPUT',
	{'title': 'Stroke Alpha (>= 0 && <= 1.0)','id' : 'strokeAlpha', 'type' : 'text', 'style' : 'margin-top: 3px;width: 50px;margin-left: 3px'});
var strokeWidth = goog.dom.createDom('INPUT',
	{'title': 'Stroke Width', 'id' : 'strokeWidth', 'type' : 'text', 'style' : 'margin-top: 3px;width: 50px;margin-left: 3px'});

var updateButton = goog.dom.createDom('BUTTON', {
    'type' : 'button',
    'title': 'Update Selected Feature',
    'style' : 'margin-top: 5px; width: 100%'
  }, 'Update');

goog.events.listen(updateButton,
	goog.events.EventType.CLICK, goog.partial(
	    ome.control.Draw.prototype.updateFeatureProperties_), false, this);

var propertyDiv = goog.dom.createDom('DIV', 
		{'class' : className + '-properties right'},
		textFont, fontStyle, fontSize, textInput, fillColor, fillAlpha, strokeColor, strokeAlpha, strokeWidth, updateButton);

var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
      ol.css.CLASS_CONTROL;
  var element = goog.dom.createDom('DIV', cssClasses, drawBar, propertyDiv);

  
  goog.base(this, {
    element: element,
    target: options.target
  });
  
};
goog.inherits(ome.control.Draw, ol.control.Control);

ome.control.Draw.prototype.displayFeatureProperties = function(feature) {
	if (!(feature instanceof ol.Feature)) return;
	
	var presentStyle = feature.getStyle();
	
	// TODO: move app code out of there
	var stroke = presentStyle ? presentStyle.getStroke() : null;
	var strokeColor = "#000000";
	var strokeAlpha = 1.0;
	var strokeWidth =  1;
	var tmp = null;
	if (stroke) {
		strokeWidth = stroke.getWidth();
		tmp = app.convertRgbaStringToHexRgbString(stroke.getColor());
		if (tmp) {
			strokeColor = tmp.rgb;
			strokeAlpha = tmp.alpha;
		}
	}
	var fill =  presentStyle ? presentStyle.getFill() : null;
	var fillColor = "#ffffff";
	var fillAlpha = 1.0;
	if (fill) {
		tmp = app.convertRgbaStringToHexRgbString(fill.getColor());
		if (tmp) {
			fillColor = tmp.rgb;
			fillAlpha = tmp.alpha;
		}
	}
	var textStyle =  presentStyle ? presentStyle.getText() : null;
	var text = '';
	var fontFamily = 'Arial';
	var fontSize = '10px';
	var fontStyle = 'Normal';
	if (textStyle) {
		text = textStyle.getText();
		var font = textStyle.getFont();
		if (font) {
			var fontTok = font.split(' ');
			for (t in fontTok) {
				if (t == 0)
					fontStyle = fontTok[t];
				else if (t == 1)
					fontSize = fontTok[t];
				else if (t == 2)
					fontFamily = fontTok[t];
			}
		}
	}
	goog.dom.getElement("featText").value = text;
	goog.dom.getElement("featFont").value = fontFamily;
	goog.dom.getElement("featFontStyle").value = fontStyle;
	goog.dom.getElement("featFontSize").value = fontSize;
	goog.dom.getElement("fillColor").value = fillColor;
	goog.dom.getElement("fillAlpha").value = fillAlpha;
	goog.dom.getElement("strokeColor").value = strokeColor;
	goog.dom.getElement("strokeAlpha").value = strokeAlpha;
	goog.dom.getElement("strokeWidth").value = strokeWidth;
}

ome.control.Draw.prototype.activateDraw = function(flag, remove) {
	var setActiveOrNot = false;
	if (typeof(flag) == 'boolean') setActiveOrNot = flag;
	var delInter = remove || false;
	
	this.getMap().getInteractions().forEach(
		function(item) {
			if (item instanceof ol.interaction.Draw)  {
				if (setActiveOrNot) item.setActive(true);
				else {
					if (delInter) app.viewport.removeInteraction(item);
					else item.setActive(false);
				}
			} else if (item instanceof ol.interaction.Select ||
					item instanceof ol.interaction.Translate ||
					item instanceof ol.interaction.Modify ||
					item instanceof ol.interaction.DragBox)  {
				if (setActiveOrNot) item.setActive(false); // drawing and modifying mutually exclusive
				else item.setActive(true);
			}
		}
	);
};

ome.control.Draw.prototype.drawShapeCommonCode_ = function(shape, onDrawEnd, geometryFunction) {
	if (typeof(shape) != 'string')
		shape = 'Point';
	var onDrawEndAction = onDrawEnd || function(event) {
		this.getMap().getSelectedFeatures().clear();
		this.activateDraw(false, true);
	};
	
	this.activateDraw(false, true);
	var draw = new ol.interaction.Draw({
		source: this.getMap().getLayers().item(
				this.getMap().getLayers().getLength()-1).getSource(),
		type: shape,
		geometryFunction: geometryFunction ? geometryFunction : null
	});
	this.getMap().addInteraction(draw);
	this.activateDraw(true);
	draw.on(ol.interaction.DrawEventType.DRAWEND, onDrawEndAction, this);
}

ome.control.Draw.prototype.drawRectangle_ = function(event) {
	this.drawShapeCommonCode_('Circle', function(event) {
		if (event.feature)
			event.feature.getGeometry().type = "Rectangle";
		this.activateDraw(false, true);}, 
		ol.interaction.Draw.createRegularPolygon(4, Math.PI / 4));
};

ome.control.Draw.prototype.updateFeatureProperties_ = function(event) {
	var selectedFeatures = this.getMap().getSelectedFeatures();
	if (selectedFeatures.getLength() == 0) return;
	
	var textStyle = null;
	var text = goog.dom.getElement("featText").value;
	if (text && text.replace(/\s/g, '').length > 0) {
		textStyle = new ol.style.Text({text: text});
		var font = "";
		var fontFamily = goog.dom.getElement("featFont").value;
		var fontStyle = goog.dom.getElement("featFontStyle").value.replace(/\s/g, '');
		var fontSize =  goog.dom.getElement("featFontSize").value.replace(/\s/g, '');
		if (fontStyle.length > 0) font = fontStyle
		else font = "Normal";
		if (fontSize.length > 0) font += " " + fontSize
		else font += " 10px";
		if (fontFamily.length > 0) font += " " + fontFamily
		else font += " Arial";
		textStyle.setFont(font);
	}
	var fill = null;
	var fillColor = goog.dom.getElement("fillColor").value;
	var fillAlpha = goog.dom.getElement("fillAlpha").value;
	try {
		fill = new ol.style.Fill( {color: app.convertHexRgbStringToRgbaString(fillColor, fillAlpha)});
	} catch (ignored) {}
	var stroke = null;	
	var strokeColor = goog.dom.getElement("strokeColor").value;
	var strokeAlpha = goog.dom.getElement("strokeAlpha").value;
	var strokeWidth = goog.dom.getElement("strokeWidth").value;
	try {
		stroke = new ol.style.Stroke( 
			{color: app.convertHexRgbStringToRgbaString(strokeColor, strokeAlpha),
				width: parseFloat(strokeWidth)
		});
	} catch (ignored) {}
	
	
	if (textStyle == null && fill == null && stroke == null)
		return;
		
	var updatedStyle = new ol.style.Style({
		text : textStyle,
		fill : fill,
		stroke : stroke
	});
	selectedFeatures.forEach(function(feature) {
		feature.setStyle(updatedStyle);
		});	
};

ome.control.Draw.prototype.drawPolygon_ = function(event) {
	this.drawShapeCommonCode_('Polygon');
};

ome.control.Draw.prototype.drawLine_ = function(event) {
	this.drawShapeCommonCode_('LineString');
};

ome.control.Draw.prototype.drawPoint_ = function(event) {
	this.drawShapeCommonCode_('Point');
};

ome.control.Draw.prototype.drawCircle_ = function(event) {
	this.drawShapeCommonCode_('Circle');
};






goog.provide('ome.interaction.Modify');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('ol');
goog.require('ol.Collection');
goog.require('ol.CollectionEventType');
goog.require('ol.Feature');
goog.require('ol.MapBrowserEvent.EventType');
goog.require('ol.MapBrowserPointerEvent');
goog.require('ol.ViewHint');
goog.require('ol.coordinate');
goog.require('ol.events.condition');
goog.require('ol.extent');
goog.require('ol.geom.GeometryType');
goog.require('ol.geom.LineString');
goog.require('ol.geom.MultiLineString');
goog.require('ol.geom.MultiPoint');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.interaction.Pointer');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.structs.RBush');


ome.interaction.Modify = function(options) {
	  goog.base(this, options);
	  this.handleDownEvent_ = ome.interaction.Modify.handleDownEvent_;
	  this.handleDragEvent_ = ome.interaction.Modify.handleDragEvent_;
	  this.handleEvent = ome.interaction.Modify.handleEvent;
	  this.handleUpEvent_ = ome.interaction.Modify.handleUpEvent_;
};
goog.inherits(ome.interaction.Modify, ol.interaction.Modify);


ome.interaction.Modify.handleDownEvent_ = function(evt) {
  this.handlePointerAtPixel_(evt.pixel, evt.map);
  this.dragSegments_ = [];
  this.modified_ = false;
  var vertexFeature = this.vertexFeature_;
  if (vertexFeature) {
    var insertVertices = [];
    var geometry = /** @type {ol.geom.Point} */ (vertexFeature.getGeometry());
    var vertex = geometry.getCoordinates();
    var vertexExtent = ol.extent.boundingExtent([vertex]);
    var segmentDataMatches = this.rBush_.getInExtent(vertexExtent);
    var componentSegments = {};
    segmentDataMatches.sort(ol.interaction.Modify.compareIndexes_);
    for (var i = 0, ii = segmentDataMatches.length; i < ii; ++i) {
      var segmentDataMatch = segmentDataMatches[i];
      var segment = segmentDataMatch.segment;
      var uid = goog.getUid(segmentDataMatch.feature);
      var depth = segmentDataMatch.depth;
      if (depth) {
        uid += '-' + depth.join('-'); // separate feature components
      }
      if (!componentSegments[uid]) {
        componentSegments[uid] = new Array(2);
      }
      if (ol.coordinate.equals(segment[0], vertex) &&
          !componentSegments[uid][0]) {
        this.dragSegments_.push([segmentDataMatch, 0]);
        componentSegments[uid][0] = segmentDataMatch;
      } else if (ol.coordinate.equals(segment[1], vertex) &&
          !componentSegments[uid][1]) {

        // prevent dragging closed linestrings by the connecting node
    	var type = segmentDataMatch.geometry.type || segmentDataMatch.geometry.getType();
        if ((type ===
            ol.geom.GeometryType.LINE_STRING ||
            type ===
            ol.geom.GeometryType.MULTI_LINE_STRING ||
            type === 'Rectangle') &&
            componentSegments[uid][0] &&
            componentSegments[uid][0].index === 0) {
          continue;
        }

        this.dragSegments_.push([segmentDataMatch, 1]);
        componentSegments[uid][1] = segmentDataMatch;
      } else if (goog.getUid(segment) in this.vertexSegments_ &&
          (!componentSegments[uid][0] && !componentSegments[uid][1])) {
        insertVertices.push([segmentDataMatch, vertex]);
      }
    }
    if (insertVertices.length) {
      this.willModifyFeatures_(evt);
    }
    for (var j = insertVertices.length - 1; j >= 0; --j) {
      this.insertVertex_.apply(this, insertVertices[j]);
    }
  }
  return !!this.vertexFeature_;
};


ome.interaction.Modify.handleDragEvent_ = function(evt) {
  this.ignoreNextSingleClick_ = false;
  this.willModifyFeatures_(evt);

  var vertex = evt.coordinate;
  for (var i = 0, ii = this.dragSegments_.length; i < ii; ++i) {
    var dragSegment = this.dragSegments_[i];
    var segmentData = dragSegment[0];
    var depth = segmentData.depth;
    var geometry = segmentData.geometry;
    var coordinates = geometry.getCoordinates();
    var segment = segmentData.segment;
    var index = dragSegment[1];

    while (vertex.length < geometry.getStride()) {
      vertex.push(0);
    }

    var type = geometry.type || geometry.getType();
    switch (type) {
      case ol.geom.GeometryType.POINT:
        coordinates = vertex;
        segment[0] = segment[1] = vertex;
        break;
      case ol.geom.GeometryType.MULTI_POINT:
        coordinates[segmentData.index] = vertex;
        segment[0] = segment[1] = vertex;
        break;
      case ol.geom.GeometryType.LINE_STRING:
        coordinates[segmentData.index + index] = vertex;
        segment[index] = vertex;
        break;
      case ol.geom.GeometryType.MULTI_LINE_STRING:
        coordinates[depth[0]][segmentData.index + index] = vertex;
        segment[index] = vertex;
        break;
      case ol.geom.GeometryType.POLYGON:
        coordinates[depth[0]][segmentData.index + index] = vertex;
        segment[index] = vertex;
        break;
      case ol.geom.GeometryType.MULTI_POLYGON:
        coordinates[depth[1]][depth[0]][segmentData.index + index] = vertex;
        segment[index] = vertex;
        break;
      case "Rectangle": // TODO: create geom Rectangle/4gon
    	  var vertexBeingDragged = 
    		  this.vertexFeature_.getGeometry().getCoordinates();
    	  if (this.oppVertBeingDragged == null) 
	    	  for (var j=0;j<coordinates[depth[0]].length;j++)
	    		  if (coordinates[depth[0]][j][0] !=  vertexBeingDragged[0] && 
	    				coordinates[depth[0]][j][1] !=  vertexBeingDragged[1]) { 
	    			this.oppVertBeingDragged = coordinates[depth[0]][j];
	    			break;
	    		  }
    		  
    	  coordinates[depth[0]][0] = vertex;
    	  coordinates[depth[0]][1] = [this.oppVertBeingDragged[0], vertex[1]];
    	  coordinates[depth[0]][2] = this.oppVertBeingDragged;
    	  coordinates[depth[0]][3] = [vertex[0], this.oppVertBeingDragged[1]];
    	  coordinates[depth[0]][4] = vertex;
    	  segment[index] = geometry.getExtent().slice(index*2, (index+1)*2);
          break;
        
      default:
        // pass
    }

    this.setGeometryCoordinates_(geometry, coordinates);
  }
  this.createOrUpdateVertexFeature_(vertex);
};


ome.interaction.Modify.handleUpEvent_ = function(evt) {
  this.oppVertBeingDragged = null;
  var segmentData;
  for (var i = this.dragSegments_.length - 1; i >= 0; --i) {
    segmentData = this.dragSegments_[i][0];
    
    var type = segmentData.geometry.type || segmentData.geometry.getType();
    if (type === 'Rectangle') {
    	this.rBush_.clear();
    	this.writePolygonGeometry_(segmentData.feature, segmentData.geometry);
    } else
    	this.rBush_.update(ol.extent.boundingExtent(segmentData.segment),
        segmentData);
  }
  if (this.modified_) {
    this.dispatchEvent(new ol.interaction.ModifyEvent(
        ol.ModifyEventType.MODIFYEND, this.features_, evt));
    this.modified_ = false;
  }
  return false;
};


ome.interaction.Modify.handleEvent = function(mapBrowserEvent) {
  if (!(mapBrowserEvent instanceof ol.MapBrowserPointerEvent)) {
    return true;
  }

  var handled;
  if (!mapBrowserEvent.map.getView().getHints()[ol.ViewHint.INTERACTING] &&
      mapBrowserEvent.type == ol.MapBrowserEvent.EventType.POINTERMOVE &&
      !this.handlingDownUpSequence) {
    this.handlePointerMove_(mapBrowserEvent);
  }
  if (this.vertexFeature_ && this.deleteCondition_(mapBrowserEvent)) {
    if (mapBrowserEvent.type != ol.MapBrowserEvent.EventType.SINGLECLICK ||
        !this.ignoreNextSingleClick_) {
      var geometry = this.vertexFeature_.getGeometry();
      goog.asserts.assertInstanceof(geometry, ol.geom.Point,
          'geometry should be an ol.geom.Point');
      this.willModifyFeatures_(mapBrowserEvent);
      handled = this.removeVertex_();
      this.dispatchEvent(new ol.interaction.ModifyEvent(
          ol.ModifyEventType.MODIFYEND, this.features_, mapBrowserEvent));
      this.modified_ = false;
    } else {
      handled = true;
    }
  }

  if (mapBrowserEvent.type == ol.MapBrowserEvent.EventType.SINGLECLICK) {
    this.ignoreNextSingleClick_ = false;
  }

  return ol.interaction.Pointer.handleEvent.call(this, mapBrowserEvent) &&
      !handled;
};


ome.interaction.Modify.prototype.handlePointerAtPixel_ = function(pixel, map) {
  var pixelCoordinate = map.getCoordinateFromPixel(pixel);
  var sortByDistance = function(a, b) {
    return ol.coordinate.squaredDistanceToSegment(pixelCoordinate, a.segment) -
        ol.coordinate.squaredDistanceToSegment(pixelCoordinate, b.segment);
  };

  var lowerLeft = map.getCoordinateFromPixel(
      [pixel[0] - this.pixelTolerance_, pixel[1] + this.pixelTolerance_]);
  var upperRight = map.getCoordinateFromPixel(
      [pixel[0] + this.pixelTolerance_, pixel[1] - this.pixelTolerance_]);
  var box = ol.extent.boundingExtent([lowerLeft, upperRight]);

  var rBush = this.rBush_;
  var nodes = rBush.getInExtent(box);
  if (nodes.length > 0) {
    nodes.sort(sortByDistance);
    var node = nodes[0];
    var closestSegment = node.segment;
    var vertex = (ol.coordinate.closestOnSegment(pixelCoordinate,
        closestSegment));
    var vertexPixel = map.getPixelFromCoordinate(vertex);
    if (Math.sqrt(ol.coordinate.squaredDistance(pixel, vertexPixel)) <=
        this.pixelTolerance_) {
      var pixel1 = map.getPixelFromCoordinate(closestSegment[0]);
      var pixel2 = map.getPixelFromCoordinate(closestSegment[1]);
      var squaredDist1 = ol.coordinate.squaredDistance(vertexPixel, pixel1);
      var squaredDist2 = ol.coordinate.squaredDistance(vertexPixel, pixel2);
      var dist = Math.sqrt(Math.min(squaredDist1, squaredDist2));
      this.snappedToVertex_ = dist <= this.pixelTolerance_;
      var type = node.geometry.type || node.geometry.getType();
      if (type === 'Rectangle') this.snappedToVertex_ = true;
      if (this.snappedToVertex_) {
        vertex = squaredDist1 > squaredDist2 ?
            closestSegment[1] : closestSegment[0];
      }
      this.createOrUpdateVertexFeature_(vertex);
      var vertexSegments = {};
      vertexSegments[goog.getUid(closestSegment)] = true;
      var segment;
      for (var i = 1, ii = nodes.length; i < ii; ++i) {
        segment = nodes[i].segment;
        if ((ol.coordinate.equals(closestSegment[0], segment[0]) &&
            ol.coordinate.equals(closestSegment[1], segment[1]) ||
            (ol.coordinate.equals(closestSegment[0], segment[1]) &&
            ol.coordinate.equals(closestSegment[1], segment[0])))) {
          vertexSegments[goog.getUid(segment)] = true;
        } else {
          break;
        }
      }
      this.vertexSegments_ = vertexSegments;
      return;
    }
  }
  if (this.vertexFeature_) {
    this.overlay_.getSource().removeFeature(this.vertexFeature_);
    this.vertexFeature_ = null;
  }
};









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
  this.distToLowerLeft = [0,0];

  goog.events.listen(this.boxOverlay_.getElement(), goog.events.EventType.MOUSEDOWN,
		  ol.control.CustomOverviewMap.prototype.handleDownEvent, false, this);
  goog.events.listen(this.ovmap_.getViewport(), goog.events.EventType.MOUSEMOVE,
		  ol.control.CustomOverviewMap.prototype.handleDragEvent, false, this);
  goog.events.listen(this.ovmap_.getViewport(), goog.events.EventType.MOUSEUP,
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

   if (this.boxOverlay_.getElement() == evt.target) {
	   this.distToLowerLeft = [evt.offsetX, evt.offsetY];
	   this.isdragging = true;
	   return true;
   }

   return false;
 };
 ol.control.CustomOverviewMap.prototype.handleDragEvent = function(evt) {
	   if (!this.isdragging)
		   return;

	   var oldBoxPosInPix = this.getOverviewMap().getPixelFromCoordinate(
			this.boxOverlay_.getPosition());
	   var newBoxPosInPix = [evt.offsetX, evt.offsetY];
	   if (this.boxOverlay_.getElement() == evt.target){
		   var offsets = [evt.offsetX, evt.offsetY];
		   var deltaOff = [evt.offsetX - this.distToLowerLeft[0], evt.offsetY - this.distToLowerLeft[1]];
		   newBoxPosInPix = [oldBoxPosInPix[0] + deltaOff[0], oldBoxPosInPix[1] + deltaOff[1]];
	   } else 
		   newBoxPosInPix = [evt.offsetX-this.distToLowerLeft[0], evt.offsetY+this.distToLowerLeft[1]];
	   
	   this.boxOverlay_.setPosition(
			   this.getOverviewMap().getCoordinateFromPixel(newBoxPosInPix));
};

ol.control.CustomOverviewMap.prototype.getOverviewBoxDimensions = function(){
	if (this.boxOverlay_) {
		var el = this.boxOverlay_.getElement();
		return [ol.dom.outerWidth(el), ol.dom.outerHeight(el)];
	}
	return null;
};
ol.control.CustomOverviewMap.prototype.handleUpEvent = function(evt) {
	if (this.isdragging) {
		this.isdragging = false;
		this.distToLowerLeft = [0,0];
	
		var oldBoxPosInPix = this.getOverviewMap().getPixelFromCoordinate(
			this.boxOverlay_.getPosition());
		this.getMap().getView().setCenter(
			this.getOverviewMap().getCoordinateFromPixel(
					[oldBoxPosInPix[0] + evt.offsetX,oldBoxPosInPix[1]-evt.offsetY]));
	
		return false;
	}
	
    if (this.boxOverlay_.getElement() == evt.target) return false;
  
	var boxDims = this.getOverviewBoxDimensions();
		this.getMap().getView().setCenter(
			this.getOverviewMap().getCoordinateFromPixel(
					[evt.offsetX,evt.offsetY]));
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

