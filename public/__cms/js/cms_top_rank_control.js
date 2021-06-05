$('document').ready(function(){
	window._top_rank_control = new TopRankControl().Init();
	var playlist_storage = new PlaylistStorage_Memory([]);
	window._cherry_player = new CherryPlayer().Init(playlist_storage);
});

//-----------------------------------------------------------------
const RELEASE_MODE = {
	DRAFT:0,
	RELEASE:1
};

const FILTER_TYPE = {
	TOTAL:0,
	OK:1,
	NG:2
};

function TopRankControl(){
	var self = this;
	this._release_mode = RELEASE_MODE.DRAFT;
	this._country_code = null;
	this._source = null;
	this._music_list_draft = [];
	this._music_list_release = [];
	this._searched_artist_list = [];
	this._searched_music_list = [];
	this._working_idx = -1;
	this._filter_type = FILTER_TYPE.NG;
	this._youtube = null;
	this._youtube_searched_video_list = [];
	this._music_diff_name_list = [];
	this._working_music_idx = null;
	
	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		self.DISP_CountryList();
		self.GetReleaseTime();
		self.InitHandle();
		self.InitKeyHandle();
		self.UpdateReleaseModeBtn();
		self.DISP_UpdateFilterTypeButton();
		return this;
	};

	this.InitHandle = function(){
		$('#id_btn_cms_top_rank_lyrics_ok').on('click', self.OnClick_LyricsOK);
	};
	
	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			// console.log('key ' + e.keyCode);
			switch(e.keyCode){
				case 49://1
					self.SearchYoutube(self._working_idx, false);
					break;
				case 50://1
					self.SearchArtist(self._working_idx);
					self.OnClick_NavTab('artist');
					break;
				case 51://3
					self.SearchMusic(self._working_idx);
					self.OnClick_NavTab('music');
					break;
			}
		});
	};

	/////////////////////////////////////////////////////////////////////////////////////////////

	this.OnClick_ChangeFilter = function(filter_type){
		self._filter_type = filter_type;
		self.DISP_UpdateFilterTypeButton();

		if(self._release_mode == RELEASE_MODE.DRAFT){
			self.DISP_MusicList_Draft();
		}else if(self._release_mode == RELEASE_MODE.RELEASE){
			self.DISP_MusicList_Release();
		}
	};

	this.OnClick_NavTab = function(type){
		$('#id_nav_cms_top_rank_artist').removeClass('active');
		$('#id_nav_cms_top_rank_music').removeClass('active');
		$('#id_div_cms_top_rank_music_search_result').hide();
		$('#id_div_cms_top_rank_artist_search_result').hide();
		if(type == 'artist'){
			$('#id_nav_cms_top_rank_artist').addClass('active');
			$('#id_div_cms_top_rank_artist_search_result').show();
		}else if(type == 'music'){
			$('#id_nav_cms_top_rank_music').addClass('active');
			$('#id_div_cms_top_rank_music_search_result').show();
		}
	};

	this.OnClick_SearchedArtistOK = function(artist_uid){
		if(self._working_idx == -1 || self._working_idx == null){
			alert('choose working music first');
			return;
		}
		self._music_list_draft[self._working_idx].artist_uid = artist_uid;
		$('#id_label_artist_uid_'+self._working_idx).html(artist_uid);
	};

	this.OnClick_AddArtist = function(){
		var artist_name = $('#id_input_cms_top_rank_artist_search').val().trim();
		if(artist_name == ''){
			alert('artist name empty');
			return;
		}

		var req_data = {
			artist_name: artist_name
		};

		$.ajax({
			url:  '/__cms_api/find_or_add_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._SearchArtist(artist_name, function(res){
						if(res.ok){
							self._searched_artist_list = res.artist_list;
							self.DISP_SearchedArtistList();
						}else{
							alert(res.err);
						}
					});
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_AddVAArtist = function(){
		var artist_name = $('#id_input_cms_top_rank_artist_search').val().trim();
		if(artist_name == ''){
			alert('artist name empty');
			return;
		}

		var artist_name_list = artist_name.split(',');
		for(var i=0 ; i<artist_name_list.length ; i++){
			artist_name_list[i] = artist_name_list[i].trim();
		}

		var req_data = {
			artist_name_list: artist_name_list
		};

		$.ajax({
			url:  '/__cms_api/find_or_add_various_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._SearchArtist(artist_name, function(res){
						if(res.ok){
							self._searched_artist_list = res.artist_list;
							self.DISP_SearchedArtistList();
						}else{
							alert(res.err);
						}
					});
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_SearchArtist = function(){
		var artist_name = $('#id_input_cms_top_rank_artist_search').val().trim();
		if(artist_name == ''){
			return;
		}

		self._SearchArtist(artist_name, function(res){
			if(res.ok){
				self._searched_artist_list = res.artist_list;
				self.DISP_SearchedArtistList();
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_AddDiffNameOfMusic = function(idx){
		self._working_music_idx = idx;
		var m = self._searched_music_list[idx];
		self.GetMusicDiffNameList(m.music_uid);
		$('#id_label_cms_top_rank_music_uid').html(m.music_uid);
		$('#id_input_cms_top_rank_music_title').val(m.title);
		$('#id_div_cms_top_rank_music_diff_name_list').html('');
		$('#id_input_cms_top_rank_music_diff_name').val('');
		$('#id_modal_cms_top_rank_music_edit').modal('show');
	};

	this.OnClick_MusicDiffNameAdd = function(){
		var diff_name = $('#id_input_cms_top_rank_music_diff_name').val().trim();
		if(diff_name == ''){
			return;
		}

		var m = self._searched_music_list[self._working_music_idx];

		var req_data = {
			org_music_uid: m.music_uid,
			diff_name: diff_name,
			artist_uid: m.artist_uid,
			video_id: m.video_id
		};
		$.ajax({
			url:  '/__cms_api/add_music_diff_name',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetMusicDiffNameList(m.music_uid);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_MusicUpdate = function(){
		var title = $('#id_input_cms_top_rank_music_title').val().trim();
		if(title == ''){
			alert('title empty');
			return;
		}

		var m = self._searched_music_list[self._working_music_idx];
		var req_data = {
			title: title,
			music_uid: m.music_uid,
			video_id: m.video_id,
			artist_uid: m.artist_uid
		};
		$.ajax({
			url:  '/__cms_api/update_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					$('#id_modal_cms_top_rank_music_edit').modal('hide');
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_DeleteMusicDiffName = function(music_uid){
		var req_data = {
			music_uid: music_uid
		};
		$.ajax({
			url:  '/__cms_api/delete_music_diff_name',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetMusicDiffNameList();
				}else{
					alert(res.err);
				}
			}
		});

	};

	this.OnClick_LyricsEdit = function(idx){
		self._working_music_idx = idx;
		var title = '';
		var artist = '';
		var music_uid = null;
		var has_lyrics = false;
		if(self._release_mode == RELEASE_MODE.DRAFT){
			title = self._music_list_draft[idx].title;
			artist = self._music_list_draft[idx].artist;
			music_uid = self._music_list_draft[idx].music_uid;
			has_lyrics = self._music_list_draft[idx].has_lyrics;
		}else{
			title = self._music_list_release[idx].title;
			artist = self._music_list_release[idx].artist;
			music_uid = self._music_list_release[idx].music_uid;
			has_lyrics = self._music_list_release[idx].has_lyrics;
		}

		console.log('music_uid ' + music_uid);
		if(music_uid == null){
			alert('music_uid null');
			return;
		}

		$('#id_modal_cms_top_rank_lyrics_title').html(title);
		$('#id_modal_cms_top_rank_lyrics_artist').html(artist);
		$('#id_input_cms_top_rank_lyrics').val('');
		$('#id_modal_cms_top_rank_lyrics').modal('show');
		$('#id_input_cms_top_rank_lyrics').focus();

		var command_key_pressing = false;
		$('#id_input_cms_top_rank_lyrics').on('keydown', function(e){
			if(e.keyCode == 91){//mac command key
				command_key_pressing = true;
			}
			if(e.keyCode == 66){//b
				if(command_key_pressing){
					console.log('lyrics ok ');
					self.OnClick_LyricsOK();
				}
			}

		})
		$('#id_input_cms_top_rank_lyrics').on('keyup', function(e){
			if(e.keyCode == 91){//mac command key
				command_key_pressing = false;
			}
		})

		if(has_lyrics == 'Y'){
			var req = {music_uid:music_uid};
			$.ajax({
				url:  '/cherry_api/get_lyrics',
				type: 'POST',
				data: JSON.stringify(req),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						if(res.lyrics_info.registered){
							$('#id_input_cms_top_rank_lyrics').val(res.lyrics_info.text);
						}
					}else{
						alert(res.err);
					}
				}
			});
		}
	};

	this._lyrics_ok_ing = false;
	this.OnClick_LyricsOK = function(){
		if(self._lyrics_ok_ing){
			return;
		}
		self._lyrics_ok_ing = true;
		var music_uid = null;
		var has_lyrics = 'N';
		if(self._release_mode == RELEASE_MODE.DRAFT){
			music_uid = self._music_list_draft[self._working_music_idx].music_uid;
			has_lyrics = self._music_list_draft[self._working_music_idx].has_lyrics;
		}else{
			music_uid = self._music_list_release[self._working_music_idx].music_uid;
			has_lyrics = self._music_list_release[self._working_music_idx].has_lyrics;
		}

		var text = $('#id_input_cms_top_rank_lyrics').val();
		var req = {
			has_lyrics:has_lyrics,
			dj_user_id: window._dj_selector.API_Get_Choosed_DJs_UserID(),
			music_uid: music_uid,
			text: text
		};

		POST('/cherry_api/update_lyrics', req, (res)=>{
			self._lyrics_ok_ing = false;
			if(res.ok){
				// alert('success');
				$('#id_modal_cms_top_rank_lyrics').modal('hide');

				if(self._release_mode == RELEASE_MODE.DRAFT){
					self._music_list_draft[self._working_music_idx].has_lyrics = 'Y';
					self.DISP_MusicList_Draft();
				}else{
					self._music_list_release[self._working_music_idx].has_lyrics = 'Y';
					self.DISP_MusicList_Release();
				}
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_CopyTitle = function(idx){
		var title = '';
		if(self._release_mode == RELEASE_MODE.DRAFT){
			title = self._music_list_draft[idx].title;
		}else{
			title = self._music_list_release[idx].title;
		}
		console.log('title ' + title);
		$('#id_text_for_copy_text').val(title);
		$('#id_text_for_copy_text').select();
		document.execCommand("copy");		
	};

	/////////////////////////////////////////////////////////////////////////////////////////////

	this.GetMusicDiffNameList = function(music_uid){
		self._music_diff_name_list = [];
		var req_data = {
			music_uid: music_uid
		};
		$.ajax({
			url:  '/__cms_api/get_music_diff_name_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_diff_name_list = res.music_diff_name_list;
					self.DISP_MusicDiffNameList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.GetReleaseTime = function(){
		$.ajax({
			url:  '/cherry_api/top_rank/get_release_time',
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					console.log('release_time_list length ' + res.release_time_list.length);
					for(var i=0 ; i<res.release_time_list.length ; i++){
						var country_code = res.release_time_list[i].country_code;
						var release_time = new Date(res.release_time_list[i].release_time);
						var source = res.release_time_list[i].source;

						const time = release_time.toLocaleString('ko-KR', { hour: 'numeric', minute: 'numeric', second:'numeric', hour12: true });
						const date = release_time.toLocaleString('ko-KR', { day: 'numeric', month: 'numeric', year:'numeric' });

						$(`#id_label_country_release_time-${country_code}-${source}`).html(date + ' ' + time);
					}
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.AutoMusicRegisterProcess = function(video_id){
		if(self._music_list_draft[self._working_idx].artist_uid == null){
			alert('choose artist first');
			return;
		}

		self._music_list_draft[self._working_idx].video_id = video_id;
		$(`#id_text_video_id_${self._working_idx}`).val(video_id);

		if(self._music_list_draft[self._working_idx].video_id == null){
			alert('video id null');
			return;
		}

		self.AddMusic();
	};

	this.ToggleReleaseType = function(){
		if(self._release_mode == RELEASE_MODE.DRAFT){
			self._release_mode = RELEASE_MODE.RELEASE;
		}else{
			self._release_mode = RELEASE_MODE.DRAFT;
		}
		self.UpdateReleaseModeBtn();
		self.OpenWork();
	};

	this.UpdateReleaseModeBtn = function(){
		$('#id_btn_release_type_draft').removeClass('btn-primary');
		$('#id_btn_release_type_draft').removeClass('btn-outline-primary');
		$('#id_btn_release_type_release').removeClass('btn-primary');
		$('#id_btn_release_type_release').removeClass('btn-outline-primary');
		
		if(self._release_mode == RELEASE_MODE.DRAFT){
			$('#id_btn_release_type_draft').addClass('btn-primary');
			$('#id_btn_release_type_release').addClass('btn-outline-primary');
		}else{
			$('#id_btn_release_type_draft').addClass('btn-outline-primary');
			$('#id_btn_release_type_release').addClass('btn-primary');
		}
	};

	this.ChooseCountry = function(country_code, source){
		console.log('country_code ' + country_code);
		self._country_code = country_code;
		self._source = source;
		self.OpenWork();
	};

	this.OpenWork = function(){
		self._music_list_draft = [];
		self._music_list_release = [];
		self.DISP_RankTitle();
		self.FetchTopRank();
	};

	this.FetchTopRank = function(){
		var req_data = {
			country_code: self._country_code,
			source: self._source
		};

		var url = '';
		if(self._release_mode == RELEASE_MODE.DRAFT){
			url = '/__cms_api/top_rank/fetch_draft_data'; 
		}else if(self._release_mode == RELEASE_MODE.RELEASE){
			url = '/__cms_api/top_rank/fetch_release_data'; 
		}

		$.ajax({
			url:  url,
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					if(self._release_mode == RELEASE_MODE.DRAFT){
						self._music_list_draft = res.music_list;
						self.DISP_MusicList_Draft();
						self.DISP_DraftStatus();
					}else if(self._release_mode == RELEASE_MODE.RELEASE){
						self._music_list_release = res.music_list;
						self.DISP_MusicList_Release();
					}
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.Auto = function(){
		self._music_list_draft = [];
		$('#id_div_music_list').empty();

		var req_data = {
			country_code: self._country_code,
			source:       self._source
		};

		$.ajax({
			url: '/__cms_api/fetch_content_from_url',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					for(var i=0 ; i<res.music_list.length ; i++){
						var music = {
							rank_num: i*1+1,
							title: res.music_list[i].title,
							artist: res.music_list[i].artist,
							video_id:null,
							music_uid:null
						};
						self._music_list_draft.push(music);
					}
					self.DISP_MusicList_Draft();
					self.AutoSearchArtistAndMusic();			
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.AutoSearchArtistAndMusic = function(){
		console.log('start auto search ' );
		var req_data = {
			music_list: self._music_list_draft
		};

		$.ajax({
			url: '/__cms_api/top_rank/auto_search_artist_and_music_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					var ret_music_list = res.ret_music_list;

					for(var i=0 ; i<ret_music_list.length ; i++){
						var m = ret_music_list[i];
						self._music_list_draft[i].artist_uid = m.artist_uid;
						self._music_list_draft[i].video_id = m.video_id;
						self._music_list_draft[i].music_uid = m.music_uid;
						$('#id_label_artist_uid_'+i).html(m.artist_uid);
						$('#id_label_music_uid_'+i).html(m.music_uid);
						$('#id_text_video_id_'+i).val(m.video_id);
						self.DISP_VideoImage(i);
					}
					self.DISP_DraftStatus();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.ChooseMusicForWorking = function(idx){
		self._working_idx = idx;
		for(var i=0 ; i<self._music_list_draft.length ; i++){
			if((i%2) == 1){
				$(`#id_row_music_${i}`).css('background-color', '#eeeeee');
			}else{
				$(`#id_row_music_${i}`).css('background-color', 'white');
			}
		}

		$(`#id_row_music_${idx}`).css('background-color', 'yellow');
	};

	this.AddMusic = function(){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert('Choose DJ');
			return;
		}

		var req_data = {
			dj_user_id: dj_user_id,
			music:{
				artist_uid: self._music_list_draft[self._working_idx].artist_uid,
				title:      self._music_list_draft[self._working_idx].title,
				video_id:   self._music_list_draft[self._working_idx].video_id
			}
		};

		$.ajax({
			url: '/__cms_api/add_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list_draft[self._working_idx].music_uid = res.music_info.music_uid;

					console.log('res.music_info.artist_uid ' + res.music_info.artist_uid);
					console.log('res.music_info.is_various ' + res.music_info.is_various);

					$('#id_label_music_uid_'+self._working_idx).html(res.music_info.music_uid);
					$('#id_label_artist_uid_'+self._working_idx).html(res.music_info.artist_uid);
					$('#id_label_is_various_'+self._working_idx).html(res.music_info.is_various=='Y'?'O':'');

					self.DISP_VideoImage(self._working_idx);
					self.NeedToSave();
					self.DISP_DraftStatus();
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

	this.CheckVideoID = function(ele, idx){
		var url = $(ele).val();
		var extract = UTIL_ExtractVideoIDFromUrl(url);

		if(extract == null){
			return null;
		}
		var video_id = extract;

		$(ele).val(video_id);
		self._music_list_draft[idx].video_id = video_id;
		self.DISP_VideoImage(idx);
	};

	this.SearchYoutube = function(idx, is_next){
		console.log('idx ' + idx + ' is_next ' + is_next);
		if(idx == -1){
			return;
		}

		var artist_name = self._music_list_draft[idx].artist.replace('&amp;', '');
		var title = self._music_list_draft[idx].title.replace('&amp;', '');
		var keyword = artist_name + "+" + title;
		self._searching_title = title;

		if(is_next == false){
			self._youtube_searched_video_list = [];
		}
		self._youtube.Search(keyword, is_next, self.OnYoutubeSearched, self.OnYoutubeVideoInfo);
	};

	this.OnClick_NextPageSearch = function(){
		self.SearchYoutube(self._working_idx, true);
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
			var OnChooseVideo = `window._top_rank_control.OnChooseVideo('${video_id}')`;
			var OnOkClick = `window._top_rank_control.AutoMusicRegisterProcess('${video_id}')`;

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
			<div class="text-center pointer border bg-primary" onClick="window._top_rank_control.OnClick_NextPageSearch()" style="height:50px; color:white">
				More
			</div>
		</div>
		`;

		$('#id_div_youtube_search_result').html(h);
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

	this.Jump = function(ele){
		console.log('ele ' + ele);
		var clicker = $(ele);
		var pos = clicker.position();
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

	this.SearchArtist = function(idx){
		var artist_name_to_search = self._music_list_draft[idx].artist;
		$('#id_input_cms_top_rank_artist_search').val(artist_name_to_search);

		self._SearchArtist(artist_name_to_search, function(res){
			if(res.ok){
				self._searched_artist_list = res.artist_list;
				var artist_uid_found = null;
				for(var i=0 ; i<self._searched_artist_list.length ; i++){
					var a = self._searched_artist_list[i];
					if(a.name == artist_name_to_search){
						if(a.is_diff_name == 'Y'){
							artist_uid_found = a.org_artist_uid;
						}else{
							artist_uid_found = a.artist_uid;
						}
						break;
					}
				}
				
				if(artist_uid_found != null){
					self._music_list_draft[self._working_idx].artist_uid = artist_uid_found;
					$('#id_label_artist_uid_'+self._working_idx).html(artist_uid_found);
				}
				self.DISP_SearchedArtistList();		
			}else{
				alert(res.err);
			}	
		});
	};

	this._SearchArtist = function(keyword, cb){
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
				if(cb){
					cb(res);
				}
			}
		});
	};

	this.SearchMusic = function(idx){
		self._searched_music_list = [];
		console.log('idx ' + idx);
		var req_data = {
			artist_name: self._music_list_draft[idx].artist,
			title:       self._music_list_draft[idx].title
		};

		$.ajax({
			url: '/cherry_api/search_music_smart',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					var list1 = res.list1;
					var list2 = res.list2;

					for(var i1=0 ; i1<list1.length ; i1++){
						var m1 = list1[i1];
						for(var i2=0 ; i2<list2.length ; i2++){
							var m2 = list2[i2];
							if(m1.music_uid == m2.music_uid){
								list2.splice(i2, 1);
								break;
							}
						}
					}

					self._searched_music_list = list1.concat(list2);
					self.DISP_SearchedMusicList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.UseThisMusicID = function(searched_music_uidx){
		console.log('searched_music_uidx ' + searched_music_uidx);

		self._music_list_draft[self._working_idx].video_id = self._searched_music_list[searched_music_uidx].video_id;
		self._music_list_draft[self._working_idx].music_uid = self._searched_music_list[searched_music_uidx].music_uid;
		$('#id_label_music_uid_'+self._working_idx).html(self._searched_music_list[searched_music_uidx].music_uid);
		$('#id_label_artist_uid_'+self._working_idx).html(self._searched_music_list[searched_music_uidx].artist_uid);
		$('#id_label_is_various_'+self._working_idx).html(self._searched_music_list[searched_music_uidx].is_various=='Y'?'O':'');
		$('#id_text_video_id_'+self._working_idx).val(self._searched_music_list[searched_music_uidx].video_id);
		self.DISP_VideoImage(self._working_idx);
		self.NeedToSave();
		self.DISP_DraftStatus();
	};

	this.Save = function(){
		if(self._music_list_draft.length == 0){
			alert('music list empty');
			return;
		}

		var req_data = {
			country_code: self._country_code,
			source:       self._source,
			music_list:   self._music_list_draft
		};

		$.ajax({
			url: '/__cms_api/top_rank/save_draft',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					// alert('success');
					self.CompleteSave();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.Release = function(){
		if(self._music_list_draft.length == 0){
			alert('music list empty');
			return;
		}

		var req_data = {
			country_code: self._country_code,
			source:       self._source,
			music_list:   self._music_list_draft
		};

		$.ajax({
			url: '/__cms_api/top_rank/release_draft',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetReleaseTime();
					alert('success');
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.NeedToSave = function(){
		$('#id_btn_save').removeClass('btn-primary');
		$('#id_btn_save').addClass('btn-danger');
	};

	this.CompleteSave = function(){
		$('#id_btn_save').removeClass('btn-danger');
		$('#id_btn_save').addClass('btn-primary');
	};

	////////////////////////////////////////////////////////////////////////////////////////////////

	this.DISP_UpdateFilterTypeButton = function(){
		$('#id_btn_cms_top_rank_filter_total').removeClass('btn-primary');
		$('#id_btn_cms_top_rank_filter_ok').removeClass('btn-primary');
		$('#id_btn_cms_top_rank_filter_ng').removeClass('btn-primary');

		if(self._filter_type == FILTER_TYPE.TOTAL){
			$('#id_btn_cms_top_rank_filter_total').addClass('btn-primary');
		}else if(self._filter_type == FILTER_TYPE.OK){
			$('#id_btn_cms_top_rank_filter_ok').addClass('btn-primary');
		}else if(self._filter_type == FILTER_TYPE.NG){
			$('#id_btn_cms_top_rank_filter_ng').addClass('btn-primary');
		}
	};

	this.DISP_MusicList_Draft = function(){
		$('#id_div_music_list').empty();
		var h = '<table class="table table-sm table-striped small">';
		h += `
		<tr>
			<th>No.</th>
			<th>Artist</th>
			<th>AID</th>
			<th>VA</th>
			<th>Title</th>
			<th>Video ID</th>
			<th>IMG</th>
			<th>MID</th>
			<th>L</th>
		</tr>
		`;

		for(var i=0 ; i<self._music_list_draft.length ; i++){
			var m = self._music_list_draft[i];

			if(self._filter_type == FILTER_TYPE.NG){
				if(m.music_uid != null){
					continue;
				}	
			}
			if(self._filter_type == FILTER_TYPE.OK){
				if(m.music_uid == null){
					continue;
				}	
			}

			var img_url = '';
			if(m.video_id != null){
				img_url = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			}
			var on_click_lyrics = `window._top_rank_control.OnClick_LyricsEdit(${i})`;
			var on_click_copy_title = `window,_top_rank_control.OnClick_CopyTitle(${i})`;
			var lyrics_badge_color = 'badge-danger';
			if(m.has_lyrics == 'Y'){
				lyrics_badge_color = 'border';
			}

			h += `
			<tr onclick="window._top_rank_control.ChooseMusicForWorking(${i})" id="id_row_music_${i}">
				<td class="bd-danger">${m.rank_num}</td>
				<td>${m.artist}</td>
				<td id="id_label_artist_uid_${i}">${m.artist_uid}</td>
				<td id="id_label_is_various_${i}">${m.is_various=='Y'?'O':''}</td>
				<td onClick="${on_click_copy_title}" class="pointer">${m.title}</td>
				<td>
					<input type="text" style="width:100px; font-size:0.8em" id="id_text_video_id_${i}" onFocusOut="window._top_rank_control.CheckVideoID(this, ${i})" value="${m.video_id}"></input>
				</td>
				<td><img style="height: 30px; width: 30px;" id="id_img_${i}" src="${img_url}"/></td>
				<td id="id_label_music_uid_${i}">${m.music_uid}</td>
				<td>
					<i class="badge badge-sm ${lyrics_badge_color} pointer" onClick="${on_click_lyrics}">${m.has_lyrics}</i>
				</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_music_list').html(h);
	};

	this.DISP_MusicList_Release = function(){
		$('#id_div_music_list').empty();
		var h = '<table class="table table-sm table-striped small">';
		h += `
		<tr>
			<th>No.</th>
			<th>Artist</th>
			<th>AID</th>
			<th>VA</th>
			<th>Title</th>
			<th>Video ID</th>
			<th>IMG</th>
			<th>MID</th>
			<th>L</th>
		</tr>
		`;

		for(var i=0 ; i<self._music_list_release.length ; i++){
			var m = self._music_list_release[i];
			var img_url = '';
			if(m.video_id != null){
				img_url = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			}
			var on_click_lyrics = `window._top_rank_control.OnClick_LyricsEdit(${i})`;
			var on_click_copy_title = `window,_top_rank_control.OnClick_CopyTitle(${i})`;
			var lyrics_badge_color = 'badge-danger';
			if(m.has_lyrics == 'Y'){
				lyrics_badge_color = 'border';
			}

			h += `
			<tr>
				<td class="bd-danger">${m.rank_num}</td>
				<td>${m.artist}</td>
				<td>${m.artist_uid}</td>
				<td>${m.is_various=='Y'?'O':''}</td>
				<td onClick="${on_click_copy_title}" class="pointer">${m.title}</td>
				<td>${m.video_id}</td>
				<td><img style="height: 30px; width: 30px;" id="id_img_${i}" src="${img_url}"/></td>
				<td id="id_label_music_uid_${i}">${m.music_uid}</td>
				<td>
					<i class="badge badge-sm ${lyrics_badge_color} pointer" onClick="${on_click_lyrics}">${m.has_lyrics}</i>
				</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_music_list').html(h);
	};

	this.DISP_SearchedMusicList = function(){
		$('#id_div_cms_top_rank_music_search_result').empty();

		var h = `<table class="table table-sm table-striped small">
		<tr>
			<th>Music ID</th>
			<th>Artist</th>
			<th>Title</th>
			<th>Video ID</th>
			<th></th>
		</tr>`;

		for(var i=0 ; i<self._searched_music_list.length ; i++){
			var m = self._searched_music_list[i];
			var on_click_ok = `window._top_rank_control.UseThisMusicID(${i})`;
			var on_click_plus = `window._top_rank_control.OnClick_AddDiffNameOfMusic(${i})`;
			var music_uid = m.music_uid;
			console.log(m.title + ' ' + m.is_diff_name + ' ' + m.org_music_uid);
			var title_color = 'black';
			
			if(m.is_diff_name == 'Y'){
				music_uid = m.org_music_uid;
				title_color = '#bbbbbb';
			}

			h += `
			<tr>
				<td>${music_uid}</td>
				<td>${m.artist}</td>
				<td style="color:${title_color}">${m.title}</td>
				<td>${m.video_id}</td>
				<td class="text-right">
			`;

			if(m.is_diff_name == 'N'){
				h += `
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${on_click_ok}">OK</span>
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${on_click_plus}"><i class="fas fa-pen"></i></span>
				`;
			}
			h += `
				</td>
			</tr>`;
		}

		if(self._searched_music_list.length == 0){
			h += '<tr><td colspan="4" class="text-center">No Result</td></tr>';
		}

		h += '</table>';

		$('#id_div_cms_top_rank_music_search_result').html(h);
	};

	this.DISP_SearchedArtistList = function(){
		var h = `<table class="table table-sm small">
		<tr>
		<th>AID</th>
		<th>Name</th>
		<th>VA</th>
		<th>Diff</th>
		<th></th>
		</tr>`;

		for(var i=0 ; i<self._searched_artist_list.length ; i++){
			var a = self._searched_artist_list[i];
			console.log(a.name + ' ' + a.artist_uid + ' ' + a.is_diff_name + ' ' + a.org_artist_uid);
			var artist_uid = a.artist_uid;
			if(a.is_diff_name == 'Y'){
				artist_uid = a.org_artist_uid;
			}
			var on_click_ok = `window._top_rank_control.OnClick_SearchedArtistOK('${artist_uid}')`;

			h += `
			<tr>
				<td>${artist_uid}</td>
				<td>${a.name}</td>
				<td>${a.is_various}</td>
				<td>${a.is_diff_name}</td>
				<td>
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${on_click_ok}">OK</span>
				</td>
			</tr>
			`;
		}
		
		$('#id_div_cms_top_rank_artist_search_result').html(h);
	};

	this.DISP_RankTitle = function(){
		var title = self._country_code;
		if(self._release_mode == RELEASE_MODE.DRAFT){
			title += `[Draft][${self._source}]`;
		}else{
			title += `[Release][${self._source}]`;
		}

		$('#id_label_rank_title').html(title);
	};

	this.DISP_CountryList = function(){
		var h = '';
	
		for (var i = 0; i < COUNTRY_CODE_LIST.length; i++) {
			var cc = COUNTRY_CODE_LIST[i];
			var source_list = window._top_100_source.list[cc];

			h += `
			<div class="border small">
				<div>${cc}</div>
			`;

			console.log(cc + ' count ' + source_list.length);

			for(var s=0 ; s<source_list.length ; s++){
				var source = source_list[s].source;
				var on_click = `window._top_rank_control.ChooseCountry('${cc}', '${source}')`;

				h += `
				<div class="d-flex border-top" style="cursor:pointer" onClick="${on_click}">
					<div class="col-3 my-auto text-right border-right">${source}</div>
					<div class="col-9 my-auto" style="font-size: 0.6em" id="id_label_country_release_time-${cc}-${source}"></div>
				</div>
				`;
			}

			h += `
				</div>
			`;
		}
	
		$('#id_div_country_list').html(h);
	};

	this.DISP_DraftStatus = function(){
		$('#id_label_total').text(self._music_list_draft.length);
		var ok_cnt = 0;
		for(var i=0 ; i<self._music_list_draft.length ; i++){
			var m = self._music_list_draft[i];
			if(m.music_uid != null){
				ok_cnt++;
			}
		}
		$('#id_label_ok').text(ok_cnt);
		$('#id_label_ng').text(self._music_list_draft.length - ok_cnt);
	};

	this.DISP_VideoImage = function(idx){
		var video_id = self._music_list_draft[idx].video_id;
		var img_url = '';
		if(video_id != null && video_id != ''){
			img_url = `https://img.youtube.com/vi/${video_id}/0.jpg`;
		}
		
		$('#id_img_'+idx).attr('src', img_url);
	};

	this.DISP_MusicDiffNameList = function(){
		var h = `
		<table class="table table-sm table-stripped">
		`;

		for(var i=0 ; i<self._music_diff_name_list.length ; i++){
			var m = self._music_diff_name_list[i];
			var on_click_trash = `window._top_rank_control.OnClick_DeleteMusicDiffName('${m.music_uid}')`;
			h += `
			<tr>
				<td>
					${m.title}
					<span class="badge badge-sm badge-primary" style="cursor:poinger" onClick="${on_click_trash}"><i class="fas fa-trash-alt"></i></span>
				</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_cms_top_rank_music_diff_name_list').html(h);
	};

}

