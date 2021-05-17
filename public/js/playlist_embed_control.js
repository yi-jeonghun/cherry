function PlaylistEmbedControl(playlist_id){
	var self = this;
	this._playlist_id = playlist_id;
	this._playlist_info = null;
	this._music_list = null;

	this.Init = function(){
		console.log('self._playlist_id ' + self._playlist_id);
		self.GetPlaylist();
		return self;
	};

	/////////////////////////////////////////////////////////////

	this.OnPlayerReady = function(){
		$('#id_btn_play_pause').css('display', '');
	};

	/////////////////////////////////////////////////////////////

	this.GetPlaylist = function(){
		var req_data = {
			playlist_id: self._playlist_id
		};
		$.ajax({
			url: '/cherry_api/get_playlist_info',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._playlist_info = res.playlist_info;
					self._music_list = res.music_list;

					var playlist_storage = new PlaylistStorage_Memory(self._music_list);
					window._cherry_player = new CherryPlayer().Init(playlist_storage, self.OnPlayerReady);
				}
			}
		});	
	};

	/////////////////////////////////////////////////////////////

	this.DISP_PlaylistInfo = function(){

	};

	this.DISP_MusicList = function(){

	};
}