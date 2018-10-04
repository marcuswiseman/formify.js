var formify = {};
formify.settings = {showLoader: false};
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

		formify.clear();

		if (formify.settings.showLoader) {
			var style = "position:fixed;right:20px;top:0;z-index:9999;padding:5px 10px;";
			style += "background-color:#eaa323;color:white;border-radius: 0px 0px 8px 8px";
			var loader = '<div class="js-formify-loader" style="' + style + '">';
			loader += 'Loading...</div>';
			$('body').append(loader);
		}

		var $this = $(this);
		$($this).find('input[type="submit"]').prop('disabled', 'disabled');
		$.ajax({
			method: $($this).attr('method'),
			url: "?action=" + $($this).data('action'),
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

	});
});
