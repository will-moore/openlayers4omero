var app = function() {
	return {
		init : function() {
			app.registerListeners();
		},
		sendCleanRequest : function() {
			var params = {url: 'clean', data: 'json'};
			var success = function(data) {
				if (data && data.disconnected) {
					$('#ome_session_id').html("");
					$('#ome_connect').val("Connect");
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
				} else if (data)
					$('#ome_error_log').html(data);
			};
			var failure = function(error) {
				$('#ome_error_log').html(error);
			};
			app.sendRequest(params, success, failure);	
		},
		close : function() {
			app.sendCleanRequest();
		},
		fetchDatasets : function() {
			var params = {url: 'datasets', data: 'json'};
			var success = function(data) {
				if (data && data.datasets && data.datasets.length == 0) {
					$('#ome_error_log').html("No datasets found");
				} else if (data && data.datasets)
					$('#ome_error_log').html("" + data.datasets.length + " datasets found" );
			};
			var failure = function(error) {
				$('#ome_error_log').html(error);
			};
			app.sendRequest(params, success, failure);	
		},
		registerListeners : function() {
			$('#ome_connect').on('click',
				function() {
					if (this.value == 'Connect')
						app.connect();
					else if (this.value == 'Disconnect')
						app.close();
				});
			window.onbeforeunload = function() {
				app.close();
			};
		}
	}
}();
