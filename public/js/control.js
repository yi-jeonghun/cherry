$('document').ready(function(){
	//FIXME 
	//모든 global들은 이곳에서 생성하도록 할 것.
	//관리도 편하고
	//한 눈에 들어오기도 하고 훨씬 좋을 것 같다.
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
		self.DISP_Top100List();
		self.DISP_UpdateLang();
		window._router.LoadInitRoute();
		return self;
	};

	this.InitComponentHandle = function(){
		$('#id_btn_menu_open').on('click', self.OpenMenu);
		$('#id_btn_close_menu').on('click', self.CloseMenu);
		$('#id_btn_flag').on('click', self.OnClickFlag);
	};

	this.ProcessCountryCode = function(){
		console.log('window._country_code ' + window._country_code);
		$('html').attr('lang', COUNTRY_LANG_LIST[window._country_code]);
		$('#id_btn_flag').attr('src', `/img/flags/${window._country_code}.png`);
	};

	//////////////////////////////////////////////////////////////////////////////////////////

	this.OnClick_Menu = function(type){
		switch(type){
			case 'like':
				window._router.Go(`/${window._country_code}/like.go`);
				break;
			case 'my_playlist':
				window._router.Go(`/${window._country_code}/my_playlist.go`);
				break
			case 'open_playlist':
				window._router.Go(`/${window._country_code}/open_playlist.go`);
				break;
			case 'search':
				window._router.Go(`/${window._country_code}/search.go`);
				break;
			case 'radio':
				window._router.Go(`/${window._country_code}/radio_list.go`);
				break;
			case 'era':
				window._router.Go(`/${window._country_code}/era.go`);
				break;
		}
		self.CloseMenu();
	}

	this.OnClickMenuTop100 = function(source){
		window._router.Go(`/${window._country_code}/top_rank.go?s=${source}`);
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

	///////////////////////////////////////////////////////////////////////

	this.DISP_Top100List = function(){
		var cc = window._country_code;
		var source_list = window._top_100_source.list[cc];
		
		var h = '';

		for(var s=0 ; s<source_list.length ; s++){
			var source = source_list[s].source;
			var source_name = source_list[s].name;
			var on_click = `window._main.OnClickMenuTop100('${source}')`;
			h += `
			<button onClick="${on_click}" type="button" class="btn btn-sm btn-light" style="width: 100%; text-align: left; margin-top:5px">
				Top 100 (${source_name})
			</button>
			`;
		}

		$('#id_div_index_menu_top_rank_list').html(h);
	};

	this.DISP_UpdateLang = function(){
		$('#id_label_menu_era').html(TR(L_CHART_BY_ERA));
		$('#id_label_menu_search').html(TR(L_SEARCH));
	};
}