$('document').ready(function(){
	window._top_rank_control = new TopRankControl().Init();
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
	this._working_idx = -1;
	this._filter_type = FILTER_TYPE.NG;
	this._music_diff_name_list = [];
	this._working_music_idx = null;
	this._elvis = null;
	
	this.Init = function(){
		$('#id_div_elvis').load('/__cms/elvis.htm', function(){
			var playlist_storage = new PlaylistStorage_Memory([]);
			window._cherry_player = new CherryPlayer().Init(playlist_storage);		

			//slider control은 원래 자동으로 초기화 되는데
			//타이밍 이슈로 인해 강제로 다시 초기화 함.
			window._slider_control = null;
			window._slider_control = new SliderControl().Init();
		});
		{
			window._elvis.SetCallback_SearchedArtistOK(self.OnClick_SearchedArtistOK);
			window._elvis.SetCallback_MusicOK(self.UseThisMusicID);
			window._elvis.SetCallback_YoutubeSearchOK(self.AutoMusicRegisterProcess);
		}

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
					self.SearchYoutube(self._working_idx);
					break;
				case 50://1
					self.SearchArtist(self._working_idx);
					break;
				case 51://3
					self.SearchMusic(self._working_idx);
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

	this.OnClick_SearchedArtistOK = function(artist_uid){
		if(self._working_idx == -1 || self._working_idx == null){
			alert('choose working music first');
			return;
		}
		self._music_list_draft[self._working_idx].artist_uid = artist_uid;
		$('#id_label_artist_uid_'+self._working_idx).html(artist_uid);
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

	this.SearchYoutube = function(idx){
		if(idx == -1){
			return;
		}

		var artist_name = self._music_list_draft[idx].artist.replace('&amp;', '');
		var title = self._music_list_draft[idx].title.replace('&amp;', '').replace('?', '');
		var keyword = artist_name + "+" + title;

		window._elvis.SearchYoutube(keyword);
	};

	this.SearchArtist = function(idx){
		var artist_name_to_search = self._music_list_draft[idx].artist;

		window._elvis.SearchArtist(artist_name_to_search, function(artist_list){
			self._searched_artist_list = artist_list;
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
		});
	};

	this.SearchMusic = function(idx){
		var artist_name = self._music_list_draft[idx].artist;
		var title = self._music_list_draft[idx].title;
		window._elvis.SearchMusic(artist_name, title);
	};

	this.UseThisMusicID = function(music){
		self._music_list_draft[self._working_idx].video_id = music.video_id;
		self._music_list_draft[self._working_idx].music_uid = music.music_uid;
		$('#id_label_music_uid_'+self._working_idx).html(music.music_uid);
		$('#id_label_artist_uid_'+self._working_idx).html(music.artist_uid);
		$('#id_label_is_various_'+self._working_idx).html(music.is_various=='Y'?'O':'');
		$('#id_text_video_id_'+self._working_idx).val(music.video_id);
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
	
		console.log('COUNTRY_CODE_LIST ' + COUNTRY_CODE_LIST.length);

		for (var i = 0; i < COUNTRY_CODE_LIST.length; i++) {
			console.log('cc ' + cc);
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
	
		$('#id_div_top_rank_country_list').html(h);
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
}

