var app = function() {
	return {
		images : {},
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
			$('#ome_images').on("change", app.workWithImage);
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
		},
		workWithImage : function(event) {
			var selected = $("#ome_images option:selected").val();
			$('#ome_thumbnail').attr("src", "thumbnail/" + selected)
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
