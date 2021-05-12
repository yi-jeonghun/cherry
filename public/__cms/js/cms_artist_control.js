$('document').ready(function(){
	window._artist_control = new ArtistControl().Init();
	var is_for_single_play = true;
	window._cherry_player = new CherryPlayer().Init(is_for_single_play);
});

function ArtistControl(){
	var self = this;
	this._artist_name = null;
	this._selected_artist_id = null;
	this._youtube = null;
	this._youtube_searched_video_list = [];

	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		console.log('init  ArtistControl');
		self.InitComponentHandle();
		return self;
	};

	this.InitComponentHandle = function(){
		console.log('InitComponentHandle ');
		$('#id_input_artist_keyword').keyup(self.OnInputArtistKeyword);
		$('#id_btn_search_youtube').on('click', self.OnClickSearchYoutube);
		$('.slider_line_div').on('mousedown', self.OnTimeBarClick);
	};

	this.OnInputArtistKeyword = function(){
		$('#id_div_artist_list').empty();

		var keyword = $('#id_input_artist_keyword').val().trim();
		console.log('keyword ' + keyword);
		if(keyword == ''){
			return;
		}

		var req_data = {
			keyword: keyword
		};

		$.ajax({
			url: '/cherry_api/search_artist_like',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DisplayArtistList(res.artist_list);
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplayArtistList = function(artist_list){
		var h = `
		<table class="table table-striped small">
		<tr>
			<th>ID</th>
			<th>VA</th>
			<th>Name</th>
		</tr>
		`;
		for(var i=0 ; i<artist_list.length ; i++){
			var a = artist_list[i];
			var on_click = `window._artist_control.OnChooseArtiat('${a.name}', '${a.artist_id}')`;

			h += `
			<tr onClick="${on_click}" style="cursor:pointer">
				<td>${a.artist_id}</td>
				<td>${a.is_various}</td>
				<td>${a.name}</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_artist_list').html(h);
	};

	this.OnChooseArtiat = function(name, artist_id){
		$('#id_div_music_list').empty();
		$('#id_label_artist_name').html(name);
		self._artist_name = name;
		self._selected_artist_id = artist_id;
		self.GetMusicListOfArtist();
	};

	this.GetMusicListOfArtist = function(){
		var req_data = {
			artist_id: self._selected_artist_id
		};

		$.ajax({
			url: '/cherry_api/fetch_music_list_by_artist_id',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DisplayMusicList(res.music_list);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.DisplayMusicList = function(music_list){
		var h = `
		<table class="table table-striped small">
		<tr>
		<th>Title</th>
		<th>MID</th>
		<th>VID</th>
		</tr>
		`;

		for(var i=0 ; i<music_list.length ; i++){
			var m = music_list[i];
			h += `
			<tr>
			<td>${m.title}</td>
			<td>${m.music_id}</td>
			<td>${m.video_id}</td>
			</tr>
			`;
		}

		$('#id_div_music_list').html(h);
	};

	this.OnClickSearchYoutube = function(){
		var title = $('#id_input_music_search_keyword').val().trim();
		if(title == ''){
			return;
		}

		var keyword = self._artist_name + " + " + title;

		self._youtube.Search(keyword, self.OnYoutubeSearched, self.OnYoutubeVideoInfo);
	};

	this.OnYoutubeSearched = function(video_list){
		self._youtube_searched_video_list = video_list;
		$('#id_div_youtube_search_result').empty();

		var h = `
		<div class="container-fluid">
		`;
		for(var i=0 ; i<video_list.length ; i++){
			var video = video_list[i];

			var video_id = video.video_id;
			var title = video.title;
			var channel = video.channel;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;
			var id_video_duration_str = `id_video_duration-${video_id}`;
			var id_youtube_video_row_str = `id_youtube_video_row-${video_id}`;
			var OnChooseVideo = `window._artist_control.OnChooseVideo('${video_id}')`;
			var OnOkClick = `window._artist_control.AutoMusicRegisterProcess('${video_id}')`;

			h += `
			<div class="row" style="margin-top:10px; border-bottom: 1px solid #eeeeee; cursor:pointer" id="${id_youtube_video_row_str}">
				<div class="col-1">
					<image style="height: 50px; width: 50px;" src="${img_src}">
				</div>
				<div class="col-1" id="${id_video_duration_str}">00:00:00</div>
				<div class="col-9 d-flex" onclick="${OnChooseVideo}">
					<div class="pl-1">
						<div class="text-dark">${title}</div>
						<div class="text-secondary" style="font-size: 0.8em">${channel}</div>
					</div>
				</div>
				<div class="col-1">
					<button class="btn btn-sm btn-primary" type="button" onClick="${OnOkClick}">OK</button>
				</div>
			</div>
			`;
		}

		h += `
		</div>
		`;

		$('#id_div_youtube_search_result').html(h);		
	};

	this.AutoMusicRegisterProcess = function(video_id){
		console.log('video_id ' + video_id);
		var title = $('#id_input_music_search_keyword').val().trim();

		var req_data = {
			//FIXME
			artist_id: self._selected_artist_id,
			title:     title,
			video_id:  video_id
		};

		$.ajax({
			url: '/cherry_api/add_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetMusicListOfArtist();
				}else{
					console.log('res.err_code ' + res.err_code);
					if(res.err_code == -2){
						alert(TR(L_SIGN_IN_REQUIRED));
					}else if(res.err_code == -3){
						alert(TR(L_SAME_TITLE_EXISTS));
					}else if(res.err_code == -4){
						alert(TR(L_SAME_VIDEO_EXISTS));
					}else{
						alert(res.err_msg);
					}
				}
			}
		});

	};

	
	this.OnYoutubeVideoInfo = function(video_list){
		self._youtube_searched_video_list = video_list;
		for(var i=0 ; i<video_list.length ; i++){
			$('#id_video_duration-'+video_list[i].video_id).html(video_list[i].duration);
		}
	};

	this.OnTimeBarClick = function(e){
		var ele = $('.slider_line_div');
		// var left = ele.position().left;
		var left = ele.offset().left;

		var width = ele.width();
		var click_x = e.pageX;

		var x = click_x - left;
		console.log('left ' + left + ' width ' + width + ' x ' + click_x);
		console.log('x ' + x);

		var percent = (x / width) * 100;
		console.log('percent ' + percent);
		window._cherry_player.SeekToPercent(percent);
	};

	this.OnChooseVideo = function(video_id){
		for(var i=0 ; i<self._youtube_searched_video_list.length ; i++){
			var tmp_video_id = self._youtube_searched_video_list[i].video_id;
			if(tmp_video_id == video_id){
				$('#id_youtube_video_row-'+tmp_video_id).css('background', 'orange');
			}else{
				$('#id_youtube_video_row-'+tmp_video_id).css('background', 'white');
			}
		}

		console.log('video_id ' + video_id);
		var music = {
			video_id: video_id
		};
		window._cherry_player.TryMusic(music);
	};
}