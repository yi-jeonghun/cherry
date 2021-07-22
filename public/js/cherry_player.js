const SEQ_TYPE = {
	Sequence : 0,
	Shuffle : 1
};

const REPEAT_TYPE = {
	ALL : 0,
	ONE : 1,
	END : 2
};

function PlaylistStorage_Local(){
	this.GetPlaylist = function(){
		var music_list = [];
		var saved_play_list = window.localStorage.getItem('PLAY_LIST');
		if(saved_play_list === undefined || saved_play_list == 'undefined'){
			console.log('undefined ');
			saved_play_list = '';
		}
		if(saved_play_list == null || saved_play_list == ''){
			return music_list;
		}

		music_list = JSON.parse((saved_play_list));
		return music_list;
	};

	this.SavePlaylist = function(music_list){
		window.localStorage.setItem('PLAY_LIST', JSON.stringify(music_list));
	};
}

function PlaylistStorage_Memory(music_list){
	var self = this;
	this._music_list = music_list;

	this.GetPlaylist = function(){
		return self._music_list;
	};

	this.SavePlaylist = function(music_list){
		self._music_list = music_list;
	};
}

function CherryPlayer(){
	var self = this;
	this.__yt_player = null;
	this._music_list = [];
	this._cur_video_id = null;
	this._cur_music_uidx = -1;
	this._play_time_ms = 0;
	this._seq_type = SEQ_TYPE.Sequence;
	this._repeat_type = REPEAT_TYPE.ALL;
	this._b_play_list_show = false;
	this._b_lyrics_show = false;
	this._is_edit_mode = false;
	this._is_sort_mode = false;
	this._playlist_storage = null;
	this._cb_on_play_started = null;
	this._lyrics_list = [];//{music_uid:'',text:''}, ...
	this._sortable = null;

	this.Init = function(playlist_storage, cb_on_play_started){
		self._playlist_storage = playlist_storage;
		self._cb_on_play_started = cb_on_play_started;

		self.CreateYoutubePlayer();

		$('#id_player_music_list_div').hide();
		self.InitHandle();
		self.InitKeyHandle();
		self.ReloadPlayerIcons();
		return self;
	};

	this.CreateYoutubePlayer = function(){
		// console.log('CreateYoutubePlayer ');
		self.__yt_player = new YoutubePlayer().Init(
			self.OnYouTubeIframeAPIReady, self.OnPlayerReady, self.OnFlowEvent, self.OnPlayerStateChange
		);
	};

	this.InitHandle = function(){
		console.log('InitHandle ');
		$('#id_btn_play_pause').on('click', self.PlayPause);
		$('#id_btn_next').on('click', self.OnClickNext);
		$('#id_btn_seq_type').on('click', self.ToggleSeqType);
		$('#id_btn_repeat_type').on('click', self.ToggleRepeatType);
		$('#id_btn_playlist_show').on('click', self.PlayList_Show);
		$('#id_btn_playlist_hide').on('click', self.PlayList_Hide);
		$('#id_slider_volume').on('input', self.VolumeControl);
		$('#id_btn_volume').on('click', self.VolumeControl_Show);
		$('#id_btn_player_close_volume_control').on('click', self.VolumeControl_Hide);
		$('#id_btn_music_list_trash').on('click', self.OnTrashClick);
		$('#id_btn_playlist_edit_mode_toggle').on('click', self.ToggleEditMode);
		$('#id_btn_player_lyrics').on('click', self.Lyrics_Show);
		$('#id_btn_lyrics_hide').on('click', self.Lyrics_Hide);
		$('#id_btn_music_list_sort').on('click', self.OnClick_Sort);
	};

	//===========================================================================

	//youtube iframe api가 준비된 상태이므로 이 단계에서는 Load를 할 수 있음.
	this.OnYouTubeIframeAPIReady = function(){
		self.ReloadPlayList();
	};

	//Load가 된 상태이므로 play를 할 수 있음.
	this.OnPlayerReady = function(pb_rates, duration, volume){
		$('#id_slider_volume').val(volume);
		self.DisplayDuration(duration);
	};

	this.OnFlowEvent = function(play_time){
		var ms = parseInt(play_time * 1000);
		var progress_rate = (ms / self._play_time_ms) * 100;
		window.localStorage.setItem('PLAYER.LAST_PLAY_MS', ms);
		var timestamp = new Date().getTime();
		window.localStorage.setItem('PLAYER.LAST_PLAY_WALLTIME_MS', timestamp);
		window._slider_control.Update(progress_rate);
		self.UpdateDuration(ms);
	};

	this.OnPlayerStateChange = function(player_state, duration){
		switch(player_state){
			case YT.PlayerState.ENDED:
				self.Next();
				break;
			case YT.PlayerState.PLAYING:
				if(self._cb_on_play_started){
					self._cb_on_play_started();
				}
				self.DisplayDuration(duration);
				break;
			case YT.PlayerState.PAUSED:
				break;
			case YT.PlayerState.BUFFERING:
				break;
			case YT.PlayerState.CUED:
				break;
		}
		self.UpdatePlayPauseButton();
	};

	//===========================================================================

	//가사와 플레이리스트 화면은 상보 배타적.
	this.Lyrics_Show = function(){
		self._b_lyrics_show = true;
		$('#id_player_lyrics_div').show();
		$('#id_player_lyrics_div').css('z-index', 99);
		$('#id_player_music_list_div').css('z-index', 98);
		self.GetLyrics();
	};

	this.Lyrics_Hide = function(){
		self._b_lyrics_show = false;
		$('#id_player_lyrics_div').hide();
	};
	
	this.PlayList_Show = function(){
		self._b_play_list_show = true;
		$('#id_player_music_list_div').show();
		$('#id_player_music_list_div').css('z-index', 99);
		$('#id_player_lyrics_div').css('z-index', 98);
	};
	
	this.PlayList_Hide = function(){
		self._b_play_list_show = false;
		$('#id_player_music_list_div').hide();
	};
	
	//=============================================================================

	this.OnClick_Sort = function(){
		self._is_sort_mode = !self._is_sort_mode;
		self.DISP_MusicList();

		$('#id_btn_music_list_sort').removeClass('badge-danger');
		if(self._is_sort_mode){
			$('#id_btn_music_list_sort').addClass('badge-danger');
		}
	}

	//=============================================================================

	this.ToggleEditMode = function(){
		$('#id_btn_playlist_edit_mode_toggle').removeClass('badge-danger');
		if(self._is_edit_mode){
			for(var i=0 ; i<self._music_list.length ; i++){
				$('#id_btn_playlist_play_music-'+i).show();
				$('#id_btn_playlist_del_music-'+i).hide();
			}
			self._is_edit_mode = false;
		}else{
			for(var i=0 ; i<self._music_list.length ; i++){
				$('#id_btn_playlist_play_music-'+i).hide();
				$('#id_btn_playlist_del_music-'+i).show();
			}
			self._is_edit_mode = true;
		}

		if(self._is_edit_mode){
			$('#id_btn_playlist_edit_mode_toggle').addClass('badge-danger');
		}
	};

	this.OnTrashClick = function(){
		$('#id_model_confirm_content').html('Delete all?');
		$('#id_btn_model_confirm_ok').on('click', self.EmptyPlayList);
		$('#modal_confirm').modal('show');
	};

	this.EmptyPlayList = function(){
		$('#modal_confirm').modal('hide');
		self._music_list = [];
		self.SavePlayList();
		self.DISP_MusicList();
		self.__yt_player.ClearPlayer();
		self.DisplayTitleArtist(null);
	};

	this.UpdatePlayPauseButton = function(){
		if(self.__yt_player.IsPlaying()){
			$('#id_btn_play_pause').removeClass('fa-play');
			$('#id_btn_play_pause').removeClass('fa-pause');
			$('#id_btn_play_pause').addClass('fa-pause');
		}else{
			$('#id_btn_play_pause').removeClass('fa-play');
			$('#id_btn_play_pause').removeClass('fa-pause');
			$('#id_btn_play_pause').addClass('fa-play');
		}

		$('#id_btn_play_pause').removeClass("play_button");
		$('#id_btn_play_pause').removeClass("play_button_disabled");
		$('#id_btn_next').removeClass("play_button");
		$('#id_btn_next').removeClass("play_button_disabled");

		// console.log('UpdatePlayPauseButton ' );
		// console.log('self._music_list.length ' + self._music_list.length);
		if(self._music_list.length > 0 || self.__yt_player.IsPlaying()){
			$('#id_btn_play_pause').addClass("play_button");
			$('#id_btn_next').addClass("play_button");
		}else{
			$('#id_btn_play_pause').addClass("play_button_disabled");
			$('#id_btn_next').addClass("play_button_disabled");
		}
	};

	this.PlayPause = function(){
		console.log('PlayPause ' );
		// if(self._music_list.length == 0){
		// 	console.log('music list zeip ');
		// 	return;
		// }

		console.log('self.__yt_player.IsPlaying() ' + self.__yt_player.IsPlaying());

		if(self.__yt_player.IsPlaying()){
			self.__yt_player.Pause();
			window.localStorage.setItem('PLAY_LAST_STATE', '0');
		}else{
			self.__yt_player.Play();
			window.localStorage.setItem('PLAY_LAST_STATE', '1');
		}
	};

	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			switch(e.keyCode){
				case 32:
					// self.PlayPause();
				break;
			}
		});
	};

	this.VolumeControl_Show = function(){
		$('.player_volume_div').show();
	};

	this.VolumeControl_Hide = function(){
		$('.player_volume_div').hide();
	};	

	this.GoToArtist = function(artist_name, artist_uid){
		console.log('goto artist ');
		self.PlayList_Hide();
		window._router.Go(`/${window._country_code}/artist.go?aid=${artist_uid}`);
	};

	this.GoToMusic = function(music_uid, title, artist){
		self.Lyrics_Hide();
		self.PlayList_Hide();
		window._router.Go(`/${window._country_code}/music.go?mid=${music_uid}`);
	};

	this.TryMusic = function(music){
		console.log('music.video_id ' + music.video_id);
		self.__yt_player.LoadAndPlay(music.video_id);
		self.DisplayTitleArtist(music);
	};

	this.AddMusic = function(music){
		self._music_list.push(music);
		var last_idx = self._music_list.length-1;
		self.DISP_MusicList();
		self.SelectMusic(last_idx);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.LoadMusicList = function(music_list){
		self._music_list = music_list;
		console.log('LoadMusicList len ' + self._music_list.length);
		self.DISP_MusicList();
		self.SelectMusic(0);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.SavePlayList = function(){
		self._playlist_storage.SavePlaylist(self._music_list);
	};

	this.ReloadPlayList = function(){
		self._music_list = self._playlist_storage.GetPlaylist();
		if(self._music_list.length == 0){
			return;
		}
		self.DISP_MusicList();

		var select_music_uidx = 0;
		{
			var last_played_music_uid = window.localStorage.getItem('PLAYER.LAST_PLAYED_music_uid');
			// console.log('last_played_music_uid ' + last_played_music_uid);
			if(last_played_music_uid != null){
				for(var i=0 ; i<self._music_list.length ; i++){
					// console.log('i ' + i + ' == ' + self._music_list[i].music_uid);
					if(self._music_list[i].music_uid == last_played_music_uid){
						select_music_uidx = i;
						break;
					}
				}
			}
		}

		var auto_play_start = false;
		{
			var play_last_state = window.localStorage.getItem('PLAY_LAST_STATE');
	
			if(play_last_state == '1'){
				var last_play_walltime_ms = window.localStorage.getItem('PLAYER.LAST_PLAY_WALLTIME_MS');
				if(last_play_walltime_ms != null){
					var cur_timestamp = new Date().getTime();
	
					var diff = Math.abs(cur_timestamp - last_play_walltime_ms);
					if(diff < 10 * 1000){//10초 이내에 다시 로드된 경우에만 자동 재시작.
						auto_play_start = true;
					}
				}
			}	
		}

		if(auto_play_start){
			var last_play_ms = window.localStorage.getItem('PLAYER.LAST_PLAY_MS');
			if(last_play_ms == null){
				self.SelectMusic(select_music_uidx);
				self.__yt_player.LoadAndPlay(self._cur_video_id);
			}else{
				self.SelectMusic(select_music_uidx);
				self.__yt_player.LoadAndSeekPlay(self._cur_video_id, last_play_ms);
			}
		}else{
			self.SelectMusic(select_music_uidx, false);
			self.__yt_player.LoadButNotPlay(self._cur_video_id);
		}

		self.HighlightCurrentMusic();
		self.UpdatePlayPauseButton();
	};

	this.OnClickPlayBtn = function(idx){
		self.SelectMusic(idx);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
	};

	this.OnClickDelBtn = function(idx){
		self._music_list.splice(idx, 1);
		self.SavePlayList();
		self.DISP_MusicList();
	};

	this.HighlightCurrentMusic = function(){
		for(var i=0 ; i<self._music_list.length ; i++){
			$('#id_music_title_' + i).removeClass('playlist_music_highlight');	
		}

		// console.log('HighlightCurrentMusic ');
		// console.log('self._cur_music_uidx ' + self._cur_music_uidx);

		var id = '#id_music_title_' + self._cur_music_uidx;
		// console.log('id ' + id);
		$(id).addClass('playlist_music_highlight');
	};

	this.ReloadPlayerIcons = function(){
		var seq_type =  window.localStorage.getItem('PLAYER.SEQ_TYPE');
		if(seq_type == 'Shuffle'){
			self._seq_type = SEQ_TYPE.Shuffle;
		}else if(seq_type == 'Sequence'){
			self._seq_type = SEQ_TYPE.Sequence;
		}
		self.UpdateSeqTypeIcon();

		var repeat_type =  window.localStorage.getItem('PLAYER.REPEAT_TYPE');
		if(repeat_type == 'ONE'){
			self._repeat_type = REPEAT_TYPE.ONE;
		}else if(repeat_type == 'ALL'){
			self._repeat_type = REPEAT_TYPE.ALL;
		}
		self.UpdateRepeatTypeIcon();
	};

	this.ToggleSeqType = function(){
		if(self._seq_type == SEQ_TYPE.Sequence){
			self._seq_type = SEQ_TYPE.Shuffle;
			window.localStorage.setItem('PLAYER.SEQ_TYPE', 'Shuffle');
			UTIL_ShowCherryToast('Random Play');
		}else{
			self._seq_type = SEQ_TYPE.Sequence;
			window.localStorage.setItem('PLAYER.SEQ_TYPE', 'Sequence');
			UTIL_ShowCherryToast('Sequence Play');
		}
		self.UpdateSeqTypeIcon();
	};

	this.UpdateSeqTypeIcon = function(){
		$('#id_icon_seq_type').removeClass('fa-sort-numeric-down');
		$('#id_icon_seq_type').removeClass('fa-random');

		if(self._seq_type == SEQ_TYPE.Sequence){
			$('#id_icon_seq_type').addClass('fa-sort-numeric-down');
		}else{
			$('#id_icon_seq_type').addClass('fa-random');
		}
	};

	this.ToggleRepeatType = function(){
		if(self._repeat_type == REPEAT_TYPE.ALL){
			self._repeat_type = REPEAT_TYPE.ONE;
			window.localStorage.setItem('PLAYER.REPEAT_TYPE', 'ONE');
			UTIL_ShowCherryToast('Repeat Single');
		}else if(self._repeat_type == REPEAT_TYPE.ONE){
			self._repeat_type = REPEAT_TYPE.ALL;
			window.localStorage.setItem('PLAYER.REPEAT_TYPE', 'ALL');
			UTIL_ShowCherryToast('Repeat All');
		}
		self.UpdateRepeatTypeIcon();
	};

	this.UpdateRepeatTypeIcon = function(){
		$('#id_icon_repeat_type').removeClass('fa-reply-all');
		$('#id_icon_repeat_type').removeClass('fa-reply');

		if(self._repeat_type == REPEAT_TYPE.ALL){
			$('#id_icon_repeat_type').addClass('fa-reply-all');
		}else if(self._repeat_type == REPEAT_TYPE.ONE){
			$('#id_icon_repeat_type').addClass('fa-reply');
		}
	};

	this.Play = function(){
		self.__yt_player.Play();
	};

	this.Pause = function(){
		self.__yt_player.Pause();
	};

	this.SelectMusic = function(id){
		self._cur_music_uidx = id;
		self._cur_video_id = self._music_list[self._cur_music_uidx].video_id;
		var music_uid = self._music_list[self._cur_music_uidx].music_uid;
		window.localStorage.setItem('PLAYER.LAST_PLAYED_music_uid', music_uid);
		self.DisplayTitleArtist(self._music_list[self._cur_music_uidx]);
		self.HighlightCurrentMusic();
		if(self._b_lyrics_show){
			self.GetLyrics();
		}
	};

	this.OnClickArtist = function(event, artist, artist_uid){
		event.stopPropagation();
		self.Lyrics_Hide();
		self.PlayList_Hide();
		window._router.Go(`/${window._country_code}/artist.go?aid=${artist_uid}`);
	};

	this.OnClickTitle = function(event, music_uid, title, artist){
		event.stopPropagation();
		self.Lyrics_Hide();
		self.PlayList_Hide();
		self.GoToMusic(music_uid, title, artist);
	};

	this.GetRandomIndex = function(){
		var min = 0;
		var max = self._music_list.length - 1;
		return Math.floor(Math.random() * (max - min)) + min;	
	};

	this.OnClickNext = function(){
		if(self._music_list.length == 0){
			return;
		}
		self.__yt_player.Stop();

		if(self._seq_type == SEQ_TYPE.Shuffle){
			self.SelectMusic(self.GetRandomIndex());
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;
		}else if(self._seq_type == SEQ_TYPE.Sequence){
			//순차적으로 전체를 반복
			var next_music_uidx = self._cur_music_uidx + 1;
			if(self._music_list.length == next_music_uidx){
				next_music_uidx = 0;
			}
			self.SelectMusic(next_music_uidx);
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;		
		}
	};

	this.Next = function(){
		if(self._music_list.length == 0){
			return;
		}
		self.__yt_player.Stop();

		if(self._repeat_type == REPEAT_TYPE.ONE){
			//한 곡만 반복
			self.SelectMusic(self._cur_music_uidx);
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;
		}else if(self._repeat_type == REPEAT_TYPE.ALL){
			if(self._seq_type == SEQ_TYPE.Shuffle){
				self.SelectMusic(self.GetRandomIndex());
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;
			}else if(self._seq_type == SEQ_TYPE.Sequence){
				//순차적으로 전체를 반복
				var next_music_uidx = self._cur_music_uidx + 1;
				if(self._music_list.length == next_music_uidx){
					next_music_uidx = 0;
				}
				self.SelectMusic(next_music_uidx);
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;		
			}
		}else if(self._repeat_type == REPEAT_TYPE.END){
			if(self._seq_type == SEQ_TYPE.Shuffle){
				self.SelectMusic(self.GetRandomIndex());
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;
			}else if(self._seq_type == SEQ_TYPE.Sequence){
				//순차적으로 전체를 반복
				var next_music_uidx = self._cur_music_uidx + 1;
				if(self._music_list.length == next_music_uidx){
					return;
				}
				self.SelectMusic(next_music_uidx);
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;		
			}
		}
	};

	this.VolumeControl = function(){
		var volume = $('#id_slider_volume').val();
		// console.log('volume ' + volume);
		self.__yt_player.SetVolume(volume);
	};
	
	this.DisplayDuration = function(duration){
		self._play_time_ms = duration * 1000;
		var minutes = parseInt(duration / 60);
		var seconds = parseInt(duration % 60);

		if(minutes == NaN || seconds == NaN){
			return;
		}

		var htm = minutes + ':';		
		if(seconds < 10){
			htm += '0' + seconds;
		}else{
			htm += seconds;
		}
		$('#id_div_duration').html(htm);
	};

	this.UpdateDuration = function(ms){
		var remain_ms = parseInt((self._play_time_ms - ms) / 1000);
		var minutes = parseInt(remain_ms / 60);
		var seconds = parseInt(remain_ms % 60);

		if(minutes == NaN || seconds == NaN){
			return;
		}

		var htm = minutes + ':';		
		if(seconds < 10){
			htm += '0' + seconds;
		}else{
			htm += seconds;
		}
		$('#id_div_duration').html(htm);
	};

	this.SeekToPercent = function(percent){
		var seek_ms = self._play_time_ms/100 * percent;
		self.__yt_player.SeekAndPlay(seek_ms);
	};

	this.GetLyrics = function(){
		$('#id_div_lyrics').html('');
		$('#id_div_lyrics').scrollTop(0);
		var music_uid = self._music_list[self._cur_music_uidx].music_uid; 

		//기존에 가져온 게 있으면 
		for(var i=0 ; i<self._lyrics_list.length ; i++){
			if(self._lyrics_list[i].music_uid == music_uid){
				$('#id_div_lyrics').html(self._lyrics_list[i].text);
				return;
			}
		}

		var req = {
			music_uid: music_uid
		};
		POST('/cherry_api/get_lyrics', req, (res)=>{
			if(res.ok){
				var text = '';
				if(res.lyrics_info.registered){
					text = res.lyrics_info.text.replace(/\n/g, '<br>');
					self._lyrics_list.push({
						music_uid: music_uid,
						text: text
					});
				}
				$('#id_div_lyrics').html(text);
			}else{
				alert(res.err);
			}
		});
	};

	this.SeekToEnd = function(sec){
		var seek_ms = self._play_time_ms - (sec * 1000);
		self.__yt_player.SeekAndPlay(seek_ms);
	};

	this.LikeMusic = function(idx){
		var user_id = window._auth_control.GetUserID();
		if(user_id == null || user_id == ''){
			alert('Sign in required');
			return;
		}

		var m = self._music_list[idx];
		var is_like = m.is_like == 'Y' ? false : true;
		m.is_like = m.is_like == 'Y' ? 'N' : 'Y';
		CMN_LikeMusic(m.music_uid, is_like);
		self.SavePlayList();
	};

	//=============================================================================================

	this.DisplayTitleArtist = function(music){
		if(music == null){
			$('#id_label_title').html('');
			$('#id_label_artist').html('');	
			return;
		}
		//title, artist, artist_uid
		$('#id_label_title').html(`
		<span class="border-bottom pointer" onClick="window._cherry_player.OnClickTitle(event, '${music.music_uid}', '${music.title}', '${music.artist}')">${music.title}</span>
		`);

		var artist_list = [];
		{
			if(music.is_various == 'Y'){
				var member_list = JSON.parse(music.member_list_json);
				for(var j=0 ; j<member_list.length ; j++){
					var name = member_list[j].name;
					var artist_uid = member_list[j].artist_uid;
					artist_list.push({
						name: name,
						onclick: `window._cherry_player.OnClickArtist(event, '${name}', '${artist_uid}')`
					});
				}
			}else{
				artist_list.push({
					name: music.artist,
					onclick: `window._cherry_player.OnClickArtist(event, '${music.artist}', '${music.artist_uid}')`
				});
			}
		}
		if(music.is_various == 'Y'){

		}else{

		}

		var a_str = '';
		for(var k=0 ; k<artist_list.length ; k++){
			a_str += `
			<span style="cursor:pointer; border-bottom:1px solid #aaaaaa; " onClick="${artist_list[k].onclick}">${artist_list[k].name}</span>
			`;
		}

		$('#id_label_artist').html(a_str);
	};

	this.DISP_MusicList = function(){
		$('#id_div_cherry_player_music_list').empty();
		$('#id_div_cherry_player_music_list_sort').empty();
		var h = '';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i]; 
			var id_title = 'id_music_title_'+i;
			var num = (i*1) + 1;
			var artist_list = [];
			{
				if(m.is_various == 'Y'){
					var member_list = JSON.parse(m.member_list_json);
					for(var j=0 ; j<member_list.length ; j++){
						var name = member_list[j].name;
						var artist_uid = member_list[j].artist_uid;
						artist_list.push({
							name: name,
							onclick: `window._cherry_player.GoToArtist('${name}', '${artist_uid}')`
						});
					}
				}else{
					artist_list.push({
						name: m.artist,
						onclick: `window._cherry_player.GoToArtist('${m.artist}', '${m.artist_uid}')`
					});
				}
			}

			var onclick_play = `window._cherry_player.OnClickPlayBtn(${i})`;
			var onclick_del = `window._cherry_player.OnClickDelBtn(${i})`;
			var on_click_title = `window._cherry_player.GoToMusic('${m.music_uid}', '${m.title}', '${m.artist}')`
			var on_click_heart = `window._cherry_player.LikeMusic(${i})`;
			var id_heart_icon = `id_icon_music_heart-${m.music_uid}`;
			var like_color = '#bbbbbb';
			if(m.is_like == 'Y'){
				like_color = 'red';
			}

			var p_btn_disp = '';
			if(self._is_edit_mode){
				p_btn_disp = 'none';
			}
			var d_btn_disp = 'none';
			if(self._is_edit_mode){
				d_btn_disp = '';
			}

			var box_style = '';
			var sortable_class = '';
			if(self._is_sort_mode){
				box_style = '1px dashed green';
				sortable_class = 'list-group-item';
			}else{
				box_style = '1px solid #dddddd';
			}

			h += `
			<div class="${sortable_class}" style="padding:0px; margin:0px; border:1px" id="id_sort_idx-${i}">
				<div class="my-0 py-0" style="font-size:0.6em; width:50px; padding-left:5px">${num}</div>
				<div class=" d-flex" style="margin-bottom:2px; border:${box_style}" id="${id_title}">
					<div class="d-flex " style="width:calc( 100% - 75px);">
						<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/${m.video_id}/0.jpg">
						<div class="pl-1">
							<div class="text-dark">
								<span class="pointer border-bottom" onClick="${on_click_title}">${m.title}</span>
							</div>
							<div class="text-secondary" style="font-size:0.8em">
				`;

				for(var k=0 ; k<artist_list.length ; k++){
					h += `
								<span class="border-bottom" style="cursor:pointer; margin-right: 5px" onClick="${artist_list[k].onclick}">${artist_list[k].name}</span>
					`;
				}

			h += `
							</div>
						</div>
					</div>
					<div class="text-right d-flex " style="padding-top:5px;">
						<div>
							<span class="badge pointer" style="width:33px; height:33px; padding-top:10px;" onclick="${on_click_heart}">
								<i id="${id_heart_icon}" class="fas fa-heart" style="color: ${like_color}"></i>
							</span>
							<div class="text-center" style="font-size:0.5em"></div>
						</div>
						<div>
							<button type="button" class="btn btn-sm" onclick="${onclick_play}" id="id_btn_playlist_play_music-${i}" style="width:33px; height:33px; display:${p_btn_disp}">
								<i class="fas fa-play"></i>
							</button>
							<button type="button" class="btn btn-sm" onclick="${onclick_del}" id="id_btn_playlist_del_music-${i}" style="width:33px; height:33px; display:${d_btn_disp}">
								<i class="fas fa-trash-alt"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
			`;
		}

		if(self._is_sort_mode){
			$('#id_div_cherry_player_music_list_sort').html(h);

			self._sortable = Sortable.create(id_div_cherry_player_music_list_sort, {
				group: "sorting",
				sort: self._is_sort_mode,
				onUpdate: self.OnSortUpdated
			});	
		}else{
			$('#id_div_cherry_player_music_list').html(h);
		}
	};

	this.OnSortUpdated = function(evt){
		console.log('evt old ' + evt.oldIndex);
		console.log('evt new ' + evt.newIndex);

		self._music_list.splice(evt.newIndex, 0, self._music_list.splice(evt.oldIndex, 1)[0]);
		self.DISP_MusicList();
		self.SavePlayList();
	};
}