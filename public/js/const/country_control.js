function CountryControl(){
	var self = this;

	this.LoadCountryCode = function(){
		var country_code = null;

		//주소에 country_code가 있으면 그게 최우선.
		var pathname = document.location.pathname;
		if(pathname != '/'){
			var tmp = pathname.substr(1,2);
			// console.log('tmp ' + tmp);
			if(self.IsSupportedCountryCode(tmp)){
				country_code = tmp;
			}
		}

		//주소에서도 없는 경우
		if(country_code == null){
			//로컬 스토리지에 저장되어 있으면 그걸 사용
			country_code = self.GetCountryCodeFromLocalStorage();
			if(country_code == null || country_code == '' || country_code == undefined){
				country_code = self.DetectCountry();
				if(country_code == null){
					//국가 코드를 구하지 못하는 경우 기본으로 US를 지정함.
					country_code = window._const.COUNTRY_CODE.US;
				}
			}	
		}

		window._country_code = country_code;
		console.log('window._country_code ' + window._country_code);
		window.localStorage.setItem('COUNTRY_CODE', country_code);
	};

	this.IsSupportedCountryCode = function(cc){
		for(var i=0 ; i<COUNTRY_CODE_LIST.length ; i++){
			if(cc == COUNTRY_CODE_LIST[i]){
				// console.log('supporting ' + cc);
				return true;
			}
		}
		console.log(cc + ' not supporting');
		return false;
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
				case window._const.COUNTRY_CODE.US:
					detected_country = window._const.COUNTRY_CODE.US;
					break;
				case window._const.COUNTRY_CODE.GB:
					detected_country = window._const.COUNTRY_CODE.GB;
					break;
				case window._const.COUNTRY_CODE.KR:
					detected_country = window._const.COUNTRY_CODE.KR;
					break;
				case window._const.COUNTRY_CODE.DE:
					detected_country = window._const.COUNTRY_CODE.DE;
					break;	
				case window._const.COUNTRY_CODE.FR:
					detected_country = window._const.COUNTRY_CODE.FR;
					break;
				case window._const.COUNTRY_CODE.AU:
					detected_country = window._const.COUNTRY_CODE.AU;
					break;	
			}
		}

		//country_code는 없고 language_code만 있는 경우에는 
		if(country_code == null && language_code != null){
			switch(language_code){
				case 'en':
					detected_country = window._const.COUNTRY_CODE.US;
					break;
				case 'ko':
					detected_country = window._const.COUNTRY_CODE.KR;
					break;
				case 'de':
					detected_country = window._const.COUNTRY_CODE.DE;
					break;
				case 'fr':
					detected_country = window._const.COUNTRY_CODE.FR;
					break;
			}
		}

		return detected_country;
	};
}