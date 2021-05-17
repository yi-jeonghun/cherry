$('document').ready(function(){
	//FIXME 
	//모든 global들은 이곳에서 생성하도록 할 것.
	//관리도 편하고
	//한 눈에 들어오기도 하고 훨씬 좋을 것 같다.
	window._country_code = window._const.COUNTRY_CODE.US;
	window._router = new Router().Init();
	window._main = new Control().Init();
	var playlist_storage = new PlaylistStorage_Local();
	window._cherry_player = new CherryPlayer().Init(playlist_storage);
});

//FIXME 필요한 곳에서 직접 호출하도록 변경할 것.
function SelectMusic(id){
	window._cherry_player.SelectMusic(id);
}

function Control(){
	var self = this;

	this.Init = function(){
		self.InitComponentHandle();
		self.ProcessCountryCode();
		window._router.LoadInitRoute();
		return self;
	};

	this.ProcessCountryCode = function(){
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
		// console.log('window._country_code ' + window._country_code);
		window.localStorage.setItem('COUNTRY_CODE', country_code);
		$('html').attr('lang', COUNTRY_LANG_LIST[window._country_code]);
		$('#id_btn_flag').attr('src', `/img/flags/${window._country_code}.png`);
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

	this.InitComponentHandle = function(){
		// console.log('InitComponentHandle ' );
		$('#id_btn_menu_open').on('click', self.OpenMenu);
		$('#id_btn_close_menu').on('click', self.CloseMenu);
		$('#id_btn_flag').on('click', self.OnClickFlag);

		//MENU Buttons
		$('#id_btn_menu_top_100').on('click', self.OnClickMenuTop100);
		$('#id_btn_menu_my_playlist').on('click', self.OnClickMenuMyPlaylist);
		$('#id_btn_menu_open_playlist').on('click', self.OnClick_id_btn_menu_open_playlist);
		$('#id_btn_menu_search').on('click', self.OnClickMenuSearch);
		$('#id_btn_menu_like').on('click', self.OnClickMenuLike);
	};

	//////////////////////////////////////////////////////////////////////////////////////////

	this.OnClick_id_btn_menu_open_playlist = function(){
		window._router.Go(`/${window._country_code}/open_playlist.go`);
		self.CloseMenu();
	};

	this.OnClickMenuTop100 = function(){
		window._router.Go(`/${window._country_code}/top_rank.go`);
		self.CloseMenu();
	};

	this.OnClickMenuMyPlaylist = function(){
		window._router.Go(`/${window._country_code}/my_playlist.go`);
		self.CloseMenu();
	};

	this.OnClickMenuSearch = function(){
		window._router.Go(`/${window._country_code}/search.go`);
		self.CloseMenu();
	};

	this.OnClickMenuLike = function(){
		window._router.Go(`/${window._country_code}/like.go`);
		self.CloseMenu();
	};

	///////////////////////////////////////////////////////////////////////////////////////

	this.OpenMenu = function(){
		$('#id_menu_div').show();
	};

	this.CloseMenu = function(){
		$('#id_menu_div').hide();
	};

	this.OnClickFlag = function(){
		var h = '<div class="container">';
		h += '<div class="row">';

		for(var i=0 ; i<COUNTRY_CODE_LIST.length ; i++){
			var cc = COUNTRY_CODE_LIST[i];
			var cn = COUNTRY_NAME_LIST[cc];

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