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

	this.Init = function(){
		$('#id_player_music_list_div').hide();
		self.InitHandle();
		self.InitKeyHandle();
		__yt_player.SetEventListener(self.OnYoutubeReady, self.OnFlowEvent, self.OnPlayerReady, self.OnPlayerStateChange);
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_play').on('click', self.Play);
		$('#id_btn_next').on('click', self.Next);
		$('#id_btn_pause').on('click', self.Pause);
		$('#id_btn_seq_type').on('click', self.ToggleSeqType);
		$('#id_btn_repeat_type').on('click', self.ToggleRepeatType);
		$('#id_btn_playlist_show_hide').on('click', self.TogglePlayList);
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

	this.TogglePlayList = function(){
		if(self._b_play_list_show){
			$('#id_player_music_list_div').hide();
			self._b_play_list_show = false;
		}else{
			$('#id_player_music_list_div').show();
			self._b_play_list_show = true;
		}
	};

	this.LoadMusicList = function(music_list){
		self._music_list = music_list;
		console.log('LoadMusicList len ' + self._music_list.length);
		self.DisplayMusicList();
		self.SelectMusic(0);
	};

	this.DisplayMusicList = function(){
		var htm = '';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i]; 
			var id = 'id_music_' + i;
			htm += '<div style="cursor:pointer" id="' + id + '" onclick="SelectMusic(' + i + ')">' + m.artist + ' - ' + m.title + '</div>';
		}
		$('#id_div_music_list').html(htm);
	};

	this.ToggleSeqType = function(){
		if(self._seq_type == SEQ_TYPE.Sequence){
			self._seq_type = SEQ_TYPE.Shuffle;
		}else{
			self._seq_type = SEQ_TYPE.Sequence;
		}
		self.UpdateSeqType();
	};

	this.ToggleRepeatType = function(){
		if(self._repeat_type == REPEAT_TYPE.ALL){
			self._repeat_type = REPEAT_TYPE.ONE;
		}else if(self._repeat_type == REPEAT_TYPE.ONE){
			self._repeat_type = REPEAT_TYPE.END;
		}else if(self._repeat_type == REPEAT_TYPE.END){
			self._repeat_type = REPEAT_TYPE.ALL;
		}
		self.UpdateRepeatType();
	};

	this.UpdateSeqType = function(){
		if(self._seq_type == SEQ_TYPE.Sequence){
			$('#id_btn_seq_type').html('Seq');
		}else{
			$('#id_btn_seq_type').html('Shuffle');
		}
	};

	this.UpdateRepeatType = function(){
		if(self._repeat_type == REPEAT_TYPE.ALL){
			$('#id_btn_repeat_type').html('All');
		}else if(self._repeat_type == REPEAT_TYPE.ONE){
			$('#id_btn_repeat_type').html('One');
		}else if(self._repeat_type == REPEAT_TYPE.END){
			$('#id_btn_repeat_type').html('End');
		}
	};

	this.Play = function(){
		__yt_player.Play();
	};

	this.Pause = function(){
		__yt_player.Pause();
	};

	this.HighlightCurrentMusic = function(){
		for(var i=0 ; i<self._music_list.length ; i++){
			var id = '#id_music_' + i;
			$(id).css('color', 'black');	
		}

		var id = '#id_music_' + self._cur_music_idx;
		$(id).css('color', 'red');
	};

	this.SelectMusic = function(id){
		console.log('id ' + id);
		self._cur_music_idx = id;
		var video_id = self._music_list[self._cur_music_idx].video_id;
		__yt_player.LoadVideo(video_id);
		if(__yt_player._is_player_ready){
			__yt_player.Play();
		}
		self.HighlightCurrentMusic();
	};

	this.GetRandomIndex = function(){
		var min = 0;
		var max = self._music_list.length - 1;
		return Math.floor(Math.random() * (max - min)) + min;	
	};

	this.Next = function(){
		console.log('next ' );
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
		self._cur_music_idx = 0;
		// self.HighlightCurrentMusic();
		// __yt_player.LoadVideo(self._music_list[0].video_id);
	};
	
	this.OnFlowEvent = function(play_time){
		var ms = parseInt(play_time * 1000);
		var progress_rate = (ms / self._play_time_ms) * 100;
		$('#id_slider').val(progress_rate);
	};
	
	this.OnPlayerReady = function(pb_rates, duration, volume){
		console.log('duration ' + duration);
		self.DisplayDuration(duration);
		__yt_player.Play();
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