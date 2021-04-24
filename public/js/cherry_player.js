
const SEQ_TYPE = {
	Sequence : 0,
	Shuffle : 1
};

const REPEAT_TYPE = {
	ALL : 0,
	ONE : 1,
	END : 2
};

function CherryPlayer(){
	var self = this;
	this.__yt_player = null;
	this._music_list = [];
	this._cur_video_id = null;
	this._cur_music_idx = -1;
	this._play_time_ms = 0;
	this._seq_type = SEQ_TYPE.Sequence;
	this._repeat_type = REPEAT_TYPE.ALL;
	this._b_play_list_show = false;
	this._b_volume_show = false;
	this._id_slider_fill = null;

	this.Init = function(){
		self.CreateYoutubePlayer();

		$('#id_player_music_list_div').hide();
		self.InitHandle();
		self.InitKeyHandle();
		self._id_slider_fill = $('#id_slider_fill');
		self.ReloadPlayerIcons();
		return self;
	};

	this.CreateYoutubePlayer = function(){
		console.log('CreateYoutubePlayer ');
		self.__yt_player = new YoutubePlayer().Init(
			self.OnYouTubeIframeAPIReady, self.OnPlayerReady, self.OnFlowEvent, self.OnPlayerStateChange
		);
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
		self._id_slider_fill.width(progress_rate + "%");
	};

	this.OnPlayerStateChange = function(player_state, duration){
		switch(player_state){
			case YT.PlayerState.ENDED:
				self.Next();
				break;
			case YT.PlayerState.PLAYING:
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

	this.InitHandle = function(){
		$('#id_btn_play_pause').on('click', self.PlayPause);
		$('#id_btn_prev').on('click', self.OnClickNext);
		$('#id_btn_next').on('click', self.OnClickNext);
		$('#id_btn_seq_type').on('click', self.ToggleSeqType);
		$('#id_btn_repeat_type').on('click', self.ToggleRepeatType);
		$('#id_btn_playlist_show_hide').on('click', self.TogglePlayList);
		$('#id_btn_playlist_hide').on('click', self.TogglePlayList);
		$('#id_slider_volume').on('input', self.VolumeControl);
		$('#id_btn_volume').on('click', self.ToggleVolumeControl);
		$('#id_btn_music_list_trash').on('click', self.OnTrashClick);
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
		self.DisplayMusicList();
		self.__yt_player.ClearPlayer();
		self.DisplayTitleArtist('', '');
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

		$('#id_btn_prev').removeClass("play_button");
		$('#id_btn_prev').removeClass("play_button_disabled");
		$('#id_btn_play_pause').removeClass("play_button");
		$('#id_btn_play_pause').removeClass("play_button_disabled");
		$('#id_btn_next').removeClass("play_button");
		$('#id_btn_next').removeClass("play_button_disabled");

		console.log('UpdatePlayPauseButton ' );
		console.log('self._music_list.length ' + self._music_list.length);
		if(self._music_list.length > 0){
			$('#id_btn_prev').addClass("play_button");
			$('#id_btn_play_pause').addClass("play_button");
			$('#id_btn_next').addClass("play_button");
		}else{
			$('#id_btn_prev').addClass("play_button_disabled");
			$('#id_btn_play_pause').addClass("play_button_disabled");
			$('#id_btn_next').addClass("play_button_disabled");
		}
	};

	this.PlayPause = function(){
		console.log('PlayPause ' );
		if(self._music_list.length == 0){
			console.log('music list zeip ');
			return;
		}

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
					self.PlayPause();
				break;
			}
		});
	};

	this.ToggleVolumeControl = function(){
		if(self._b_volume_show){
			$('.player_volume_div').hide();
			self._b_volume_show = false;
		}else{
			$('.player_volume_div').show();
			self._b_volume_show = true;
		}
	};

	this.TogglePlayList = function(){
		if(self._b_play_list_show){
			$('#id_player_music_list_div').hide();
			self._b_play_list_show = false;
		}else{
			$('#id_player_music_list_div').show();
			self._b_play_list_show = true;
		}
	};

	this.AddMusic = function(music){
		self._music_list.push(music);
		var last_idx = self._music_list.length-1;
		self.DisplayMusicList();
		self.SelectMusic(last_idx);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.LoadMusicList = function(music_list){
		self._music_list = music_list;
		console.log('LoadMusicList len ' + self._music_list.length);
		self.DisplayMusicList();
		self.SelectMusic(0);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.SavePlayList = function(){
		window.localStorage.setItem('PLAY_LIST', JSON.stringify(self._music_list));
	};

	this.ReloadPlayList = function(){
		var saved_play_list = window.localStorage.getItem('PLAY_LIST');
		if(saved_play_list == null || saved_play_list == ''){
			return;
		}

		self._music_list = JSON.parse((saved_play_list));
		if(self._music_list.length == 0){
			return;
		}
		self.DisplayMusicList();

		var select_music_idx = 0;
		{
			var last_played_music_id = window.localStorage.getItem('PLAYER.LAST_PLAYED_MUSIC_ID');
			console.log('last_played_music_id ' + last_played_music_id);
			if(last_played_music_id != null){
				for(var i=0 ; i<self._music_list.length ; i++){
					console.log('i ' + i + ' == ' + self._music_list[i].music_id);
					if(self._music_list[i].music_id == last_played_music_id){
						select_music_idx = i;
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
				self.SelectMusic(select_music_idx);
				self.__yt_player.LoadAndPlay(self._cur_video_id);
			}else{
				self.SelectMusic(select_music_idx);
				self.__yt_player.LoadAndSeekPlay(self._cur_video_id, last_play_ms);
			}
		}else{
			self.SelectMusic(select_music_idx, false);
			self.__yt_player.LoadButNotPlay(self._cur_video_id);
		}

		self.HighlightCurrentMusic();
		self.UpdatePlayPauseButton();
	};

	this.DisplayMusicList = function(){
		var h = '';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i]; 
			// var id = 'id_music_' + i;
			var id_title = 'id_music_title_'+i;
			var num = (i*1) + 1;

			h += '<div class="row my-1 py-1" id="' + id_title + '">';
			h += '	<div class="col-12" style="display:flex ; cursor:pointer;" onclick="window._cherry_player.OnClickSingleMusic(' + i + ')">';
			h += '		<div class="px-2">' + num + '</div>';
			h += '		<div class="" style="width:50px; height:50px">';
			h += '			<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/'+m.video_id+'/0.jpg">';
			h += '		</div>';
			h += '		<div class="pl-2 " style="width:100%">';
			h += '			<div class="text-dark">' + m.title + '</div>';
			h += '			<div class="text-secondary" style="font-size:0.8em">' + m.artist + '</div>';
			h += '		</div>';
			h += '	</div>';
			h += '</div>';
		}
		$('#id_div_cherry_player_music_list').html(h);
	};

	this.OnClickSingleMusic = function(idx){
		self.SelectMusic(idx);
		self.__yt_player.LoadAndPlay(self._cur_video_id);
	};

	this.HighlightCurrentMusic = function(){
		for(var i=0 ; i<self._music_list.length ; i++){
			$('#id_music_title_' + i).removeClass('playlist_music_highlight');	
		}

		console.log('HighlightCurrentMusic ');
		console.log('self._cur_music_idx ' + self._cur_music_idx);

		var id = '#id_music_title_' + self._cur_music_idx;
		console.log('id ' + id);
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
		self._cur_music_idx = id;
		self._cur_video_id = self._music_list[self._cur_music_idx].video_id;
		var music_id = self._music_list[self._cur_music_idx].music_id;
		window.localStorage.setItem('PLAYER.LAST_PLAYED_MUSIC_ID', music_id);
		self.DisplayTitleArtist(
			self._music_list[self._cur_music_idx].title,
			self._music_list[self._cur_music_idx].artist
		);

		self.HighlightCurrentMusic();
	};

	this.DisplayTitleArtist = function(title, artist){
		$('#id_label_title').html(title);
		$('#id_label_artist').html(artist);	
	};

	this.GetRandomIndex = function(){
		var min = 0;
		var max = self._music_list.length - 1;
		return Math.floor(Math.random() * (max - min)) + min;	
	};

	this.OnClickNext = function(){
		self.__yt_player.Stop();

		if(self._seq_type == SEQ_TYPE.Shuffle){
			self.SelectMusic(self.GetRandomIndex());
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;
		}else if(self._seq_type == SEQ_TYPE.Sequence){
			//순차적으로 전체를 반복
			var next_music_idx = self._cur_music_idx + 1;
			if(self._music_list.length == next_music_idx){
				next_music_idx = 0;
			}
			self.SelectMusic(next_music_idx);
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;		
		}
	};

	this.Next = function(){
		self.__yt_player.Stop();

		if(self._repeat_type == REPEAT_TYPE.ONE){
			//한 곡만 반복
			self.SelectMusic(self._cur_music_idx);
			self.__yt_player.LoadAndPlay(self._cur_video_id);
			return;
		}else if(self._repeat_type == REPEAT_TYPE.ALL){
			if(self._seq_type == SEQ_TYPE.Shuffle){
				self.SelectMusic(self.GetRandomIndex());
				self.__yt_player.LoadAndPlay(self._cur_video_id);
				return;
			}else if(self._seq_type == SEQ_TYPE.Sequence){
				//순차적으로 전체를 반복
				var next_music_idx = self._cur_music_idx + 1;
				if(self._music_list.length == next_music_idx){
					next_music_idx = 0;
				}
				self.SelectMusic(next_music_idx);
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
				var next_music_idx = self._cur_music_idx + 1;
				if(self._music_list.length == next_music_idx){
					return;
				}
				self.SelectMusic(next_music_idx);
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

		var htm = '';
		// htm += duration;
		// htm += ' - ';
		htm += minutes + ':' + seconds;

		$('#id_div_duration').html(htm);
	};
}