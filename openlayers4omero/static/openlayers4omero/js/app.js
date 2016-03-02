var app = function() {
	return {
		images : {},
		viewport : null,
		defaultResolutions : [2.25, 2.0, 1.75, 1.5,1.25,1.0,0.75,0.5, 0.25],
		init : function() {
			app.fetchDatasets();
		},
		getCookie : function(name) {
			if (typeof(name) != 'string')
				return "";
			
		    var all = document.cookie.split(';');
		    for(var i=0, ii = all.length;i<ii; i++) {
		        var cookie = all[i];
		        while (cookie.charAt(0)==' ') cookie = cookie.substring(1);
		        if (cookie.indexOf(name + '=') == 0) return cookie.substring(name.length+1,cookie.length);
		    }
		    return "";
		},
		sendRequest : function(params) {
			if (typeof(params) != 'object' || typeof(params['url']) != 'string') {
				console.error("Could not send request without a url!");
				return;
			}
			var url = params.url;
			var method = (typeof(params['method']) == 'string') ? params.method.toUpperCase() : "GET";
			var headers = (typeof(params['headers']) == 'object') ? params.headers : {};
			var content = (typeof(params['content']) == 'string') ? params.content : null;
			var timeout =  (typeof(params['content']) == 'number') ? params.timeout : 30 * 1000;
			var success =  (typeof(params['success']) == 'function' ?
				params.success : function(data) {console.info(data);});
			var failure =  (typeof(params['failure']) == 'function' ?
				params.failure : function(error) {console.error(error);});

			goog.net.XhrIo.send(url, function(e) {
			      var xhr = e.target;
			      var contentType = xhr.getResponseHeaders()["Content-Type"];
			      var content = (contentType && contentType.toLowerCase().indexOf('/json') >= 0) ?
			    		  xhr.getResponseJson() : xhr.getResponseText();
			      if (this.isSuccess()) success(content)
			      else failure(content);
			  }, method, content, headers);
		},
		fetchDatasets : function() {
			var params = {
				url: 'datasets',
				success: function(data) {
					if (data && data.datasets && data.datasets.length == 0) {
						console.error("No datasets found");
					} else if (data && data.datasets) {
						goog.dom.removeNode(
							goog.dom.getElement("annoying"));
						app.populateImageList(data.datasets);
					}
				}
			};
			goog.dom.getElement("ome_viewport").appendChild(
				goog.dom.createDom('H2', 
					{'id' : 'annoying'},
					'Loading Image List...'));
			app.sendRequest(params);	
		},
		populateImageList : function(data) {
			if (typeof(data) == 'undefined' || data == null)
				return;
			
			var imgEl = goog.dom.getElement("ome_images");
			var count = 0;
			var selected = 0;
			for (d in data)
				if (typeof(data[d]) == 'object' && typeof(data[d].images) == 'object' )
					for (i in data[d].images) {
						if (count == 0)
							selected = data[d].images[i].id;
						app.images[data[d].images[i].id] = data[d].images[i];
						app.images[data[d].images[i].id].rois = null;
						
						goog.dom.append(
							imgEl, 
							goog.dom.createDom('OPTION', 
								{'value' : data[d].images[i].id, 'selected' : (count == 0) ? 'selected' : ''},
								data[d].images[i].name));
								
						count++;
					}
			imgEl.size = count;
			goog.events.listen(imgEl, goog.events.EventType.CLICK, app.updateThumbnail);
			goog.events.listen(imgEl, goog.events.EventType.DBLCLICK, app.workWithImage);
			goog.style.setStyle(imgEl, "display", "block");
			goog.style.setStyle(goog.dom.getElement("ome_thumbnail"), "display", "block");
			imgEl.click();
		},
		initModifyMode : function() {
			var source = new ol.source.Vector({});
			app.viewport.addLayer(new ol.layer.Vector({
				source : source}));

			var select = new ol.interaction.Select();
			var selFeats = select.getFeatures();
			selFeats.on('add', function(event) {
				if (selFeats.getLength() > 1) return;
				app.viewport.getDrawControl().displayFeatureProperties(event.element);
			});
			app.viewport.addInteraction(select);
			app.viewport.getDrawControl = function() {
				var ret = null;
				if (app.viewport.getControls().getLength() == 0)
					return ret;
				app.viewport.getControls().forEach(
						function(item) {
							if (item instanceof ome.control.Draw) {
								ret = item;
								return;
							}
						}
					);
				return ret;
			}
			app.viewport.getSelectedFeatures = function() {
				var ret = new ol.Collection([]);
				if (app.viewport.getLayers().getLength() < 1)
					return ret;
				app.viewport.getInteractions().forEach(
						function(item) {
							if (item instanceof ol.interaction.Select) {
								ret = item.getFeatures();
								return;
							}
						}
					);
				return ret;
			}

			var dragBox = new ol.interaction.DragBox({
				condition: ol.events.condition.platformModifierKeyOnly
			});
			app.viewport.addInteraction(dragBox);

			dragBox.on('boxstart', function() {
				select.getFeatures().clear();
			});
			dragBox.on('boxend', function() {
				var extent = dragBox.getGeometry().getExtent();
				source.forEachFeatureIntersectingExtent(extent, function(feature) {
					select.getFeatures().push(feature);
				});
			});
			
			var translate = new ol.interaction.Translate({
				features: select.getFeatures()
			});
			app.viewport.addInteraction(translate);
			
			var modify = new ome.interaction.Modify({
				features: select.getFeatures()
			});
			app.viewport.addInteraction(modify);
		},
		activateDraw : function(flag, remove) {
			var setActiveOrNot = false;
			if (typeof(flag) == 'boolean') setActiveOrNot = flag;
			var delInter = remove || false;
			
			app.viewport.getInteractions().forEach(
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
		},
		resetDrawMode : function() {
			app.activateDraw(false, true);
			
			app.viewport.getInteractions().forEach(
				function(item) {
					if (item instanceof ol.interaction.Draw || 
							item instanceof ol.interaction.Modify || 
							item instanceof ol.interaction.Select || 
							item instanceof ol.interaction.Translate ||
							item instanceof ol.interaction.DragBox)
						app.viewport.removeInteraction(item);
				}
			);
		},
		resetPlaneTimeChannelControls : function() {
			var dim = ['z', 't', 'c'];
			for (d in dim) {
				var id = 'ome_' + dim[d] + '_index';
				var idEl = goog.dom.getElement(id);
				if (idEl == null)
					continue;
				goog.events.removeAll(idEl);
				if (dim[d] == 'c') {
					goog.dom.removeChildren(idEl);
				} else {
					idEl.max = 0;
					idEl.value = 0;
				}
				goog.style.setStyle(idEl, "display", "none");
			}
		},
		initPlaneTimeChannelControls : function(dims, selDs) {
			if (typeof(dims) != 'object' || typeof(dims.length) != 'number')
				return;
			if (dims.length == 0)
				return;
			
			for (d in dims) {
				if (typeof(dims[d].count) != 'number' || dims[d].count <= 1)
					continue;
				var id = 'ome_' + dims[d].name + '_index';
				var idEl = goog.dom.getElement(id);
				var dimCount = dims[d].count;

				if (dims[d].name == 'c') {
					var count=1;
					goog.dom.append(
						idEl, 
						goog.dom.createDom('OPTION', 
							{'value' : "0", 'selected' : 'selected'},
							"default"));

					for (i in selDs.channelLabels) {
						goog.dom.append(
								idEl, 
								goog.dom.createDom('OPTION', 
									{'value' : count, 'selected' : ''},
									selDs.channelLabels[i]));
						count++;
					}
					idEl.value =0;
				} else {
					idEl.max = --dimCount;
					idEl.value = Math.ceil(--dimCount/2);
				}
				goog.style.setStyle(idEl, "display", "block");
			
				(function(_id) {
					goog.events.listen(idEl, goog.events.EventType.CHANGE,
						function(event) {
							var source = app.viewport.getLayers().item(0).get("source");
							var _idEl = goog.dom.getElement(_id);
							if (_id == 'ome_z_index')
								source.setPlane(parseInt(_idEl.value));
							else if (_id == 'ome_t_index')
								source.setTime(parseInt(_idEl.value));
							else if  (_id == 'ome_c_index')
								source.setChannel(parseInt(_idEl.value));
							source.forceRender();
					})
				})(id);
			}
		},
		updateThumbnail : function(event) {
			var selected = goog.dom.getElement('ome_images').value;
			goog.dom.getElement('ome_thumbnail').src = "thumbnail/" + selected;
		},
		prepareResolutionsArray : function(givenRes) {
			// prepare resolutions for "single" images vs tiled/pyramids
			if (givenRes == null)
				return app.defaultResolutions;
	
			var defResLen = app.defaultResolutions.length;
	
			if (givenRes.length >= defResLen)
				return givenRes;
			
			var oneToOneIndex = 0;
			for (i in  givenRes)
				if (givenRes[i] == 1.0) {
					oneToOneIndex = i;
					break;
				}
			if (oneToOneIndex >= defResLen-1)
				return givenRes;
			
			var defResOneToOne = 0;
			for (i in  app.defaultResolutions)
				if (app.defaultResolutions[i] == 1.0) {
					defResOneToOne = i;
					break;
				}
			
			var newRes = [];
			// we fill up to achieve a decent number of zooms
			var fillUpTo = oneToOneIndex;
			if (oneToOneIndex < defResOneToOne) {
				fillUpTo = defResOneToOne - oneToOneIndex;
				for (var i=0;i<fillUpTo;i++)
					newRes.push(givenRes[0] * (1+((fillUpTo-i) * 0.25)));
				for (var i=0;i<oneToOneIndex;i++) {
					fillUpTo++;
					newRes.push(givenRes[i]);
				}
			} else 
				for (var i=0;i<fillUpTo;i++)
					newRes.push(givenRes[i]);
			
			// fill rest
			for (var i=fillUpTo;i<defResLen;i++)
				newRes.push(1 - ((i-fillUpTo)*0.25));
			
			return newRes;
		},
		workWithImage : function(event) {
			var selected = goog.dom.getElement("ome_images").value;
			
			if (typeof(app.images[selected]) == 'undefined' || app.images[selected] == null)
				alert('dataset' + selected + 'not found')
			
			var selDs = app.images[selected];
						
			// this is the open layers initialization/update section
			var zoom = selDs.zoomLevelScaling ? selDs.zoomLevelScaling.length : -1;
				
			var width = selDs.sizeX;
			var height = selDs.sizeY;
			var planes = selDs.sizeZ;
			var times = selDs.sizeT;
			var channels = selDs.sizeC;
			
			// slider intialization?
			app.resetPlaneTimeChannelControls();
			var dims = [
			     { name: "z", count: planes },
			     { name: "t", count: times },
			     { name: "c", count: channels },
			];
			app.initPlaneTimeChannelControls(dims, selDs);

			var imgCenter = [width / 2, -height / 2];

			var proj = new ol.proj.Projection({
				code: 'OMERO',
				units: 'pixels',
				extent: [0, 0, width, height]
			});

			var source = new ome.source.Omero({
				url: 'image',
				image: selDs.id,
				sizeX: width,
				sizeY: height,
				plane: planes > 1 ? parseInt(goog.dom.getElement('ome_z_index').value) : 0,
				time: times > 1 ? parseInt(goog.dom.getElement('ome_t_index').value) : 0,
				channel: channels > 1 ? parseInt(goog.dom.getElement('ome_c_index').value) : 0,
				resolutions: zoom > 1 ? selDs.zoomLevelScaling : [1]
			});
			
			var opt = {
					projection: proj,
					center: imgCenter,
					extent: [0, -height, width, 0],
					resolutions : app.prepareResolutionsArray(selDs.zoomLevelScaling),
					resolution : zoom > 1 ? selDs.zoomLevelScaling[0] : 1
			};

			var view = new ol.View(opt);
						
			var defaultControls = {
				zoom : true,
				rotate: true,
				attributrion: false
			};
			var addControls = [
			    new ol.control.CustomOverviewMap(),
			    new ome.control.Draw(),
				new ol.control.FullScreen(),
				new ome.canvas.Interaction()];
				//new ol.control.ScaleLine()];
			
			var defaultInteractions = {
				altShiftDragRotate : false,
				doubleClickZoom : false,
				dragPan : true,
				pinchRotate : false,
				pinchZoom : false,
				keyboard : false,
				mouseWheelZoom : true,
				shiftDragZoom : false
			};
					
			if (app.viewport == null) { 
				app.viewport = new ol.Map({
					logo: false,
					controls: ol.control.defaults(defaultControls).extend(addControls),
					interactions: ol.interaction.defaults(defaultInteractions),
					layers: [new ol.layer.Tile({source: source, preload: Infinity})],
				    target: 'ome_viewport',
				    view: view
				});
			} else {
				app.resetDrawMode();
				app.viewport.getLayers().clear();
				app.viewport.getOverlays().clear();
				app.viewport.addLayer(new ol.layer.Tile({source: source, preload: Infinity}));
				app.viewport.setView(view);
			}
			app.viewport.addInteraction(new ol.interaction.DragRotate({condition: ol.events.condition.shiftKeyOnly}));

			// add custom canvas layer
			app.viewport.addLayer(
				new ol.layer.Image({
					source: new ome.source.OmeroCanvas({
						map: app.viewport
				})
			}));

			// add custom svg layer as overlay
			var imageExtent = app.viewport.getView().getProjection().getExtent();
			var res = app.viewport.getView().getResolution();
			var svgDims = [imageExtent[2] / res, imageExtent[3] / res];
			var svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svgOverlay.setAttribute('width',  svgDims[0]);
			svgOverlay.setAttribute('height',  svgDims[1]);
			//svgOverlay.setAttribute('style', 'pointer-events: none;');
			svgOverlay.setAttribute('class', 'ol-unselectable');
			svgOverlay.setAttribute('viewBox', "0 0 " + imageExtent[2] + " " + imageExtent[3]);
			
			  var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			  el.setAttribute('cx', imageExtent[2] / 2);
			  el.setAttribute('cy', imageExtent[3] / 2);
			  el.setAttribute('r', imageExtent[2] / 4);
			  el.setAttribute('fill', '#223FA3');
			  el.setAttribute('fill-opacity', "0.4");
			  el.setAttribute('stroke-width', '1px');
			  el.setAttribute('stroke', 'black');
			  svgOverlay.appendChild(el)
			  
			var svgOl = new ol.Overlay({
				position: [0,0],
				element: svgOverlay,
				stopEvent: false});
			
			app.viewport.addOverlay(svgOl);
			
			var changeListener = function(evt) {
				var newRes = evt.target.getResolution();
				if (newRes != evt.oldValue) {
					var imageExtent = app.viewport.getView().getProjection().getExtent();
					var viewDims = [imageExtent[2] / newRes, imageExtent[3] / newRes];
					svgOverlay.setAttribute('width', viewDims[0]);
					svgOverlay.setAttribute('height',viewDims[1]);
				}
				
			}
			goog.events.listen(
				svgOl.getMap().getView(), "change:resolution",
				changeListener, false, svgOl);
			
			app.initModifyMode();
			
			
			// if roi count > 0 send off request for image
			if (selDs.roiCount > 0) {
				app.images[selDs.id].rois = null;
				app.dealWithRois(selDs.id);
			}
		},
		dealWithRois : function(id) {
			var params = {
				url: 'rois/' + id,
				success: function(data) {
					if (typeof(data) != 'object' || typeof(data.length) == 'undefined')
						console.error("roi request gave no array back");

					app.updateFeatures(id, data);
				}
			};
			app.sendRequest(params);	
		},
		updateFeatures(id, data) {
			var source = 
				app.viewport.getLayers().item(
					app.viewport.getLayers().getLength()-1).getSource();

			source.clear();
			app.images[id].rois = data;
			var count = 0;
			for (i in data) {
				if (typeof(data[i]) != 'object' || typeof(data[i].shapes) != 'object') continue;
				data[i].modified = false; // this is just a tmp way, checksum comparison at update would be stable
				for (s in data[i].shapes) {
					if (typeof(data[i].shapes[s].type) != 'string')
						continue;
					data[i].shapes[s].modified = false
					var feat = app.roiRenderHandler[data[i].shapes[s].type];
					if (typeof(feat) != 'function')
						continue;
					var actFeat = feat(data[i].shapes[s]);
					actFeat.setId('' + id + ':' + data[i].id + ":" + data[i].shapes[s].id);
					
					if (actFeat.getStyle()) {
					// we immediately override the given style with a function so that text is scaled 
						(function(style) {
							actFeat.setStyle(function(resolution) {
								var textStyle = style.getText();
								if (textStyle) {
									var newScale = 1/resolution;
									textStyle.setScale(newScale);
								}
								return style;
							});
						})(actFeat.getStyle());
					}					
					source.addFeature(actFeat);
				}
				count++;
			}
			app.images[id].roiCount = count;
			source.changed();
		},
		findFeatureInImageData : function(combined_id) {
			if (typeof(combined_id) != 'string')
				return null;
			
			var tok = combined_id.split(':');
			if (typeof(tok) != 'object' || typeof(tok.length) != 'number' || tok.length != 3)
				return null;
			
			if (app && typeof(app.images[tok[0]]) == 'object' && typeof(app.images[tok[0]].rois) == 'object') {
				var imgRois = app.images[tok[0]].rois;
				for (roi in imgRois) {
					try {
						var t1 = parseInt(tok[1]);
					} catch(ignored) {
						continue;
					}
					var r = imgRois[roi];
					if (typeof(r.id) != 'number' || r.id != t1 || typeof(r.shapes) == 'undefined')
						continue;
					for (shap in r.shapes) {
						try {
							var t2 = parseInt(tok[2]);
						} catch(ignored) {
							continue;
						}
						var s = r.shapes[shap];
						if (typeof(s.id) != 'number' || s.id != t2)
							continue;
						r.img_id = tok[0];
						return r;
					}
				}
			}
			
			return null;
		}, addRoi : function(feature, imageId) {
			if (!(feature instanceof ol.Feature))
				return;
			var conFeat = app.convertFeature(feature);
			
			var csrftoken  = app.getCookie("csrftoken");
			var params = {
				url: 'addrois/' + imageId,
				method: 'POST', 
				content: JSON.stringify(conFeat),
				headers: {"X-CSRFToken" : csrftoken},
				success: function(data) {
					if (typeof(data) == 'Array' || typeof(data) == 'object') {
						if (data.error) {
							console.error(data.error);
							return;
						}
						app.updateFeatures(imageId, data);
						return;
					}
					var source = 
						app.viewport.getLayers().item(
							app.viewport.getLayers().getLength()-1).getSource();
					source.removeFeature(feature);
					source.changed();
					console.error("Failed to store feature");
				}
			};
			app.sendRequest(params);
		}, updateRoi : function(feature) {
			if (typeof(feature) != 'object')
				return;

			var hit = app.findFeatureInImageData(feature.getId());
			if (hit == null)
				return;
			var convFeat = app.convertFeature(feature);
			if (convFeat == null)
				return;
			
			var rois = app.images[hit.img_id].rois;
			for (r in rois)
				if (rois[r].id == hit.id) 
					rois[r] = convFeat;
			// TODO: implement
		}, convertFeature : function(feature) {
			if (!(feature instanceof ol.Feature))
				return null;
			// for proof of concept, we do just the rectangle...
			var coords = feature.getGeometry().getCoordinates()[0];
			var x1 = Math.round(coords[0][0]);
			var y1 = Math.round(-coords[0][1]);
			var x2 = Math.round(coords[2][0]);
			var y2 = Math.round(-coords[2][1]);
			if (x1 > x2) {
				var tmp = x2;
				x2 = x1;
				x1 = tmp;
			}
			if (y1 > y2) {
				var tmp = y2;
				y2 = y1;
				y1 = tmp;
			}
			
			var fill = feature.getStyle().getFill();
			var fillColor = app.convertRgbaStringToHexRgbString(fill.getColor());
			var fillColorAsInt = app.convertHexRgbStringToInteger(fillColor);
			var stroke = feature.getStyle().getStroke();
			var strokeColor = app.convertRgbaStringToHexRgbString(stroke.getColor());
			var strokeColorAsInt = app.convertHexRgbStringToInteger(strokeColor);
			
			var ret = {id: -1, shapes: [ {
				id: -1, theT: 0, theZ: 0, type: "Rectangle",
				x : x1, y: y1, width: x2-x1, height: y2-y1,
				fillAlpha: fillColor ? fillColor.alpha : 1.0,
				fillColor: fillColor ? fillColor.rgb : "#000000", 
				strokeAlpha: strokeColor ? strokeColor.alpha : 1.0,
				strokeColor: strokeColor ? strokeColor.rgb : "#000000", 
				strokeColorAsInt: strokeColorAsInt, fillColorAsInt: fillColorAsInt,
				strokeWidth: stroke.getWidth()
			} ]};
			
			return ret;
		},
		convertHexRgbStringToInteger : function(hexRgbAndAlpha) {
			var alpha = ("00" + parseInt(hexRgbAndAlpha.alpha * 255 + 0.5).toString(16)).substr(-2);
			var red = hexRgbAndAlpha.rgb.substring(1,3);
			var green = hexRgbAndAlpha.rgb.substring(3,5);
			var blue = hexRgbAndAlpha.rgb.substring(5,7);
			var ret = 0x00000000;
			ret |= parseInt("0x" + alpha + red + green + blue, 16);
			return ret;
		},
		roiRenderHandler : {
			"Ellipse" : function(shape) {
				var feat = new ol.Feature({geometry : 
					ome.source.OmeroCanvas.createEllipseGeometry(
						shape.cx, -shape.cy, shape.rx, shape.ry)});
				feat.setStyle(app.createFeatureStyle(shape));
				return feat;
			}, 
			"Rectangle" : function(shape) {
				var feat = new ol.Feature({geometry : 
					ome.source.OmeroCanvas.createRectangleGeometry(
						shape.x, shape.y, shape.width, shape.height)});
				feat.setStyle(app.createFeatureStyle(shape));
				return feat;
			}, "Label" : function(shape) {
				if (typeof(shape.fontSize) == 'string') {
					try {
						shape.fontSize = parseInt(shape.fontSize);
					} catch(overruled) {
						shape.fontSize = 20;
					} 
				}
				shape.height = shape.fontSize;
				shape.width = shape.textValue.length * parseInt(shape.height / 1.5); 
				var geom = new ol.geom.Circle([shape.x, -shape.y], 10);
				geom.isLabel = true;
				var feat = new ol.Feature({geometry : geom});
				feat.setStyle(app.createFeatureStyle(shape, geom.isLabel));
				return feat;
			}, "Polygon" : function(shape) {
				if (typeof(shape.points) != 'string' || shape.points.length == 0)
					return null;
				var c=0;
				var len=shape.points.length;
				var coords = [];
				var start = -1;
				while (len-c > 0) { // get rid of anything that is not M,L or z
					if (shape.points[c] == ' ')
						++c;
					var v = shape.points[c].toLowerCase();
					if (v == 'm' || v == 'l' || v == 'z') {
						if (start < 0) {
							if (v == 'z') {
								coords.push(coords[0]);
								break;
							}
							start = c+1;
							while (len-c > 0 && shape.points[++c] == ' ')
								start++;
						} else {
							try {
								var tok = shape.points.substring(start, c-1).split(" ");
								if (typeof(tok) != 'object' || tok.length != 2)
									return null;
								
								coords.push([parseInt(tok[0]), -parseInt(tok[1])]);
								start = -1;
								c--;
						 	} catch(err) {
						 		return null;
						 	}
						}
					}
					c++;
				}
				var feat = new ol.Feature({geometry : new ol.geom.Polygon([coords])});
				feat.setStyle(app.createFeatureStyle(shape));
				return feat;
			}
		}, createFeatureStyle : function(shape, isLabel) {
			if (typeof(shape) != 'object') return null;
			var forLabel = (typeof(isLabel) == 'boolean') ? isLabel : false;
			
			var stroke = {count : 0};
			var fill = {count : 0};
			
			if (shape.fillColor) {
				if (shape.fillAlpha)
					fill.color = app.convertHexRgbStringToRgbaString(shape.fillColor, shape.fillAlpha);
				else 
					fill.color = shape.fillColor;
				fill.count++;
			}
			if (shape.strokeColor) {
				if (shape.strokeAlpha)
					stroke.color = app.convertHexRgbStringToRgbaString(shape.strokeColor, shape.strokeAlpha);
				else
					stroke.color = shape.strokeColor;
				stroke.count++;
			}
			if (shape.strokeWidth) {
				stroke.width = shape.strokeWidth;
				stroke.count++;
			}
				
			strokeStyle = (stroke.count > 0) ? new ol.style.Stroke(stroke) : null;
			fillStyle = (fill.count > 0) ? new ol.style.Fill(fill) : null;
			
			var style = {};
			if (shape.textValue) {
				var text = {text : shape.textValue};
				var font = ""
				if (shape.fontStyle) font += (shape.fontStyle + " ");
				if (shape.fontSize) font += (shape.fontSize + "px ");	
				if (shape.fontFamily) font += shape.fontFamily;	
				text.font = font;
				if (fillStyle) text.fill = new ol.style.Fill(stroke);
				if (strokeStyle) text.stroke = strokeStyle
				if (forLabel) {
					text.textAlign = 'left';
					text.textBaseline = 'top';
				}
				style.text = new ol.style.Text(text);
			}
			
			if (strokeStyle) style.stroke = strokeStyle;
			if (fillStyle) style.fill = fillStyle;
			if (forLabel) {
				style.stroke = new ol.style.Stroke({color: "rgba(255,255,255,0)", width: 1});
				style.fill = new ol.style.Fill({color: "rgba(255,255,255,0)"});
			}
			
			return new ol.style.Style(style);
		}, convertHexRgbStringToRgbaString : function(hex_rgb, alpha) {
			if (typeof(hex_rgb) != 'string')
				return hex_rgb;
			if (typeof(alpha) != 'number') {
				try {
					alpha = parseFloat(alpha);
				} catch (goodbye) {
					return hex_rgb;
				}
			}
			
			var len = hex_rgb.length;
			if (len != 7)
				return hex_rgb;
			
			// chop off #
			hex_rgb = hex_rgb.substring(1);
			len--;
			
			ret = 'rgba(';
			var i=0;
			while ((len-i) > 0) {
				try {
					ret += (parseInt(hex_rgb.substring(i, i+2), 16) + ',');
					i += 2;
				} catch (ignored){
					return hex_rgb;
				}
			}
			return ret + alpha + ')';
		}, 
		convertRgbaStringToHexRgbString : function(rgba) {
			if (typeof(rgba) != 'string')
				return null;
			if (rgba.length == 0)
				return null;
			if (rgba[0] == '#' && rgba.length == 7)
				return {rgb: rgba, alpha: 1};
			try {
				var pureRgbaWithCommas = rgba.replace(/\(rgba|\(|rgba|rgb|\)/g, "");
				var tok = pureRgbaWithCommas.split(",");
				if (tok.length == 3 || tok.length == 4) {
					var ret = {rgb: "#" + 
						("00" + parseInt(tok[0]).toString(16)).substr(-2) +
						("00" + parseInt(tok[1]).toString(16)).substr(-2) +
						("00" + parseInt(tok[2]).toString(16)).substr(-2), alpha: 1.0};
					if (tok.length == 4) ret.alpha = parseFloat(tok[3]);
					return ret;
				}
			} catch (ignored) {} 
			return null;
		}
	}
}();
