$('document').ready(function(){
	window._era_control = new EraControl().Init();
	var playlist_storage = new PlaylistStorage_Memory([]);
	window._cherry_player = new CherryPlayer().Init(playlist_storage);
});

const EDIT_TYPE = {
	MELON_DRAFT : 0,
	GINIE_DRAFT : 1,
	RELEASE : 2
};

const REGION = {
	DOMESTIC: 'domestic',
	FOREIGN: 'foreign'
};

function EraControl(){
	var self = this;
	this._era_uid = null;
	this._source = '';
	this._year_list = [];
	this._year = null;
	this._edit_type = EDIT_TYPE.RELEASE;
	this._music_list_draft = [];
	this._music_list_release = [];
	this._working_idx = null;
	this._youtube = null;
	this._youtube_searched_video_list = [];
	this._searched_artist_list = [];
	this._searched_music_list = [];
	this._working_music_idx = null;
	this._choosed_video_id = null;
	this._region = REGION.DOMESTIC;

	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		self.InitHandle();
		self.InitKeyHandle();
		self.LoadYearList();
		self.HighlightEditType();
		self.HighlightRegion();
		return this;
	};

	this.InitHandle = function(){
	};

	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			// console.log('key ' + e.keyCode);
			switch(e.keyCode){
				case 49://1
					self.SearchYoutube(self._working_idx, false);
					break;
				case 50://2
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

	this.LoadYearList = function(){
		var req = {
			country_code: window._country_selector.GetCountryCode(),
			region: self._region
		};
		POST('/cherry_api/era/get_year_list', req, res=>{
			if(res.ok){
				self._year_list = res.year_list;
				self.DISP_YearList();
			}else{
				alert(res.err);
			}
		});
	};

	//-------------------------------------------------------

	this.OnClick_AddYear = function(){
		var year = $('#id_input_cms_era_year').val().trim();
		if(year == ''){
			alert('input year');
			return;
		}
		for(var i=0 ; i<self._year_list.length ; i++){
			if(year == self._year_list[i].year){
				alert('same year is already registered.');
				return;
			}
		}

		var req = {
			country_code: window._country_selector.GetCountryCode(),
			year: year,
			region: self._region
		};
		POST('/cherry_api/era/add_year', req, res=>{
			if(res.ok){
				self.LoadYearList();
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_SelectYear = function(idx){
		self._music_list_draft = [];
		self._music_list_release = [];

		self._year = self._year_list[idx].year;
		self._era_uid = self._year_list[idx].era_uid;
		console.log('self._era_uid ' + self._era_uid);
		$('#id_label_cms_era_selected_year').html(self._year);

		if(self._edit_type == EDIT_TYPE.MELON_DRAFT){
			self._source = 'melon';
			self.GetDraft();
		}else if(self._edit_type == EDIT_TYPE.GINIE_DRAFT){
			self._source = 'ginie';
			self.GetDraft();
		}else if(self._edit_type == EDIT_TYPE.RELEASE){
			self._source = null;
			self.GetRelease();
		}
	};

	this.OnClick_EditType = function(type){
		self._edit_type = type;
		if(self._edit_type == EDIT_TYPE.MELON_DRAFT){
			self._source = 'melon';
			self.GetDraft();
		}else if(self._edit_type == EDIT_TYPE.GINIE_DRAFT){
			self._source = 'ginie';
			self.GetDraft();
		}else if(self._edit_type == EDIT_TYPE.RELEASE){
			self._source = null;
			self.GetRelease();
		}
		self.HighlightEditType();
	};

	this.OnClick_Region = function(region){
		self._region = region;
		self.HighlightRegion();
		self._music_list_draft = [];
		self._music_list_release = [];
		self.DISP_MusicList_Draft();
		self.DISP_MusicList_Release();
		self.LoadYearList();
	};

	this.OnClick_Auto = function(){
		if(self._year == null){
			alert('choose year');
			return;
		}
		if(self._edit_type == EDIT_TYPE.RELEASE){
			return;
		}

		var site = '';
		if(self._edit_type == EDIT_TYPE.MELON_DRAFT){
			site = 'melon';
		}else if(self._edit_type == EDIT_TYPE.GINIE_DRAFT){
			site = 'ginie';
		}
		var req = {
			site:   site,
			year:   self._year,
			region: self._region
		};
		POST('/__cms_api/era/get_auto_era_chart', req, res=>{
			if(res.ok){
				self._music_list_draft = res.auto_music_list;
				self.DISP_MusicList_Draft();
				self.AutoSearchArtistAndMusic();
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_Save = function(){
		if(self._year == null){
			alert('choose year');
			return;
		}
		if(self._edit_type == EDIT_TYPE.RELEASE){
			return;
		}
		if(self._music_list_draft.length == 0){
			return;
		}

		var req = {
			era_uid:    self._era_uid,
			source:     self._source,
			music_list: self._music_list_draft
		};

		POST('/__cms_api/era/update_draft', req, res=>{
			if(res.ok){
				self.CompleteSave();
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_Release = function(){
		if(self._year == null){
			alert('choose year');
			return;
		}
		if(self._edit_type == EDIT_TYPE.RELEASE){
			alert('release mode !!!');
			return;
		}
		if(self._music_list_draft.length == 0){
			alert('there are no musics');
			return;
		}

		var req = {
			era_uid:    self._era_uid,
			music_list: self._music_list_draft
		};

		console.log('before post ');
		POST('/__cms_api/era/release', req, res=>{
			console.log('res.ok ' + res.ok);
			if(res.ok){
				alert('success');
			}else{
				alert(res.err);
			}
		});
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
					self._music_list_draft[self._working_idx].artist_uid = res.artist_uid;
					$('#id_label_artist_uid_'+self._working_idx).html(res.artist_uid);

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
					self._music_list_draft[self._working_idx].artist_uid = res.artist_uid;
					$('#id_label_artist_uid_'+self._working_idx).html(res.artist_uid);

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
				var artist_uid_found = null;
				for(var i=0 ; i<self._searched_artist_list.length ; i++){
					var a = self._searched_artist_list[i];
					if(a.name == keyword){
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

	//-------------------------------------------------------

	this.HighlightEditType = function(){
		$('#id_btn_cms_era_melon').removeClass('btn-primary');
		$('#id_btn_cms_era_ginie').removeClass('btn-primary');
		$('#id_btn_cms_era_release').removeClass('btn-primary');
		if(self._edit_type == EDIT_TYPE.MELON_DRAFT){
			$('#id_btn_cms_era_melon').addClass('btn-primary');
		}else if(self._edit_type == EDIT_TYPE.GINIE_DRAFT){
			$('#id_btn_cms_era_ginie').addClass('btn-primary');
		}else if(self._edit_type == EDIT_TYPE.RELEASE){
			$('#id_btn_cms_era_release').addClass('btn-primary');
		}
	};

	this.HighlightRegion = function(){
		$('#id_btn_cms_era_domestic').removeClass('btn-primary');
		$('#id_btn_cms_era_foreign').removeClass('btn-primary');
		if(self._region == REGION.DOMESTIC){
			$('#id_btn_cms_era_domestic').addClass('btn-primary');
		}else{
			$('#id_btn_cms_era_foreign').addClass('btn-primary');
		}
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
						$('#id_text_video_id_'+i).html(m.video_id);
						self.DISP_VideoImage(i);
					}
					// self.DISP_DraftStatus();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.SearchYoutube = function(idx, is_next){
		console.log('idx ' + idx + ' is_next ' + is_next);
		if(idx == -1){
			return;
		}

		var artist_name = self._music_list_draft[idx].artist.replace('&amp;', '');
		var title = self._music_list_draft[idx].title.replace('&amp;', '').replace('?', '');
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
			var OnChooseVideo = `window._era_control.OnChooseVideo('${video_id}')`;
			var OnOkClick = `window._era_control.AutoMusicRegisterProcess('${video_id}')`;

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
			<div class="text-center pointer border bg-primary" onClick="window._era_control.OnClick_NextPageSearch()" style="height:50px; color:white">
				More
			</div>
		</div>
		`;

		$('#id_div_youtube_search_result').html(h);
		self.HighlightChoosedYoutubeVideo();
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
		self._choosed_video_id = video_id;
		self.HighlightChoosedYoutubeVideo();
		var music = {
			video_id: video_id
		};
		window._cherry_player.TryMusic(music);
	};

	this.HighlightChoosedYoutubeVideo = function(){
		for(var i=0 ; i<self._youtube_searched_video_list.length ; i++){
			var tmp_video_id = self._youtube_searched_video_list[i].video_id;
			if(tmp_video_id == self._choosed_video_id){
				$('#id_youtube_video_row-'+tmp_video_id).css('background', 'orange');
			}else{
				$('#id_youtube_video_row-'+tmp_video_id).css('background', 'white');
			}
		}
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
		$('#id_text_video_id_'+self._working_idx).html(self._searched_music_list[searched_music_uidx].video_id);
		self.DISP_VideoImage(self._working_idx);
		self.NeedToSave();
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

	this.AutoMusicRegisterProcess = function(video_id){
		if(self._music_list_draft[self._working_idx].artist_uid == null){
			alert('choose artist first');
			return;
		}

		self._music_list_draft[self._working_idx].video_id = video_id;
		$(`#id_text_video_id_${self._working_idx}`).html(video_id);

		if(self._music_list_draft[self._working_idx].video_id == null){
			alert('video id null');
			return;
		}

		self.AddMusic();
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

	this.NeedToSave = function(){
		$('#id_btn_save').removeClass('btn-primary');
		$('#id_btn_save').addClass('btn-danger');
	};

	this.CompleteSave = function(){
		$('#id_btn_save').removeClass('btn-danger');
		$('#id_btn_save').addClass('btn-primary');
	};

	this.GetDraft = function(){
		var req = {
			era_uid: self._era_uid,
			source:  self._source
		};
		POST('/__cms_api/era/get_draft', req, res=>{
			if(res.ok){
				self._music_list_draft = res.music_list;
				self.DISP_MusicList_Draft();
			}else{
				alert(res.err);
			}
		});
	};

	this.GetRelease = function(){
		if(self._era_uid == null){
			return;
		}
		$.get(`/cherry_api/era/get_music_list?eid=${self._era_uid}`, res=>{
			if(res.ok){
				self._music_list_release = res.music_list;
				self.DISP_MusicList_Release();
			}else{
				alert(res.err);
			}
		});
	};

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

	//-------------------------------------------------------

	this.DISP_YearList = function(){
		var h = '';
		for(var i=0 ; i<self._year_list.length ; i++){
			var onclick = `window._era_control.OnClick_SelectYear(${i})`;
			h += `
			<div class="pointer" onClick="${onclick}">
				${self._year_list[i].year}
			</div>
			`;
		}
		$('#id_cms_era_year_list').html(h);
	};

	this.DISP_MusicList_Draft = function(){
		var h = `<table class="table table-sm table-striped small">
		<tr>
		<th>No</th>
		<th>Artist</th>
		<th>AID</th>
		<th>VA</th>
		<th>Title</th>
		<th>VID</th>
		<th>IMG</th>
		<th>MID</th>
		</tr>
		`;

		for(var i=0 ; i<self._music_list_draft.length ; i++){
			var m = self._music_list_draft[i];
			var video_id = m.video_id;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;
			var onclick_choose = `window._era_control.ChooseMusicForWorking(${i})`;

			h += `
			<tr onClick="${onclick_choose}" id="id_row_music_${i}">
			<td>${i+1}</td>
			<td>${m.artist}</td>
			<td id="id_label_artist_uid_${i}">${m.artist_uid}</td>
			<td id="id_label_is_various_${i}">${m.is_various=='Y'?'O':''}</td>
			<td>${m.title}</td>
			<td id="id_text_video_id_${i}">${m.video_id}</td>
			<td>
				<image style="height: 50px; width: 50px;" id="id_img_${i}" src="${img_src}">
			</td>
			<td id="id_label_music_uid_${i}">${m.music_uid}</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_cms_era_music_list').html(h);
	};

	this.DISP_MusicList_Release = function(){
		var h = `<table class="table table-sm table-striped small">
		<tr>
		<th>No</th>
		<th>Artist</th>
		<th>AID</th>
		<th>VA</th>
		<th>Title</th>
		<th>VID</th>
		<th>IMG</th>
		<th>MID</th>
		</tr>
		`;

		for(var i=0 ; i<self._music_list_release.length ; i++){
			var m = self._music_list_release[i];
			var video_id = m.video_id;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;

			h += `
			<tr>
			<td>${i+1}</td>
			<td>${m.artist}</td>
			<td>${m.artist_uid}</td>
			<td>${m.is_various=='Y'?'O':''}</td>
			<td>${m.title}</td>
			<td>${m.video_id}</td>
			<td>
				<image style="height: 50px; width: 50px;" id="id_img_${i}" src="${img_src}">
			</td>
			<td id="id_label_music_uid_${i}">${m.music_uid}</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_cms_era_music_list').html(h);
	};

	this.DISP_VideoImage = function(idx){
		var video_id = self._music_list_draft[idx].video_id;
		var img_url = '';
		if(video_id != null && video_id != ''){
			img_url = `https://img.youtube.com/vi/${video_id}/0.jpg`;
		}
		
		$('#id_img_'+idx).attr('src', img_url);
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
			var on_click_ok = `window._era_control.OnClick_SearchedArtistOK('${artist_uid}')`;

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
			var on_click_ok = `window._era_control.UseThisMusicID(${i})`;
			var on_click_plus = `window._era_control.OnClick_AddDiffNameOfMusic(${i})`;
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

	this.DISP_MusicDiffNameList = function(){
		var h = `
		<table class="table table-sm table-stripped">
		`;

		for(var i=0 ; i<self._music_diff_name_list.length ; i++){
			var m = self._music_diff_name_list[i];
			var on_click_trash = `window._era_control.OnClick_DeleteMusicDiffName('${m.music_uid}')`;
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