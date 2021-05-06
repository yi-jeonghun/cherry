$('document').ready(function(){
	window._top_rank_control = new TopRankControl().Init();
	window._cherry_player = new CherryPlayer().Init();
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
	this._music_list_draft = [];
	this._music_list_release = [];
	this._searched_music_list = [];
	this._working_idx = -1;
	this._filter_type = FILTER_TYPE.NG;
	this._youtube = null;
	this._youtube_searched_video_list = [];
	
	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		self.DisplayCountryList();
		self.GetReleaseTime();
		self.InitHandle();
		self.InitKeyHandle();
		self.UpdateReleaseModeBtn();
		return this;
	};

	this.InitHandle = function(){
		$('.slider_line_div').on('mousedown', self.OnTimeBarClick);
	};
	
	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			console.log('key ' + e.keyCode);
			switch(e.keyCode){
				case 49://1
					self.SearchYoutube(self._working_idx);
					break;
				case 51://3
				self.SearchMusic(self._working_idx);
					break;
			}
		});
	};

	this.DisplayCountryList = function(){
		var h = '<table class="table table-sm">';
	
		for (var i = 0; i < COUNTRY_CODE_LIST.length; i++) {
			var cc = COUNTRY_CODE_LIST[i];
			h += `
			<tr>
				<td>
					<button type="button" class="btn btn-sm btn-light w-100" 
					onclick="window._top_rank_control.ChooseCountry('${cc}')">${cc}</button>
				</td>
				<td id="id_label_country_release_time-${cc}" style="font-size:0.7em">
				</td>
			</tr>
			`;
		}
	
		h += '</table>';
		$('#id_div_country_list').html(h);
	};

	this.ChangeFilter = function(filter_type){
		self._filter_type = filter_type;
		if(self._release_mode == RELEASE_MODE.DRAFT){
			self.DisplayMusicList_Draft();
		}else if(self._release_mode == RELEASE_MODE.RELEASE){
			self.DisplayMusicList_Release();
		}
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
						var c = res.release_time_list[i];
						var d = new Date(c.release_time);
						// var date_str = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

						const time = d.toLocaleString('ko-KR', { hour: 'numeric', minute: 'numeric', second:'numeric', hour12: true });
						const date = d.toLocaleString('ko-KR', { day: 'numeric', month: 'numeric', year:'numeric' });

						$(`#id_label_country_release_time-${c.country_code}`).html(date + '<br>' + time);
					}
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.AutoMusicRegisterProcess = function(video_id){
		console.log('video_id ' + video_id);
		self._music_list_draft[self._working_idx].video_id = video_id;
		$(`#id_text_video_id_${self._working_idx}`).val(video_id);
		self.RegisterMusic();
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

	this.ChooseCountry = function(country_code){
		console.log('country_code ' + country_code);
		self._country_code = country_code;
		self.OpenWork();
	};

	this.OpenWork = function(){
		self._music_list_draft = [];
		self._music_list_release = [];
		self.DisplayRankTitle();
		self.FetchTopRank();
	};

	this.DisplayRankTitle = function(){
		var title = self._country_code;
		if(self._release_mode == RELEASE_MODE.DRAFT){
			title += '[Draft]';
		}else{
			title += '[Release]';
		}

		$('#id_label_rank_title').html(title);
	};

	this.FetchTopRank = function(){
		var req_data = {
			country_code: self._country_code
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
						self.DisplayMusicList_Draft();
						self.DisplayDraftStatus();
					}else if(self._release_mode == RELEASE_MODE.RELEASE){
						self._music_list_release = res.music_list;
						self.DisplayMusicList_Release();
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
			country_code: self._country_code
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
							music_id:null
						};
						self._music_list_draft.push(music);
					}
					self.DisplayMusicList_Draft();
					self.AutoSearchMusic();			
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplayDraftStatus = function(){
		$('#id_label_total').text(self._music_list_draft.length);
		var ok_cnt = 0;
		for(var i=0 ; i<self._music_list_draft.length ; i++){
			var m = self._music_list_draft[i];
			if(m.music_id != null){
				ok_cnt++;
			}
		}
		$('#id_label_ok').text(ok_cnt);
		$('#id_label_ng').text(self._music_list_draft.length - ok_cnt);
	};

	this.AutoSearchMusic = function(){
		console.log('start auto search ' );
		var req_data = {
			music_list: self._music_list_draft
		};

		$.ajax({
			url: '/__cms_api/top_rank/auto_search_music_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					var ret_music_list = res.ret_music_list;

					for(var i=0 ; i<ret_music_list.length ; i++){
						var m = ret_music_list[i];
						self._music_list_draft[i].video_id = m.video_id;
						self._music_list_draft[i].music_id = m.music_id;
						$('#id_label_music_id_'+i).html(m.music_id);
						$('#id_text_video_id_'+i).val(m.video_id);
						self.DisplayVideoImage(i);
					}
					self.DisplayDraftStatus();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplayMusicList_Draft = function(){
		$('#id_div_music_list').empty();
		var h = '<table class="table table-sm table-striped">';
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
		</tr>
		`;

		for(var i=0 ; i<self._music_list_draft.length ; i++){
			var m = self._music_list_draft[i];

			if(self._filter_type == FILTER_TYPE.NG){
				if(m.music_id != null){
					continue;
				}	
			}
			if(self._filter_type == FILTER_TYPE.OK){
				if(m.music_id == null){
					continue;
				}	
			}

			var img_url = '';
			if(m.video_id != null)
				img_url = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;

			h += `
			<tr onclick="window._top_rank_control.ChooseMusicForWorking(${i})" id="id_row_music_${i}">
				<td class="bd-danger">${m.rank_num}</td>
				<td>${m.artist}</td>
				<td id="id_label_artist_id_${i}">${m.artist_id}</td>
				<td id="id_label_is_various_${i}">${m.is_various=='Y'?'O':''}</td>
				<td>${m.title}</td>
				<td>
					<input type="text" style="width:100px; font-size:0.8em" id="id_text_video_id_${i}" onFocusOut="window._top_rank_control.CheckVideoID(this, ${i})" value="${m.video_id}"></input>
				</td>
				<td><img style="height: 30px; width: 30px;" id="id_img_${i}" src="${img_url}"/></td>
				<td id="id_label_music_id_${i}">${m.music_id}</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_music_list').html(h);
	};

	this.DisplayMusicList_Release = function(){
		$('#id_div_music_list').empty();
		var h = '<table class="table table-sm table-striped">';
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
		</tr>
		`;

		for(var i=0 ; i<self._music_list_release.length ; i++){
			var m = self._music_list_release[i];
			var img_url = '';
			if(m.video_id != null){
				img_url = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			}

			h += `
			<tr>
				<td class="bd-danger">${m.rank_num}</td>
				<td>${m.artist}</td>
				<td>${m.artist_id}</td>
				<td>${m.is_various=='Y'?'O':''}</td>
				<td>${m.title}</td>
				<td>${m.video_id}</td>
				<td><img style="height: 30px; width: 30px;" id="id_img_${i}" src="${img_url}"/></td>
				<td id="id_label_music_id_${i}">${m.music_id}</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_music_list').html(h);
	};

	this.ChooseMusicForWorking = function(idx){
		self._working_idx = idx;
		console.log('idx ' + idx);
		for(var i=0 ; i<self._music_list_draft.length ; i++){
			if((i%2) == 1){
				$(`#id_row_music_${i}`).css('background-color', '#eeeeee');
			}else{
				$(`#id_row_music_${i}`).css('background-color', 'white');
			}
		}

		$(`#id_row_music_${idx}`).css('background-color', 'yellow');
	};

	this.RegisterMusic = function(){
		if(self._music_list_draft[self._working_idx].video_id == null){
			alert('video id null');
			return;
		}

		var artist_name_list = [];
		var is_various_artist = false;
		//various artist인지 확인.
		{
			artist_name_list = self._music_list_draft[self._working_idx].artist.split(',');

			for(var i=0 ; i<artist_name_list.length ; i++){
				artist_name_list[i] = artist_name_list[i].trim();
			}

			console.log('_name.length ' + artist_name_list.length);
			if(artist_name_list.length > 1){
				is_various_artist = true;
			}
		}

		if(is_various_artist){
			self.FindOrAddVariousArtist(artist_name_list);
		}else{
			self.FindOrAddArtist(self._music_list_draft[self._working_idx].artist);
		}
	};

	this.FindOrAddArtist = function(artist_name){
		var req_data = {
			artist_name: artist_name.trim()
		};
		$.ajax({
			url: '/__cms_api/find_or_add_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.AddMusic(res.artist_id);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.FindOrAddVariousArtist = function(artist_name_list){
		var req_data = {
			artist_name_list: artist_name_list
		};
		$.ajax({
			url: '/__cms_api/find_or_add_various_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.AddMusic(res.artist_id);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.AddMusic = function(artist_id){
		console.log('Add Music artist_id ' + artist_id);
		var req_data = {
			//FIXME
			artist_id: artist_id,
			title:     self._music_list_draft[self._working_idx].title,
			video_id:  self._music_list_draft[self._working_idx].video_id
		};

		$.ajax({
			url: '/cherry_api/add_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list_draft[self._working_idx].music_id = res.music_info.music_id;

					console.log('res.music_info.artist_id ' + res.music_info.artist_id);
					console.log('res.music_info.is_various ' + res.music_info.is_various);

					$('#id_label_music_id_'+self._working_idx).html(res.music_info.music_id);
					$('#id_label_artist_id_'+self._working_idx).html(res.music_info.artist_id);
					$('#id_label_is_various_'+self._working_idx).html(res.music_info.is_various=='Y'?'O':'');

					self.DisplayVideoImage(self._working_idx);
					self.NeedToSave();
					self.DisplayDraftStatus();
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
		self.DisplayVideoImage(idx);
	};

	this.DisplayVideoImage = function(idx){
		var video_id = self._music_list_draft[idx].video_id;
		var img_url = '';
		if(video_id != null && video_id != ''){
			img_url = `https://img.youtube.com/vi/${video_id}/0.jpg`;
		}
		
		$('#id_img_'+idx).attr('src', img_url);
	};

	this.SearchYoutube = function(idx){
		if(idx == -1){
			return;
		}

		var artist_name = self._music_list_draft[idx].artist.replace('&amp;', '');
		var title = self._music_list_draft[idx].title.replace('&amp;', '');
		var keyword = artist_name + "+" + title;

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
			var OnChooseVideo = `window._top_rank_control.OnChooseVideo('${video_id}')`;
			var OnOkClick = `window._top_rank_control.AutoMusicRegisterProcess('${video_id}')`;

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

	this.OnTimeBarClick = function(e){
		var ele = $('.slider_line_div');
		var left = ele.position().left;
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
		self._youtube_searched_video_list = video_list;
		for(var i=0 ; i<video_list.length ; i++){
			$('#id_video_duration-'+video_list[i].video_id).html(video_list[i].duration);
		}
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
							if(m1.music_id == m2.music_id){
								list2.splice(i2, 1);
								break;
							}
						}
					}

					self._searched_music_list = list1.concat(list2);

					// if(self._searched_music_list.length > 0){
					// 	self._music_list_draft[idx].video_id = self._searched_music_list[0].video_id;
					// 	self._music_list_draft[idx].music_id = self._searched_music_list[0].music_id;
					// 	$('#id_label_music_id_'+idx).html(self._searched_music_list[0].music_id);
					// 	$('#id_text_video_id_'+idx).val(self._searched_music_list[0].video_id);
					// 	DisplayVideoImage(idx);
					// 	NeedToSave();
					// }
					self.DisplaySearchedMusicList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.DisplaySearchedMusicList = function(){
		$('#id_div_search_result').empty();

		var h = `<table class="table table-sm">
		<tr>
		<th>Music ID</th>
		<th>Artist</th>
		<th>Title</th>
		<th>Video ID</th>
		</tr>`;

		for(var i=0 ; i<self._searched_music_list.length ; i++){
			var m = self._searched_music_list[i];
			h += `
			<tr>
				<td>${m.music_id}</td>
				<td>${m.artist}</td>
				<td>${m.title}</td>
				<td>${m.video_id}</td>
				<td>
					<button type="button" class="btn btn-sm btn-primary" onClick="UseThisMusicID(${i})">OK</button>
				</td>
			</tr>`;
		}

		if(self._searched_music_list.length == 0){
			h += '<tr><td colspan="4" class="text-center">No Result</td></tr>';
		}

		h += '</table>';

		$('#id_div_search_result').html(h);
	};

	this.UseThisMusicID = function(searched_music_idx){
		console.log('searched_music_idx ' + searched_music_idx);

		self._music_list_draft[self._working_idx].video_id = self._searched_music_list[searched_music_idx].video_id;
		self._music_list_draft[self._working_idx].music_id = self._searched_music_list[searched_music_idx].music_id;
		$('#id_label_music_id_'+self._working_idx).html(self._searched_music_list[searched_music_idx].music_id);
		$('#id_label_artist_id_'+self._working_idx).html(self._searched_music_list[searched_music_idx].artist_id);
		$('#id_label_is_various_'+self._working_idx).html(self._searched_music_list[searched_music_idx].is_various=='Y'?'O':'');
		$('#id_text_video_id_'+self._working_idx).val(self._searched_music_list[searched_music_idx].video_id);
		self.DisplayVideoImage(self._working_idx);
		self.NeedToSave();
		self.DisplayDraftStatus();
	};

	this.Save = function(){
		if(self._music_list_draft.length == 0){
			alert('music list empty');
			return;
		}

		var req_data = {
			country_code: self._country_code,
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


}

