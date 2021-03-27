$('document').ready(function(){
	new Control().Init();
});

function SelectMusic(id){
	window._cherry_player.SelectMusic(id);
}

function Control(){
	var self = this;
	this._music_list = [];

	this.Init = function(){
		self.GetMusicList();
		return self;
	};

	this.GetMusicList = function(){
		$.ajax({
			url: '/cherry_api/get_music_list',
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					// DisplayMusicList(res.music_list);
					self._music_list = res.music_list;
					window._cherry_player.LoadMusicList(self._music_list);
				}else{
					alert(res.err);
				}
			}
		});	
	};	
}