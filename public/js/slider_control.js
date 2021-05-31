$('document').ready(function(){
	window._slider_control = new SliderControl().Init();
});

function SliderControl(){
	var self = this;
	this._slider_range = null;
	this._slider_filler = null;
	this._is_adjusting = false;

	this.Init = function(){
		self._slider_range = $('#id_slider_range');
		self._slider_filler = $('#id_slider_filler');
		console.log('slider init ' );
		self.InitHandle();
		return self;
	};

	this.InitHandle = function(){
		$('#id_slider_range').on('input', function(){
			self._is_adjusting = true;
		});

		$('#id_slider_range').on('change', function(){
			var percent = this.value/100;
			window._cherry_player.SeekToPercent(percent);
			self._is_adjusting = false;
		});	
	};

	this.Update = function(progress_rate){
		if(self._is_adjusting){
			return;
		}
		// console.log('progress ' + progress_rate);
		self._slider_range.val(progress_rate * 100);
		self._slider_filler.width(progress_rate + "%");
	};

}