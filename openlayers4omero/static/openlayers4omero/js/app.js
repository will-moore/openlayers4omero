var app = function() {
	return {
		images : {},
		viewport : null,
		init : function() {
			app.registerListeners();
		},
		sendCleanRequest : function() {
			var params = {url: 'clean', data: 'json'};
			var success = function(data) {
				if (data && data.disconnected) {
					$('#ome_session_id').html("disconnected");
				}
			};
			var failure = function(error) {
				$('#ome_error_log').html(error);
			};
			app.sendRequest(params, success, failure);
		},
		sendRequest : function(params, success, failure) {
			if (params)
				$.ajax(params).success(
					function(data) {
						$('#ome_error_log').html("");
						success(data);
					}).error(failure);
		},
		connect : function() {
			var params = {url: 'connect', data: 'json'};
			var success = function(data) {
				if (data && data.sessionId) {
					$('#ome_session_id').html(data.sessionId);
					$('#ome_connect').val("Disconnect");
					app.fetchDatasets();
				} else if (data.error)
					$('#ome_error_log').html(data.error);
				else if (data)
					$('#ome_error_log').html(data);
				else
					$('#ome_error_log').html("error connecting");
			};
			var failure = function(error) {
				$('#ome_error_log').html(error);
			};
			app.sendRequest(params, success, failure);	
		},
		close : function() {
			app.sendCleanRequest();
			$('#ome_connect').val("Connect");
			app.clearImageList();
		},
		fetchDatasets : function() {
			var params = {url: 'datasets', data: 'json'};
			var success = function(data) {
				if (data && data.datasets && data.datasets.length == 0) {
					$('#ome_error_log').html("No datasets found");
				} else if (data && data.datasets)
					$('#ome_error_log').html("" + data.datasets.length + " datasets found" );
					app.populateImageList(data.datasets);
			};
			var failure = function(error) {
				$('#ome_error_log').html(error);
				app.clearImageList();
			};
			$('#ome_error_log').html('querying image list ...');
			app.sendRequest(params, success, failure);	
		},
		populateImageList : function(data) {
			if (typeof(data) == 'undefined' || data == null)
				return;
			
			var count = 0;
			var selected = 0;
			for (d in data)
				if (typeof(data[d]) == 'object' && typeof(data[d].images) == 'object' )
					for (i in data[d].images) {
						if (count == 0)
							selected = data[d].images[i].id;
						app.images[data[d].images[i].id] = data[d].images[i];
						app.images[data[d].images[i].id].rois = null;
						$('#ome_images').append('<option value="' + data[d].images[i].id +
								'" selected="">' + data[d].images[i].name + '</option>');
						count++;
					}
			$('#ome_images').attr("size", count);
			$('#ome_images').on("change", app.updateThumbnail);
			$('#ome_images').on("dblclick", app.workWithImage);
			$('#ome_images').val(selected).change();
			$('#ome_images').show();
			$('#ome_thumbnail').show();
		},
		clearImageList : function() {
			app.images = {};
			$('#ome_images').off();
			$('#ome_images').attr("size", 1);
			$('#ome_images option').each(function(index, option) {
			    $(option).remove();
			});
			$('#ome_thumbnail').attr("src", "");
			$('#ome_thumbnail').hide();
			$('#ome_images').hide();
			if (app.viewport != null) {
				app.resetPlaneTimeChannelControls();
				app.resetDrawMode();
				app.viewport.getLayers().clear();
				app.viewport = null;
				$('#ome_viewport').html("");
			}
		},
		initDrawMode : function() {
			app.viewport.addLayer(new ol.layer.Vector({
				source : new ol.source.Vector({}),
				style: new ol.style.Style({
					fill: new ol.style.Fill({
						color: 'rgba(255, 255, 255, 0.2)'
					}),
					stroke: new ol.style.Stroke({
						color: '#ffcc33',
						width: 2
					})
				})}));

			var select = new ol.interaction.Select();
			var selFeats = select.getFeatures();
			selFeats.on('add', function(event) {
				var feature = event.element;
				feature.on('change', function(ev) {
					app.updateRoi(ev.target);
				});
			});
			app.viewport.addInteraction(select);
			
			var translate = new ol.interaction.Translate({
				features: select.getFeatures()
			});
			app.viewport.addInteraction(translate);
			
			var modify = new ol.interaction.Modify({
				features: select.getFeatures()
			});
			app.viewport.addInteraction(modify);

			var draw = new ol.interaction.Draw({
				source: app.viewport.getLayers().item(
						app.viewport.getLayers().getLength()-1).getSource(),
				type: 'Circle',
				geometryFunction: ol.interaction.Draw.createRegularPolygon(4, Math.PI / 4)
			});
			draw.on(ol.interaction.DrawEventType.DRAWEND, function(event) {
				event.feature.setStyle(
					app.viewport.getLayers().item(app.viewport.getLayers().getLength()-1).getStyle());
				app.addRoi(event.feature,
					app.viewport.getLayers().item(0).getSource().getImageId());
			});
			app.viewport.addInteraction(draw);
			app.activateDraw(false);
			
			$('#draw_or_view').val("view");
			$('#draw_or_view').show();
			$('#draw_or_view').on("change", 
				function(event) {
					if ($('#draw_or_view').val() == 'draw') app.activateDraw(true);
					else app.activateDraw(false);
				}
			);
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
					} else if (item instanceof ol.interaction.Translate ||
							item instanceof ol.interaction.Modify)  {
						if (setActiveOrNot) item.setActive(false); // drawing and modifying mutually exclusive
						else item.setActive(true);
					}
				}
			);
		},
		resetDrawMode : function() {
			$('#draw_or_view').val("view");
			$('#draw_or_view').off(); 
			$('#draw_or_view').hide();
			app.activateDraw(false, true);
			
			app.viewport.getInteractions().forEach(
				function(item) {
					if (item instanceof ol.interaction.Draw || 
							item instanceof ol.interaction.Modify || 
							item instanceof ol.interaction.Select || 
							item instanceof ol.interaction.Translate)
						app.viewport.removeInteraction(item);
				}
			);
		},
		resetPlaneTimeChannelControls : function() {
			var dim = ['z', 't', 'c'];
			for (d in dim) {
				var id = '#ome_' + dim[d] + '_index';
				if ($(id) == null || $(id).length == 0)
					continue;
				$(id).off();
				if (dim[d] == 'c') {
					$(id + ' option').each(function(index, option) {
					    $(option).remove();
					});
				} else {
					$(id).attr("max", 0);
					$(id).val(0);
				}
				$(id).hide();
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
				var id = '#ome_' + dims[d].name + '_index';
				var dimCount = dims[d].count;

				if (dims[d].name == 'c') {
					var count=1;
					$(id).append('<option value="0" selected="selected">default</option>');
					for (i in selDs.channelLabels) {
						$(id).append('<option value="' + count +
								'" selected="">' + selDs.channelLabels[i] + '</option>');
						count++;
					}
					$(id).val(0);
				} else {
					$(id).attr("max",--dimCount);
					$(id).val(Math.ceil(--dimCount/2));
				}
				$(id).show();
			
				(function(_id) {
					$(_id).on('change', function(event) {
						var source = app.viewport.getLayers().item(0).get("source");
						if (_id == '#ome_z_index')
							source.setPlane(parseInt($(_id).val()));
						else if (_id == '#ome_t_index')
							source.setTime(parseInt($(_id).val()));
						else if  (_id == '#ome_c_index')
							source.setChannel(parseInt($(_id).val()));
						source.setTileLoadFunction(source.getTileLoadFunction());
					})
				})(id);
			}
		},
		updateThumbnail : function(event) {
			var selected = $("#ome_images option:selected").val();
			$('#ome_thumbnail').attr("src", "thumbnail/" + selected)
		},
		workWithImage : function(event) {
			var selected = $("#ome_images option:selected").val();
			
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

			var source = new ol.source.Omero({
				url: 'image',
				image: selDs.id,
				sizeX: width,
				sizeY: height,
				plane: planes > 1 ? parseInt($('#ome_z_index').val()) : 0,
				time: times > 1 ? parseInt($('#ome_t_index').val()) : 0,
				channel: channels > 1 ? parseInt($('#ome_c_index').val()) : 0,
				crossOrigin: 'anonymous',
				resolutions: zoom > 1 ? selDs.zoomLevelScaling : [1]
			});
			
			var opt = {
					projection: proj,
					center: imgCenter,
					extent: [0, -height, width, 0],
					resolution:  zoom > 1 ? source.getResolutions()[0] : 1,
					//zoom: zoom > 1 ? 0 : 1,
					minZoom: 0,
					maxZoom: zoom > 1 ? (zoom * 3)-1 : 5
			};
			var view = new ol.View(opt);
						
			var rotate = new ol.interaction.DragRotateAndZoom();
			
			if (app.viewport == null) { 
				app.viewport = new ol.Map({
					logo: false,
					controls: ol.control.defaults().extend([new ol.control.OverviewMap()]),
					interactions: ol.interaction.defaults().extend([rotate]),
					layers: [new ol.layer.Tile({source: source, preload: Infinity})],
				    target: 'ome_viewport',
				    view: view
				});
			} else {
				app.resetDrawMode();
				app.viewport.getLayers().clear();
				app.viewport.addLayer(new ol.layer.Tile({source: source, preload: Infinity}));
				app.viewport.setView(view);
			}
			app.initDrawMode();
			
			// if roi count > 0 send off request for image
			if (selDs.roiCount > 0) {
				app.images[selDs.id].rois = null;
				app.dealWithRois(selDs.id);
			}
		},
		dealWithRois : function(id) {
			var params = {url: 'rois/' + id, data: 'json'};
			var success = function(data) {
				if (typeof(data) != 'object' || typeof(data.length) == 'undefined')
					$('#ome_error_log').html("roi request gave no array back");
				
				var source = 
					app.viewport.getLayers().item(
						app.viewport.getLayers().getLength()-1).getSource();

				app.images[id].rois = data;
				
				var features = []; 
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
						source.addFeature(actFeat);
					}
				}
				source.changed();
			};
			var failure = function(error) {
				$('#ome_error_log').html(error);
			};
			app.sendRequest(params, success, failure);	
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
			//TODO: post to server
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
			var stroke = feature.getStyle().getStroke();
			var strokeColor = app.convertRgbaStringToHexRgbString(stroke.getColor());
			
			var ret = {id: -1, shapes: [ {
				id: -1, theT: 0, theZ: 0, type: "Rectangle",
				x : x1, y: y2, width: x2-x1, height: y2-y1,
				fillAlpha: fillColor ? fillColor.alpha : 1.0,
				fillColor: fillColor ? fillColor.rgb : "#000000", 
				strokeAlpha: strokeColor ? strokeColor.alpha : 1.0,
				strokeColor: strokeColor ? strokeColor.rgb : "#000000", 
				strokeWidth: stroke.getWidth()
			} ]};
			
			return ret;
		},
		registerListeners : function() {
			$('#ome_connect_form').submit(
				function(event) {
					event.preventDefault();
					if ($('#ome_connect').val() == 'Connect')
						app.connect();
					else if ($('#ome_connect').val() == 'Disconnect')
						app.close();
				});
			window.onbeforeunload = function() {
				app.close();
			};
		},
		roiRenderHandler : {
			"Rectangle" : function(shape) {
				var geometry =  
					new ol.geom.Polygon(
						[[[shape.x, -shape.y],
						 [shape.x+shape.width, -shape.y],
						 [shape.x+shape.width, -shape.y-shape.height],
						 [shape.x, -shape.y-shape.height],
						 [shape.x, -shape.y]
						]],ol.geom.GeometryLayout.XY);
				
				var feat = new ol.Feature({geometry : geometry});
				feat.setStyle(app.createFeatureStyle(shape));
				return feat;
			}, "Label" : function(shape) {
				var feat = new ol.Feature({geometry : new ol.geom.Circle([shape.x, -shape.y], 10)});
				feat.setStyle(app.createFeatureStyle(shape));
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
							if (v == 'z')
								break;
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
		}, createFeatureStyle : function(shape) {
			if (typeof(shape) != 'object') return null;
			
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
			if (shape.textValue)
				fill.color = stroke.color
				
			stroke = (stroke.count > 0) ? new ol.style.Stroke(stroke) : null;
			fill = (fill.count > 0) ? new ol.style.Fill(fill) : null;
			
			var style = {};
			if (shape.textValue) {
				var text = {text : shape.textValue};
				var font = ""
				if (shape.fontStyle) font += (shape.fontStyle + " ");
				if (shape.fontSize) font += (shape.fontSize + "px ");	
				if (shape.fontFamily) font += shape.fontFamily;	
				text.font = font;
				if (fill) text.fill = fill;
				if (stroke) text.stroke = stroke
				text.textBaseline = 'top';
				text.textAlign = 'left';
				style.text = new ol.style.Text(text);
			} else {
				if (stroke) style.stroke = stroke;
				if (fill) style.fill = fill;
			}
			
			return new ol.style.Style(style);
		}, convertHexRgbStringToRgbaString : function(hex_rgb, alpha) {
			if (typeof(hex_rgb) != 'string')
				return hex_rgb;
			if (typeof(alpha) != 'number')
				return hex_rgb;
			
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
			var pureRgbaWithCommas = rgba.replace(/\(rgba|\(|rgba|rgb|\)/g, "");
			var tok = pureRgbaWithCommas.split(",");
			if (tok.length == 3 || tok.length == 4) {
				var ret = {rgb: "#" + parseInt(tok[0]).toString(16) + parseInt(tok[1]).toString(16) + parseInt(tok[2]).toString(16), alpha: 1.0};
				if (tok.length == 4) ret.alpha = parseFloat(tok[3]);
				return ret;
			}
			return null;
		}
	}
}();
