$('document').ready(function(){
	window.__yt_player = new YoutubePlayer();
	__yt_player.Init();
});

function onYouTubeIframeAPIReady(){
	console.log('onYouTubeIframeAPIReady');
	__yt_player.Ready();
}

function YoutubePlayer(){
	var self = this;
	this._is_youtube_ready = false;
	this._is_player_ready = false;
	this._player = null;
	this._video_id = null;
	this._is_flow_controlling = false;
	this._timer = null;
	this._is_playing = false;
	this._cb_on_ready = null;
	this._cb_on_flow_event = null;
	this._cb_on_player_ready = null;
	this._cb_on_player_state_changed = null;

	this.Init = function(){
		var tag = document.createElement('script');

		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	};

	this.SetEventListener = function(cb_on_ready, cb_on_flow_event, 
		cb_on_player_ready, cb_on_player_state_changed){
			console.log('SetEventListener');
		self._cb_on_ready = cb_on_ready;
		self._cb_on_flow_event = cb_on_flow_event;
		self._cb_on_player_ready = cb_on_player_ready;
		self._cb_on_player_state_changed = cb_on_player_state_changed;
	};

	this.Ready = function(){
		console.log('Ready');
		self._is_youtube_ready = true;
		if(self._cb_on_ready) self._cb_on_ready();
	};

	this.LoadVideo = function(video_id){
		// console.log('youtube player is ready ? ' + self._is_ready);

		if(self._player == null){
			self._video_id = video_id;
 			self._player = new YT.Player('player', {
				height: '240',
				width: '320',
				videoId: self._video_id,
				events: {
					'onReady': self.OnPlayerReady,
					'onStateChange': self.OnPlayerStateChange
				}
			});
		}else{
			if(self._video_id == video_id){
				return;
			}else{
				self._video_id = video_id;
				self._player.loadVideoById(video_id);
			}
		}
	};

	this.OnPlayerReady = function(){
		// console.log('OnPlayerReady');
		self._is_player_ready = true;
		var pb_rates = self._player.getAvailablePlaybackRates();
		var duration = self._player.getDuration();
		// console.log('duration ' + duration);
		var volume = self._player.getVolume();

		if(self._cb_on_player_ready){
			self._cb_on_player_ready(pb_rates, duration, volume);
		}
	};

	this.OnPlayerStateChange = function(event){
		console.log('event ' + event.data);
		var duration = self._player.getDuration();
		switch(event.data){
			case YT.PlayerState.ENDED:
				self.FlowControlStop();
				self._is_playing = false;
				break;
			case YT.PlayerState.PLAYING:
				self.FlowControlStart();
				self._is_playing = true;
				break;
			case YT.PlayerState.PAUSED:
				self.FlowControlStop();
				self._is_playing = false;
				break;
			case YT.PlayerState.BUFFERING:
				self.FlowControlStop();
				self._is_playing = false;
				break;
			case YT.PlayerState.CUED:
				self.FlowControlStop();
				self._is_playing = false;
				break;
		}

		if(self._cb_on_player_state_changed){
			self._cb_on_player_state_changed(event.data, duration);
		}
	};

	this.SeekAndPlay = function(time_ms){
		self._player.cueVideoById({
			videoId:self._video_id,
			startSeconds:time_ms/1000
		});
		self._player.playVideo();
	};

	this.FlowControlStart = function(){
		if(self._is_flow_controlling)
			return;
		self._is_flow_controlling = true;
		self._timer = setInterval(self.FlowControl, 100);
	};

	this.FlowControlStop = function(){
		self._is_flow_controlling = false;
		clearInterval(self._timer);
	};

	this.FlowControl = function(){
		var cur_time = self._player.getCurrentTime();
		if(self._cb_on_flow_event){
			self._cb_on_flow_event(cur_time);
		}
	};

	this.Play = function(){
		// if(self._is_playing == false){
			self._player.playVideo();
		// }
	};

	this.Stop = function(){
		self._player.stopVideo();
	};

	this.Pause = function(){
		if(self._is_playing){
			self._player.pauseVideo();
		}
	};

	this.IsPlaying = function(){
		return self._is_playing;
	};

	this.ChangeSpeed = function(speed){
		var float_speed = parseFloat(speed);
		console.log(float_speed);
		self._player.setPlaybackRate(parseFloat(float_speed));
	};

	this.SetVolume = function(volume){
		self._player.setVolume(volume);
	};
}