function PlaylistEmbedControl(playlist_uid){
	var self = this;
	this._playlist_uid = playlist_uid;
	this._playlist_info = null;
	this._music_list = null;

	this.Init = function(){
		console.log('self._playlist_uid ' + self._playlist_uid);
		self.GetPlaylist();
		return self;
	};

	/////////////////////////////////////////////////////////////

	this.OnPlayStarted = function(){
		$('#id_btn_play_pause').css('display', '');
	};

	/////////////////////////////////////////////////////////////

	this.GetPlaylist = function(){
		var req_data = {
			playlist_uid: self._playlist_uid
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
					self.DISP_PlaylistInfo();

					var playlist_storage = new PlaylistStorage_Memory(self._music_list);
					window._cherry_player = new CherryPlayer().Init(playlist_storage, self.OnPlayStarted);
				}
			}
		});	
	};

	/////////////////////////////////////////////////////////////

	this.DISP_PlaylistInfo = function(){
		$('#id_label_playlist_embed_title').html(self._playlist_info.title);
		$('#id_label_playlist_embed_comment').html(self._playlist_info.comment);
	};
}