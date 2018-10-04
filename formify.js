var formify = {};
formify.settings = {showLoader: true};
formify.loader = null;

/*
 * Reset timer and remove loader from screen.
 */
formify.clear = function () {
	clearTimeout(formify.loader);
	if ($('.js-formify-loader').length) {
		$('.js-formify-loader').remove();
	}
}
/*
 * Start timer. (Once loader is shown, after some time, remove it)
 */
formify.timeoutLoader = function (miliseconds = 2500) {
	formify.loader = setTimeout(function () {
		if ($('.js-formify-loader').length) {
			$('.js-formify-loader').remove();
		}
	}, miliseconds);
}

formify.getURLParameters = function (url) {
	var result = {};
	if (typeof(url) !== "undefined" && url != '') {
		var searchIndex = url.indexOf("?");
		if (searchIndex == -1) return result;
		var sPageURL = url.substring(searchIndex + 1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) {
			var sParameterName = sURLVariables[i].split('=');
			result[sParameterName[0]] = sParameterName[1];
		}
		return result;
	}
}

$(function () {

	/*
 	 * Bind two inputs of two forms (or more) together.
	 * Example:
	 *  - form1 has "<form data-action='form1'><input name='a'></form>"
	 *  - and form2 has "<form data-action='form2'><input name='b' data-bind='form1.a'></form>"
	 * When Input[name='a'] changes, it updates Input[name='b'] with the same value.
 	 */
	$('.formify input, .formify select, .formify textarea').change(function (e) {
		var $el = $(this);
		$('.formify').each(function (i, v) {
			if ($(v).attr('data-action')) {
				$(v).find('input, select, textarea').each(function (i, x) {
					if ($(x).attr('data-bind')) {
						var data = $(x).data('bind').split('.');
						if (data[0] == $($el).parents('form').data('action') && data[1] == $($el).attr('name')) {
							$(x).val($($el).val());
						}
					}
				});
			}
		});

	});

	/*
 	 * Handle submit event for forms classed with .formify and submit form data through ajax.
	 * Handle response and if callback is returned then attempt to call named function prefixed do_.
	 * TODO :- Test file uploading.
	 */
	$(document).on('submit', '.formify', function (e) {

		e.preventDefault();

		var $this = $(this);

		var method = typeof($($this).attr('method')) !== 'undefined' ? $($this).attr('method') : 'GET';
		var url = typeof($($this).attr('action')) !== 'undefined' ? $($this).attr('action') : '';
		var base_url = url.indexOf('?') != -1 ? url.split('?')[0] : url;
		if (url != '') {
			var url_params = formify.getURLParameters(url);
		}

		formify.clear();

		$($this).find('input[type="submit"]').prop('disabled', 'disabled');

		if (typeof(url_params) !== 'undefined') {
			url_params.action = $($this).data('action');
		} else {
			var url_params = {
				action: $($this).data('action')
			}
		}
		var ajax_url = base_url + '?' + $.param(url_params);

		var halt = true;
		if ($($this).data('confirm')) {
			halt = true;
			var r = confirm($($this).data('confirm'));
			if (r) {
				halt = false
			}
		} else {
			halt = false;
		}

		if (halt == false) {

			if (formify.settings.showLoader) {
				var style = "position:fixed;right:20px;top:0;z-index:9999;padding:5px 10px;";
				style += "background-color:#eaa323;color:white;border-radius: 0px 0px 8px 8px";
				var loader = '<div class="js-formify-loader" style="' + style + '">';
				loader += 'Loading...</div>';
				$('body').append(loader);
			}

			$.ajax({
				method: method,
				url: ajax_url,
				data: $($this).serialize(),
				dataType: 'json',
				processData: false,
				async: true,
				contentType: "multipart/form-data"
			})

			.done(function (data) {
				if (typeof(data.callback) !== "undefined") {
					if (typeof(window['do_' + data.callback]) === 'function') {
						window['do_' + data.callback](data.arguments);
					} else {
						console.log('Callback given but could not find client-side function to execute.');
					}
				} else {
					console.log('No callback specified: In ajax response, return json -> { callback:"functionname", arguments:[...], ... }');
				}
				if (formify.settings.showLoader) {
					$('.js-formify-loader').html('Success').css('background-color', '#3dba4c');
					formify.timeoutLoader();
				}
				$($this).find('input[type="submit"]').prop('disabled', '');
			})

			.fail(function (data) {
				if (formify.settings.showLoader) {
					$('.js-formify-loader').html('Error').css('background-color', '#ba3d3d');
					formify.timeoutLoader();
				}
				$($this).find('input[type="submit"]').prop('disabled', '');
			});
		} else {
			$($this).find('input[type="submit"]').prop('disabled', '');
		}

	});
});
