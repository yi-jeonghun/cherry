function MusicControl(music_uid){
	var self = this;
	this._music_uid = music_uid;

	this.Init = function(){
		self.GetMusicInfo();
		return this;
	};

	//------------------------------------------------------------

	this.GetMusicInfo = function(){
		$.get(`/cherry_api/get_music_detail_info?mid=${self._music_uid}`, res=>{
			if(res.ok){
				console.log('res.info.title ' + res.info.title);
				$('#id_label_music_title').html(res.info.title);
				$('#id_label_music_artist').html(res.info.artist);
				console.log('res.info.video_id ' + res.info.video_id);

				$('#id_img_music').attr('src', `https://img.youtube.com/vi/${res.info.video_id}/0.jpg`);
				$('#id_div_music_lyrics').html(res.info.lyrics);
			}else{
				alert(res.err);
			}
		})
	};

	//------------------------------------------------------------
}