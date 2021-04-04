$('document').ready(function(){
	new Control().Init();
});

function SelectMusic(id){
	window._cherry_player.SelectMusic(id);
}

function ListenMusic(collection_type, idx){
	var music = null;
	if(collection_type == COLLECTION_TYPE.KPOP){
		music = window._kpop_collection_control._music_list[idx];
	}else{
		music = window._billboard_collection_control._music_list[idx];
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