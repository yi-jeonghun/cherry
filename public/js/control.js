$('document').ready(function(){
	window._main = new Control().Init();
});

function SelectMusic(id){
	window._cherry_player.SelectMusic(id);
}

function Control(){
	var self = this;
	this._country_code = null;

	this.Init = function(){
		self.InitComponentHandle();

		{
			var country_code = self.GetCountryCodeFromLocalStorage();
			if(country_code == null || country_code == '' || country_code == undefined){
				country_code = self.DetectCountry();
				if(country_code == null){
					//국가 코드를 구하지 못하는 경우 기본으로 US를 지정함.
					country_code = COUNTRY_CODE.US;
				}
			}
			self._country_code = country_code;
			console.log('self._country_code ' + self._country_code);
			$('#id_btn_flag').attr('src', `/img/flags/${self._country_code}.png`);
		}
		return self;
	};

	this.GetCountryCodeFromLocalStorage = function(){
		return window.localStorage.getItem('COUNTRY_CODE');
	};

	this.DetectCountry = function(){
		var detected_country = null;
		var brouser_lang_code = window.navigator.userLanguage || window.navigator.language;
		var arr = brouser_lang_code.split('-');

		var language_code = null;
		var country_code = null;

		if(arr.language > 0){
			language_code = arr[0];
		}

		if(arr.language > 1){
			country_code = arr[1];
		}

		if(country_code != null){
			switch(country_code){
				case COUNTRY_CODE.US:
					detected_country = COUNTRY_CODE.US;
					break;
				case COUNTRY_CODE.GB:
					detected_country = COUNTRY_CODE.GB;
					break;
				case COUNTRY_CODE.KR:
					detected_country = COUNTRY_CODE.KR;
					break;
				case COUNTRY_CODE.DE:
					detected_country = COUNTRY_CODE.DE;
					break;	
				case COUNTRY_CODE.FR:
					detected_country = COUNTRY_CODE.FR;
					break;
				case COUNTRY_CODE.AU:
					detected_country = COUNTRY_CODE.AU;
					break;	
			}
		}

		//country_code는 없고 language_code만 있는 경우에는 
		if(country_code == null && language_code != null){
			switch(language_code){
				case 'en':
					detected_country = COUNTRY_CODE.US;
					break;
				case 'ko':
					detected_country = COUNTRY_CODE.KR;
					break;
				case 'de':
					detected_country = COUNTRY_CODE.DE;
					break;
				case 'fr':
					detected_country = COUNTRY_CODE.FR;
					break;
			}
		}

		return detected_country;
	};

	this.InitComponentHandle = function(){
		console.log('InitComponentHandle ' );
		$('#id_btn_menu_open').on('click', self.OpenMenu);
		$('#id_btn_close_menu').on('click', self.CloseMenu);
		$('#id_btn_flag').on('click', self.OnClickFlag);
	};

	this.OpenMenu = function(){
		$('#id_menu_div').show();
	};

	this.CloseMenu = function(){
		$('#id_menu_div').hide();
	};

	this.OnClickFlag = function(){
		var h = '<div class="container">';
		h += '<div class="row">';

		for(var i=0 ; i<COUNTRY_LIST.length ; i++){

			var cc = COUNTRY_LIST[i].country_code;
			var cn = COUNTRY_LIST[i].country_name;

			h += `
			<div class="col-3 pb-1">
				<img src='/img/flags/${cc}.png' style="width:50px">
			</div>
			<div class="col-8" style="cursor:pointer" onClick="window._main.ChooseCountry('${cc}')">
				${cn}
			</div>
			`;
		}
		h += '</div>';
		h += '</div>';
		

		$('#id_div_country_list').html(h);
	};

	this.ChooseCountry = function(country_code){
		$('#modal_choose_country').modal('hide');
		console.log('country_code ' + country_code);

		window.localStorage.setItem('COUNTRY_CODE', country_code);
		window.document.location.href = "/";
	};
}