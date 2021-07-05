$('document').ready(function(){
	window._music_control = new MusicControl().Init();
	var playlist_storage = new PlaylistStorage_Memory([]);
	window._cherry_player = new CherryPlayer().Init(playlist_storage);
});

const MUSIC_LIST_TYPE = {
	NONE:-1,
	NO_LYRICS:0,
	CORRECTION:1
};

function MusicControl(){
	var self = this;
	this._music_list_type = MUSIC_LIST_TYPE.NONE;
	this._total_count = 0;
	this._music_list = [];
	this._page = 1;
	this._working_idx = -1;
	var command_key_pressing = false;
	this._lyrics_ok_ing = false;
	this._youtube = null;
	this._youtube_searched_video_list = [];

	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		self.InitHandle();
		return this;
	};

	this.InitHandle = function(){
		$('#id_btn_cms_music_lyrics_ok').on('click', self.OnClick_LyricsOK);
	};

	//--------------------------------------------------------

	this.GetMusicList_NoLyrics = function(is_next){
		self._music_list_type = MUSIC_LIST_TYPE.NO_LYRICS;
		self.HighlightListButton();

		if(is_next == false){
			self._page = 1;
			self._music_list = [];
		}else{
			self._page ++;
		}
		$.get('/__cms_api/get_music_list_no_lyrics?p='+self._page, (res)=>{
			if(res.ok){
				console.log('res.count ' + res.count);
				self._total_count = res.count;
				res.music_list.forEach(m => {
					self._music_list.push(m);
				})
				self.DISP_MusicList();
			}else{
				alert(ret.err);
			}
		});
	};

	this.GetMusicList_Correction = function(){
		self._music_list_type = MUSIC_LIST_TYPE.CORRECTION;
		self.HighlightListButton();
	
		$.get('/__cms_api/get_music_list_correction', (res)=>{
			if(res.ok){
				self._music_list = res.correction_music_list;
				self.DISP_CorrectionMusicList();
			}else{
				alert(ret.err);
			}
		});		
	};

	this.OnClick_OpenLyricsEdit = function(idx){
		var req = {
			music_uid: self._music_list[idx].music_uid
		};
		POST('/cherry_api/get_lyrics', req, res=>{
			if(res.ok){
				self.OpenLyricsEdit(idx, res.lyrics_info.text);
			}else{
				alert(res.err);
			}
		});
	};

	this.OpenLyricsEdit = function(idx, lyrics){
		self._working_idx = idx;
		console.log('idx ' + idx);
		var m = self._music_list[idx];
		$('#id_modal_cms_music_lyrics_artist').html(m.artist);
		$('#id_modal_cms_music_lyrics_title').html(m.title);
		$('#id_input_cms_music_lyrics').val(lyrics);
		
		$('#id_div_lyrics_conv').html(lyrics);
		var l = $('#id_div_lyrics_conv').html();
		$('#id_div_lyrics_conv').html('');
		$('#id_input_cms_music_lyrics').val(l);
		

		$('#id_modal_cms_music_lyrics').modal('show');
		$('#id_input_cms_music_lyrics').focus();

		$('#id_input_cms_music_lyrics').on('keydown', function(e){
			console.log('e.keyCode ' + e.keyCode);
			if(e.keyCode == 91){//mac left command
				command_key_pressing = true;
			}
			if(e.keyCode == 93){//right command
				if(command_key_pressing){
					console.log('lyrics ok ');
					self.OnClick_LyricsOK();
				}
			}

		});
		$('#id_input_cms_music_lyrics').on('keyup', function(e){
			if(e.keyCode == 91){//mac command key
				command_key_pressing = false;
			}
		})
	};

	this.OnClick_LyricsOK = function(){
		if(self._lyrics_ok_ing){
			return;
		}
		self._lyrics_ok_ing = true;
		var music_uid = self._music_list[self._working_idx].music_uid;
		var has_lyrics = self._music_list[self._working_idx].has_lyrics;
		var text = $('#id_input_cms_music_lyrics').val();
		console.log('has_lyrics ' + has_lyrics);

		var req = {
			has_lyrics:has_lyrics,
			dj_user_id: window._dj_selector.API_Get_Choosed_DJs_UserID(),
			music_uid: music_uid,
			text: text
		};

		POST('/cherry_api/update_lyrics', req, (res)=>{
			self._lyrics_ok_ing = false;
			if(res.ok){
				$('#id_modal_cms_music_lyrics').modal('hide');
				self._music_list[self._working_idx].has_lyrics = 'Y';
				$('#id_lebel_music_has_lyrics-'+self._working_idx).html('Y');
				$('#id_lebel_music_has_lyrics-'+self._working_idx).removeClass('badge-danger');
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_CopyTitle = function(idx){
		self.HightlightMusic(idx);
		var title = self._music_list[idx].title;
		$('#id_text_for_copy_text').val(title);
		$('#id_text_for_copy_text').select();
		document.execCommand("copy");		
	};

	this.OnClick_SearchGoogle = function(idx){
		$('#id_iframe_music_google_search').show();
		$('#id_div_youtube_search_result').hide();
		self.HightlightMusic(idx);
		var url = self.GetGoogleSearchURL(idx);
		$('#id_iframe_music_google_search').attr('src', url);
	};

	this.OnClick_ExtraceLyrics = function(idx){
		var url = self.GetGoogleSearchURL(idx);
		var req = {
			url:url
		};
		POST('/__cms_api/extract_lyrics_from_url', req, (res)=>{
			if(res.ok){
				// console.log('res.lyrics ' + res.lyrics);
				// var lyricst = self.decode_utf8(res.lyrics);
				self.OpenLyricsEdit(idx, res.lyrics);
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_PlayVideoFromMusicList = function(idx){
		self._working_idx = idx;
		self.HightlightMusic(idx);

		var music = {
			video_id: self._music_list[idx].video_id
		};
		window._cherry_player.TryMusic(music);
	};

	this.OnClick_PlayVideoFromYoutubeList = function(idx){
		var music = {
			video_id: self._youtube_searched_video_list[idx].video_id
		};
		window._cherry_player.TryMusic(music);
		self.HighlightYoutube(idx);
	};

	this.OnClick_SearchYoutube = function(idx){
		$('#id_iframe_music_google_search').hide();
		$('#id_div_youtube_search_result').show();

		self._working_idx = idx;
		self.HightlightMusic(idx);
		self.SearchYoutube(idx, false);
	};

	this.OnClick_NextPageSearch = function(){
		self.SearchYoutube(self._working_idx, true);
	};

	this.OnClick_Finish = function(idx){
		var music_uid = self._music_list[idx].music_uid;
		var req = {
			music_uid: music_uid
		};
		POST('/__cms_api/delete_music_correct_request', req, (res)=>{
			self.GetMusicList_Correction();
		});
	};

	this.OnClick_VideoIDEdit = function(idx){
		self._working_idx = idx;
		$('#id_text_cms_music_video_id').val(self._music_list[idx].video_id);
		$('#id_modal_cms_music_artist').html(self._music_list[idx].artist);
		$('#id_modal_cms_music_title').html(self._music_list[idx].title);
		$('#id_modal_cms_music_video_id').modal('show');
	};

	this.OnClick_VideoIDEdit_OK = function(){
		var video_id = $('#id_text_cms_music_video_id').val().trim();
		if(video_id == ''){
			return;
		}

		var req = {
			music_uid:  self._music_list[self._working_idx].music_uid,
			title:      self._music_list[self._working_idx].title,
			artist_uid: self._music_list[self._working_idx].artist_uid,
			video_id:   video_id
		};
		POST('/__cms_api/update_music', req, res=>{
			if(res.ok){
				$('#id_modal_cms_music_video_id').modal('hide');
				self.GetMusicList_Correction();
			}else{
				alert(res.err);
			}
		});
	};

	//---------------------------------------------------------

	this.GetGoogleSearchURL = function(idx){
		var title = self._music_list[idx].title;
		var artist = self._music_list[idx].artist;

		var query = `search?q=lyrics+${encodeURIComponent(title)}+${encodeURIComponent(artist)}`;
		query += '&igu=1';
		var url = 'https://www.google.com/' + query;

		console.log('url ' + url);
		return url;
	};

	this.HightlightMusic = function(idx){
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			if(idx == i){
				$('#id_music-'+m.music_uid).css('background-color', 'yellow');
			}else{
				$('#id_music-'+m.music_uid).css('background-color', 'white');
			}
		}
	};

	this.HighlightYoutube = function(idx){
		console.log('idx ' + idx);
		for(var i=0 ; i<self._youtube_searched_video_list.length ; i++){
			var y = self._youtube_searched_video_list[i];
			if(i == idx){
				console.log('i ' + i + ' yellow ' + y.video_id);
				$(`#id_youtube_video_row-${y.video_id}`).css('background-color', 'yellow');
			}else{
				console.log('i ' + i + ' white ' + y.video_id);
				$(`#id_youtube_video_row-${y.video_id}`).css('background-color', 'white');
			}
		}
	};

	this.HighlightListButton = function(){
		$('#id_btn_music_no_lyrics').removeClass('bg-primary');
		$('#id_btn_music_no_lyrics').css('color', 'black');
		$('#id_btn_music_correction').removeClass('bg-primary');
		$('#id_btn_music_correction').css('color', 'black');

		if(self._music_list_type == MUSIC_LIST_TYPE.NO_LYRICS){
			$('#id_btn_music_no_lyrics').addClass('bg-primary');
			$('#id_btn_music_no_lyrics').css('color', 'white');
		}else if(self._music_list_type == MUSIC_LIST_TYPE.CORRECTION){
			$('#id_btn_music_correction').addClass('bg-primary');
			$('#id_btn_music_correction').css('color', 'white');
		}
	};

	this.ChangeVideoID = function(video_id){
		var music_uid = self._music_list[self._working_idx].music_uid;
		var req = {
			music_uid: music_uid,
			video_id: video_id
		};
		POST('/__cms_api/change_video_id', req, res=>{
			self._music_list[self._working_idx].video_id = video_id;
			$(`#id_label_video_id-${music_uid}`).html(video_id);
		});
	};

	this.SearchYoutube = function(idx, is_next){
		console.log('idx ' + idx + ' is_next ' + is_next);
		if(idx == -1){
			return;
		}

		var artist_name = self._music_list[idx].artist.replace('&amp;', '');
		var title = self._music_list[idx].title.replace('&amp;', '');
		var keyword = artist_name + "+" + title;
		self._searching_title = title;

		if(is_next == false){
			self._youtube_searched_video_list = [];
		}
		self._youtube.Search(keyword, is_next, self.OnYoutubeSearched, self.OnYoutubeVideoInfo);
	};

	this.OnYoutubeSearched = function(video_list){
		for(var i=0 ; i<video_list.length ; i++){
			self._youtube_searched_video_list.push(video_list[i]);
		}
		$('#id_div_youtube_search_result').empty();

		var h = `
		<div class="container-fluid small">
		`;
		for(var i=0 ; i<self._youtube_searched_video_list.length ; i++){
			var video = self._youtube_searched_video_list[i];

			var video_id = video.video_id;
			var title = video.title;
			title = title.replace(self._searching_title, '<u style="color:red">'+self._searching_title+'</u>');
			var channel = video.channel;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;
			var id_video_duration_str = `id_video_duration-${video_id}`;
			var id_youtube_video_row_str = `id_youtube_video_row-${video_id}`;
			var OnChooseVideo = `window._music_control.OnClick_PlayVideoFromYoutubeList('${i}')`;
			var OnOkClick = `window._music_control.ChangeVideoID('${video_id}')`;

			h += `
			<div class="row" style="margin-top:10px; border-bottom: 1px solid #eeeeee; cursor:pointer" id="${id_youtube_video_row_str}">
				<div class="col-1">
					<image style="height: 50px; width: 50px;" src="${img_src}">
				</div>
				<div class="col-1" id="${id_video_duration_str}">${video.duration}</div>
				<div class="col-8 d-flex">
					<div class="pl-1">
						<div class="text-dark">${title}</div>
						<div class="text-secondary" style="font-size: 0.8em">
						${channel}
						[${video_id}]
						</div>
					</div>
				</div>
				<div class="col-1">
					<button type="button" class="btn btn-sm border" onclick="${OnChooseVideo}">
						<i style="font-size: 1.2em;margin-left:3px" class="fas fa-play"></i>
					</button>
				</div>
				<div class="col-1">
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${OnOkClick}">OK</span>
				</div>
			</div>
			`;
		}

		h += `
			<div class="text-center pointer border bg-primary" onClick="window._music_control.OnClick_NextPageSearch()" style="height:50px; color:white">
				More
			</div>
		</div>
		`;

		$('#id_div_youtube_search_result').html(h);
	};

	this.OnYoutubeVideoInfo = function(video_list){
		for(var i=0 ; i<video_list.length ; i++){
			for(var j=0 ; j<self._youtube_searched_video_list.length ; j++){
				if(self._youtube_searched_video_list[i].video_id == video_list[i].video_id){
					self._youtube_searched_video_list[i].duration = video_list[i].duration
					break;
				}
			}
			$('#id_video_duration-'+video_list[i].video_id).html(video_list[i].duration);
		}
	};

	//---------------------------------------------------------

	this.DISP_MusicList = function(){
		$('#id_label_cms_music_total').html(self._total_count);

		var h = `
		<table class="table table-sm table-stripped">
		<tr>
			<th>Artist</th>
			<th>Title</th>
			<th></th>
			<th>D</th>
			<th>L</th>
			<th>G</th>
		</tr>
		`;

		var i = 0;
		self._music_list.forEach(m => {
			var on_click_lyrics = `window._music_control.OnClick_OpenLyricsEdit(${i})`;
			var on_click_copy_title = `window,_music_control.OnClick_CopyTitle(${i})`;
			var on_click_google = `window,_music_control.OnClick_SearchGoogle(${i})`;
			var on_click_extract = `window._music_control.OnClick_ExtraceLyrics(${i})`;
			var on_click_play = `window._music_control.OnClick_PlayVideoFromMusicList('${i}')`;

			h += `
			<tr id='id_music-${m.music_uid}'>
				<td>${m.artist}</td>
				<td class="pointer" onClick="${on_click_copy_title}">${m.title}</td>
				<td>
					<span class="badge badge-sm border" onclick="${on_click_play}"><i class="fas fa-play"></i></span>
				</td>
				<td>${m.is_diff_name}</td>
				<td>
					<i class="badge badge-sm badge-danger pointer" onClick="${on_click_lyrics}" id="id_lebel_music_has_lyrics-${i}">
						N
					</i>
				</td>
				<td>
					<span class="badge badge-sm border pointer" onClick="${on_click_google}">G</span>
					<span class="badge badge-sm border pointer" onClick="${on_click_extract}">E</span>
				</td>
			</tr>
			`;
			i++
		});

		var on_click_more = `window._music_control.GetMusicList_NoLyrics(true)`;

		h += `
		<tr><td class="bg-primary text-white text-center pointer" colspan="2" onClick="${on_click_more}">More</td></tr>
		</table>`;
		
		$('#id_div_cms_music_list').html(h);
	};

	this.DISP_CorrectionMusicList = function(){
		$('#id_label_cms_music_total').html('');

		var h = `
		<table class="table table-sm table-stripped small">
		<tr>
			<th>Artist</th>
			<th>Title</th>
			<th>Video ID</th>
			<th></th>
			<th>Y</th>
			<th>Lyrics</th>
			<th>Video</th>
			<th>Ads</th>
			<th>L</th>
			<th>F</th>
		</tr>
		`;

		for(var i=0 ; i<self._music_list.length; i++){
			var m = self._music_list[i];
			var on_click_lyrics = `window._music_control.OnClick_OpenLyricsEdit(${i})`;
			var on_click_google = `window,_music_control.OnClick_SearchGoogle(${i})`;
			var on_click_extract = `window._music_control.OnClick_ExtraceLyrics(${i})`;
			var on_click_play = `window._music_control.OnClick_PlayVideoFromMusicList('${i}')`;
			var on_click_youtube = `window._music_control.OnClick_SearchYoutube(${i})`;
			var on_click_trash = `window._music_control.OnClick_Finish(${i})`;
			var on_click_video_id = `window._music_control.OnClick_VideoIDEdit(${i})`;

			h += `
			<tr id='id_music-${m.music_uid}'>
				<td>${m.artist}</td>
				<td>${m.title}</td>
				<td>
					<span id="id_label_video_id-${m.music_uid}">${m.video_id}</span>
				</td>
				<td>
					<span class="badge badge-sm border" onclick="${on_click_video_id}"><i class="fas fa-pen"></i></span>
				</td>
				<td>
					<span class="badge badge-sm border" onclick="${on_click_play}"><i class="fas fa-play"></i></span>
					<span class="badge badge-sm border pointer" onClick="${on_click_youtube}">Y</span>
				</td>
				<td>${m.lyrics}</td>
				<td>${m.video}</td>
				<td>${m.ads}</td>
				<td>
					<span class="badge badge-sm border pointer" onClick="${on_click_lyrics}">${m.has_lyrics}</span>
					<span class="badge badge-sm border pointer" onClick="${on_click_google}">G</span>
					<span class="badge badge-sm border pointer" onClick="${on_click_extract}">E</span>
				</td>
				<td>
					<span class="badge badge-sm border pointer" onClick="${on_click_trash}"><i class="fas fa-trash-alt"></i></span>
				</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_cms_music_list').html(h);
	};
}