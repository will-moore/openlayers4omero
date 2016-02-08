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
				app.viewport.getLayers().clear();
				app.viewport = null;
				$('#ome_viewport').html("");
			}
			app.resetPlaneTimeChannelControls();
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
				url: 'image/' + selDs.id,
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
			
			if (app.viewport == null) 
				app.viewport = new ol.Map({
					logo: false,
					controls: ol.control.defaults().extend([
					      new ol.control.OverviewMap()
					]),
					interactions: ol.interaction.defaults().extend([
					     new ol.interaction.DragRotateAndZoom()
					]),
					layers: [new ol.layer.Tile({source: source, preload: Infinity})],
				    target: 'ome_viewport',
				    view: view
				});
			else {
				app.viewport.getLayers().clear();
				app.viewport.setView(view);
				app.viewport.addLayer(new ol.layer.Tile({source: source}));
			}
			
			// if roi count > 0 send off request for image
			if (selDs.roiCount > 0)
				app.dealWithRois(selDs.id);
		},
		dealWithRois : function(id) {
			var params = {url: 'rois/' + id, data: 'json'};
			var success = function(data) {
				if (typeof(data) != 'object' || typeof(data.length) == 'undefined')
					$('#ome_error_log').html("roi request gave no array back");
				
				var features = []; 
				for (i in data) {
					if (typeof(data[i]) != 'object' || typeof(data[i].shapes) != 'object') continue;
					for (s in data[i].shapes) {
						if (typeof(data[i].shapes[s].type) != 'string')
							continue;
						var feat = app.roiRenderHandler[data[i].shapes[s].type];
						if (typeof(feat) != 'function')
							continue;
						features.push(feat(data[i].shapes[s]));
					}
				}
				
				if (features.length > 0)
					app.viewport.addLayer(
						new ol.layer.Vector({
							source : new ol.source.Vector({features: features})}));
			};
			var failure = function(error) {
				$('#ome_error_log').html(error);
			};
			app.sendRequest(params, success, failure);	
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
						 [shape.x+shape.width, -shape.y+shape.height],
						 [shape.x, -shape.y+shape.height],
						 [shape.x, -shape.y]
						]],ol.geom.GeometryLayout.XY);
				
				var feat = new ol.Feature({geometry : geometry});
				feat.setStyle(app.createFeatureStyle(shape));
				return feat;
			}, "Label" : function(shape) {
				var feat = new ol.Feature({geometry : new ol.geom.Circle([shape.x, -shape.y], 10)});
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
		}
	}
}();
