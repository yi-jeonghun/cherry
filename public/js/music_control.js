function MusicControl(music_uid){
	var self = this;
	this._music_uid = music_uid;
	this._is_like = false;
	this._music = null;

	this.Init = function(){
		self.GetMusicInfo();
		return this;
	};

	//------------------------------------------------------------

	this.GetMusicInfo = function(){
		$.get(`/cherry_api/get_music_detail_info?mid=${self._music_uid}`, res=>{
			if(res.ok){
				self._music = {
					music_uid: self._music_uid,
					title: res.info.title,
					artist: res.info.artist,
					artist_uid: res.info.artist_uid,
					is_various: res.info.is_various,
					video_id: res.info.video_id,
					member_list_json: res.info.member_list_json,
					is_like: res.info.is_like,
					has_lyrics: res.info.has_lyrics
				};

				window._router.UpdateMeta_Music(res.info.title, res.info.artist);

				$('#id_label_music_title').html(res.info.title);
				$('#id_label_music_artist').html(res.info.artist);
				self._is_like = res.info.is_like;
				if(self._is_like == 'Y'){
					$('#id_icon_music_heart-'+self._music_uid).css('color', 'red');
				}

				$('#id_img_music').attr('src', `https://img.youtube.com/vi/${res.info.video_id}/0.jpg`);
				$('#id_div_music_lyrics').html(res.info.lyrics.replace(/\n/g, '<br>'));
			}else{
				alert(res.err);
			}
		})
	};

	this.Like = function(){
		var user_id = window._auth_control.GetUserID();
		if(user_id == null || user_id == ''){
			alert('Sign in required');
			return;
		}

		var is_like = self._is_like == 'Y' ? false : true;
		self._is_like = self._is_like == 'Y' ? 'N' : 'Y';
		CMN_LikeMusic(self._music_uid, is_like);
	};

	this.ListenMusic = function(){
		window._cherry_player.AddMusic(self._music);
	};

	this.Correct = function(correction_type){
		var req = {
			music_uid: self._music_uid,
			correction_type: correction_type
		};
		POST('/cherry_api/correct_request_music', req, (res)=>{
			if(res.ok){
				UTIL_ShowCherryToast('Requested! Thanks a lot.');
			}else{
				alert(res.err);
			}
		});
	};

	//------------------------------------------------------------
}