var formify = {
	loader: null
};

formify.clear = function () {
	clearTimeout(formify.loader);
	if ($('.js-formify-loader').length) {
		$('.js-formify-loader').remove();
	}
}

formify.timeoutLoader = function (miliseconds = 2500) {
	formify.loader = setTimeout(function () {
		if ($('.js-formify-loader').length) {
			$('.js-formify-loader').remove();
		}
	}, miliseconds);
}

$(function () {

	$('input, select, textarea').change(function (e) {
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

	$(document).on('submit', '.formify', function (e) {

		e.preventDefault();


		formify.clear();

		var style = "position:fixed;right:20px;top:0;z-index:9999;padding:5px 10px;";
		style += "background-color:#eaa323;color:white;border-radius: 0px 0px 8px 8px";
		var loader = '<div class="js-formify-loader" style="' + style + '">';
		loader += 'Loading...</div>';
		$('body').append(loader);

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
			$('.js-formify-loader').html('Success').css('background-color', '#3dba4c');
			formify.timeoutLoader();
			$($this).find('input[type="submit"]').prop('disabled', '');
		})

		.fail(function (data) {
			$('.js-formify-loader').html('Error').css('background-color', '#ba3d3d');
			formify.timeoutLoader();
			$($this).find('input[type="submit"]').prop('disabled', '');
		});

	});
});
