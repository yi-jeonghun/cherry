$('document').ready(function(){
	new Control().Init();
});

function SelectMusic(id){
	window._cherry_player.SelectMusic(id);
}

function ListenAll(country_code){
	switch(country_code){
		case 'GLO':
			window._top_rank_control_GLO.ListenAll();
			break;
		case 'USA':
			window._top_rank_control_USA.ListenAll();
			break;
		case 'GBR':
			window._top_rank_control_GBR.ListenAll();
			break;
		case 'KOR':
			window._top_rank_control_KOR.ListenAll();
			break;
	}
}

function ListenMusic(country_code, idx){
	var music = null;

	switch(country_code){
		case 'GLO':
			music = window._top_rank_control_GLO._music_list[idx];
			break;
		case 'USA':
			music = window._top_rank_control_USA._music_list[idx];
			break;

		case 'GBR':
			music = window._top_rank_control_GBR._music_list[idx];
			break;

		case 'KOR':
			music = window._top_rank_control_KOR._music_list[idx];
			break;
	}

	if(music != null){
		window._cherry_player.AddMusic(music);
	}
}

function Control(){
	var self = this;

	this.Init = function(){
		return self;
	};
}