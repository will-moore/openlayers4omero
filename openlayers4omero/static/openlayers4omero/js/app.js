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
			app.resetPlaneAndTimeSlider();
		},
		resetPlaneAndTimeSlider : function() {
			var dim = ['z', 't'];
			for (d in dim) {
				var id = '#ome_' + dim[d] + '_index';
				if ($(id) == null || $(id).length == 0)
					continue;
				$(id).off();
				$(id).attr("max", 0);
				$(id).val(0);
				$(id).hide();
			}
		},
		initPlaneAndTimeSlider : function(dims) {
			if (typeof(dims) != 'object' || typeof(dims.length) != 'number')
				return;
			if (dims.length == 0)
				return;
			
			for (d in dims) {
				if (typeof(dims[d].count) != 'number' || dims[d].count <= 1)
					continue;
				var id = '#ome_' + dims[d].name + '_index';
				var dimCount = dims[d].count;

				$(id).attr("max",--dimCount);
				$(id).val(Math.ceil(--dimCount/2));
				$(id).show();
			
				(function(_id) {
					$(_id).on('change', function(event) {
						var source = app.viewport.getLayers().item(0).get("source");
						if (_id == '#ome_z_index')
							source.setPlane(parseInt($(_id).val()));
						else
							source.setTime(parseInt($(_id).val()));
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
			
			// slider intialization?
			app.resetPlaneAndTimeSlider();
			var dims = [
			     { name: "z", count: planes },
			     { name: "t", count: times }
			];
			app.initPlaneAndTimeSlider(dims);

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
					maxZoom: zoom > 1 ? (zoom * 2)-1 : 5
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
		}
	}
}();
