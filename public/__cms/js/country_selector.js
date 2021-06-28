$('document').ready(function(){
	window._country_selector = new CountrySelector().Init();
});

function CountrySelector(){
	var self = this;
	this._country_code = C_US;

	this.Init = function(){
		$('#id_img_playlist_country').on('click', self.OnFlagClick);

		self.LoadCountryCode();
		return this;
	};

	this.LoadCountryCode = function(){
		var country_code = window.localStorage.getItem('COUNTRY_CODE_FOR_EDIT');
		self._country_code = country_code;
		if(self._country_code == null){
			self._country_code = C_US;
		}
		$('#id_img_playlist_country').attr("src",`/img/flags/${self._country_code}.png`);
	};

	this.OnFlagClick = function(){
		var h = '<div class="container">';
		h += '<div class="row">';

		for(var i=0 ; i<COUNTRY_CODE_LIST.length ; i++){
			var cc = COUNTRY_CODE_LIST[i];
			var cn = COUNTRY_NAME_LIST[cc];

			h += `
			<div class="col-3 pb-1">
				<img src='/img/flags/${cc}.png' style="width:50px">
			</div>
			<div class="col-8" style="cursor:pointer" onClick="window._country_selector.OnChooseCountry('${cc}')">
				${cn}
			</div>
			`;
		}
		h += '</div>';
		h += '</div>';
		
		$('#id_div_country_list').html(h);
	};

	this.OnChooseCountry = function(country_code){
		$('#modal_choose_country').modal('hide');
		window.localStorage.setItem('COUNTRY_CODE_FOR_EDIT', country_code);
		self.LoadCountryCode();
	};

	this.GetCountryCode = function(){
		return self._country_code;
	};
}