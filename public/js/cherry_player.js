$('document').ready(function(){
	window._cherry_player = new CherryPlayer().Init();
});

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
	this._music_list = [];
	this._video_id = null;
	this._cur_music_idx = -1;
	this._play_time_ms = 0;
	this._seq_type = SEQ_TYPE.Sequence;
	this._repeat_type = REPEAT_TYPE.ALL;
	this._b_play_list_show = false;
	this._b_volume_show = false;
	this._id_slider_fill = null;
	this._play_auto_start = false;

	this.Init = function(){
		var play_last_state = window.localStorage.getItem('PLAY_LAST_STATE');
		console.log('play_last_state ' + play_last_state);
		if(play_last_state == '1'){
			self._play_auto_start = true;
		}

		$('#id_player_music_list_div').hide();
		self.InitHandle();
		self.InitKeyHandle();
		__yt_player.SetEventListener(self.OnYoutubeReady, self.OnFlowEvent, self.OnPlayerReady, self.OnPlayerStateChange);
		self._id_slider_fill = $('#id_slider_fill');
		self.ReloadPlayerIcons();
		self.ReloadPlayList();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_play_pause').on('click', self.PlayPause);
		$('#id_btn_prev').on('click', self.Next);
		$('#id_btn_next').on('click', self.Next);
		$('#id_btn_seq_type').on('click', self.ToggleSeqType);
		$('#id_btn_repeat_type').on('click', self.ToggleRepeatType);
		$('#id_btn_playlist_show_hide').on('click', self.TogglePlayList);
		$('#id_btn_playlist_hide').on('click', self.TogglePlayList);
		$('#id_slider_volume').on('input', self.VolumeControl);
		$('#id_btn_volume').on('click', self.ToggleVolumeControl);
	};

	this.UpdatePlayPauseButton = function(){
		if(__yt_player._is_playing){
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

		if(__yt_player._is_player_ready == false){
			console.log('__yt_player._is_player_ready ' + __yt_player._is_player_ready);
			return;
		}
		if(__yt_player._is_playing){
			__yt_player.Pause();
			window.localStorage.setItem('PLAY_LAST_STATE', '0');
		}else{
			__yt_player.Play();
			window.localStorage.setItem('PLAY_LAST_STATE', '1');
		}
	};

	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			switch(e.keyCode){
				case 32:
					if(__yt_player._is_player_ready){
						if(__yt_player._is_playing){
							self.Pause();
						}else{
							self.Play();
						}
					}
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
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.LoadMusicList = function(music_list){
		self._music_list = music_list;
		console.log('LoadMusicList len ' + self._music_list.length);
		self.DisplayMusicList();
		self.SelectMusic(0);
		self.UpdatePlayPauseButton();
		self.SavePlayList();
	};

	this.SavePlayList = function(){
		window.localStorage.setItem('PLAY_LIST', JSON.stringify(self._music_list));
	};

	this.ReloadPlayList = function(){
		// console.log('reload play list ' );
		var saved_play_list = window.localStorage.getItem('PLAY_LIST');
		if(saved_play_list == null){
			// console.log('saved_play_list null');
			return;
		}
		// console.log('saved_play_list ' + saved_play_list);
		self._music_list = JSON.parse((saved_play_list));
		// console.log('self._music_list len	' + self._music_list);
		self.DisplayMusicList();
		self.SelectMusic(0);
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
			h += '	<div class="col-12" style="display:flex ; cursor:pointer;" onclick="SelectMusic(' + i + ')">';
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

	this.HighlightCurrentMusic = function(){
		for(var i=0 ; i<self._music_list.length ; i++){
			$('#id_music_title_' + i).removeClass('playlist_music_highlight');	
		}

		var id = '#id_music_title_' + self._cur_music_idx;
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
		__yt_player.Play();
	};

	this.Pause = function(){
		__yt_player.Pause();
	};

	this.SelectMusic = function(id){
		console.log('id ' + id);
		self._cur_music_idx = id;
		var video_id = self._music_list[self._cur_music_idx].video_id;
		{
			$('#id_label_title').html(self._music_list[self._cur_music_idx].title);
			$('#id_label_artist').html(self._music_list[self._cur_music_idx].artist);
		}

		if(__yt_player._player != null){
			__yt_player.LoadVideo(video_id);
			if(__yt_player._is_player_ready){
				__yt_player.Play();
			}	
		}
		self.HighlightCurrentMusic();
	};

	this.GetRandomIndex = function(){
		var min = 0;
		var max = self._music_list.length - 1;
		return Math.floor(Math.random() * (max - min)) + min;	
	};

	this.Next = function(){
		__yt_player.Stop();

		if(self._repeat_type == REPEAT_TYPE.ONE){
			//한 곡만 반복
			self.SelectMusic(self._cur_music_idx);
			return;
		}else if(self._repeat_type == REPEAT_TYPE.ALL){
			if(self._seq_type == SEQ_TYPE.Shuffle){
				self.SelectMusic(self.GetRandomIndex());
				return;
			}else if(self._seq_type == SEQ_TYPE.Sequence){
				//순차적으로 전체를 반복
				var next_music_idx = self._cur_music_idx + 1;
				if(self._music_list.length == next_music_idx){
					next_music_idx = 0;
				}
				self.SelectMusic(next_music_idx);
				return;		
			}
		}else if(self._repeat_type == REPEAT_TYPE.END){
			if(self._seq_type == SEQ_TYPE.Shuffle){
				self.SelectMusic(self.GetRandomIndex());
				return;
			}else if(self._seq_type == SEQ_TYPE.Sequence){
				//순차적으로 전체를 반복
				var next_music_idx = self._cur_music_idx + 1;
				if(self._music_list.length == next_music_idx){
					return;
				}
				self.SelectMusic(next_music_idx);
				return;		
			}
		}
	};

	this.OnYoutubeReady = function(){
		if(self._music_list.length > 0){
			self._cur_music_idx = 0;
			self.HighlightCurrentMusic();
			__yt_player.LoadVideo(self._music_list[0].video_id);
		}
	};
	
	this.OnFlowEvent = function(play_time){
		var ms = parseInt(play_time * 1000);
		var progress_rate = (ms / self._play_time_ms) * 100;

		// console.log('progress_rate ' + progress_rate);
		self._id_slider_fill.width(progress_rate + "%");

		// $('#id_slider').val(progress_rate);
	};
	
	this.OnPlayerReady = function(pb_rates, duration, volume){
		console.log('duration ' + duration);
		console.log('volume ' + volume);
		$('#id_slider_volume').val(volume);
		self.DisplayDuration(duration);

		console.log('self._play_auto_start ' + self._play_auto_start);
		if(self._play_auto_start){
			__yt_player.Play();
		}
	};
	
	this.VolumeControl = function(){
		var volume = $('#id_slider_volume').val();
		// console.log('volume ' + volume);
		__yt_player.SetVolume(volume);
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