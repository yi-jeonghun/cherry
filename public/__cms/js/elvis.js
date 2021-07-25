$('document').ready(function(){
	window._elvis = new Elvis().Init();
});

function Elvis(){
	var self = this;
	this._youtube = null;
	this._keyword = '';
	this._youtube_searched_video_list = [];
	this._choosed_video_id = null;
	this._searched_artist_list = [];
	this._searched_music_list = [];
	this._CB_OnClick_SearchedArtistOK = null;
	this._CB_OnClick_MusicOK = null;
	this._CB_OnClick_YoutubeSearchOK = null;

	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		return this;
	};

	this.SearchYoutube = function(keyword){
		self._youtube_searched_video_list = [];
		self._keyword = keyword;
		var is_next = false;
		self._youtube.Search(keyword, is_next, self.DISP_YoutubeSearchList, self.DISP_YoutubeVideoInfo);
	};

	this.SearchArtist = function(keyword, cb){
		self.OnClick_NavTab('artist');
		$('#id_input_cms_elvis_artist_search').val(keyword);

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
					self._searched_artist_list = res.artist_list;
					self.DISP_SearchedArtistList();
					if(cb){
						cb(res.artist_list);
					}	
				}else{
					console.log(res.err);
					alert(res.err);
				}
			}
		});
	};

	this.SearchMusic = function(artist_name, title){
		self.OnClick_NavTab('music');
		self._searched_music_list = [];
		var req_data = {
			artist_name: artist_name,
			title:       title
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
					console.log(res.err);
					alert(res.err);
				}
			}
		});
	};

	this.SetCallback_SearchedArtistOK = function(cb){
		self._CB_OnClick_SearchedArtistOK = cb;
	};

	this.SetCallback_MusicOK = function(cb){
		self._CB_OnClick_MusicOK = cb;
	};

	this.SetCallback_YoutubeSearchOK = function(cb){
		self._CB_OnClick_YoutubeSearchOK = cb;
	};

	//---------------------------------------------------

	this.OnClick_NextPageSearch = function(){
		var is_next = true;
		self._youtube.Search(self._keyword, is_next, self.DISP_YoutubeSearchList, self.DISP_YoutubeVideoInfo);
	};

	this.OnChooseVideo = function(video_id){
		self._choosed_video_id = video_id;
		self.HighlightChoosedYoutubeVideo();
		var music = {
			video_id: video_id
		};
		window._cherry_player.TryMusic(music);
	};

	this.OnClick_SearchedArtistOK = function(artist_uid){
		if(self._CB_OnClick_SearchedArtistOK){
			self._CB_OnClick_SearchedArtistOK(artist_uid);
		}
	}

	this.OnClick_NavTab = function(type){
		$('#id_cms_elvis_nav_artist').removeClass('active');
		$('#id_cms_elvis_nav_music').removeClass('active');
		$('#id_div_cms_elvis_music_search_result').hide();
		$('#id_div_cms_elvis_artist_search_result').hide();
		if(type == 'artist'){
			$('#id_cms_elvis_nav_artist').addClass('active');
			$('#id_div_cms_elvis_artist_search_result').show();
		}else if(type == 'music'){
			$('#id_cms_elvis_nav_music').addClass('active');
			$('#id_div_cms_elvis_music_search_result').show();
		}
	};

	this.OnClick_AddArtist = function(){
		var artist_name = $('#id_input_cms_elvis_artist_search').val().trim();
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
					self.SearchArtist(artist_name, function(artist_list){
						self._searched_artist_list = artist_list;
						self.DISP_SearchedArtistList();
					});
				}else{
					console.log(res.err);
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_AddVAArtist = function(){
		var artist_name = $('#id_input_cms_elvis_artist_search').val().trim();
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
					self.SearchArtist(artist_name, function(artist_list){
						self._searched_artist_list = artist_list;
						self.DISP_SearchedArtistList();
					});
				}else{
					console.log(res.err);
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_SearchArtist = function(){
		var keyword = $('#id_input_cms_elvis_artist_search').val();
		self.SearchArtist(keyword);
	};

	this.OnClick_MusicOK = function(idx){
		if(self._CB_OnClick_MusicOK){
			var music = self._searched_music_list[idx];
			self._CB_OnClick_MusicOK(music);
		}
	};

	this.OnClick_AddDiffNameOfMusic = function(idx){
		self._working_music_idx = idx;
		var m = self._searched_music_list[idx];
		self.GetMusicDiffNameList(m.music_uid);
		$('#id_label_cms_elvis_music_uid').html(m.music_uid);
		$('#id_input_cms_elvis_music_title').val(m.title);
		$('#id_div_cms_elvis_music_diff_name_list').html('');
		$('#id_input_cms_elvis_music_diff_name').val('');
		$('#id_modal_cms_elvis_music_edit').modal('show');
	};

	this.OnClick_MusicDiffNameAdd = function(){
		var diff_name = $('#id_input_cms_elvis_music_diff_name').val().trim();
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
					console.log(res.err);
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_MusicUpdate = function(){
		var title = $('#id_input_cms_elvis_music_title').val().trim();
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
					$('#id_modal_cms_elvis_music_edit').modal('hide');
				}else{
					console.log(res.err);
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
					console.log(res.err);
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_YoutubeSearchOK = function(video_id){
		if(self._CB_OnClick_YoutubeSearchOK){
			self._CB_OnClick_YoutubeSearchOK(video_id);
		}
	};

	//---------------------------------------------------

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
					console.log(res.err);
					alert(res.err);
				}
			}
		});
	};

	//---------------------------------------------------

	this.DISP_YoutubeSearchList = function(video_list){
		for(var i=0 ; i<video_list.length ; i++){
			self._youtube_searched_video_list.push(video_list[i]);
		}
		$('#id_div_elvis_youtube_search_result').empty();

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
			var OnChooseVideo = `window._elvis.OnChooseVideo('${video_id}')`;
			var OnOkClick = `window._elvis.OnClick_YoutubeSearchOK('${video_id}')`;

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
			<div class="text-center pointer border bg-primary" onClick="window._elvis.OnClick_NextPageSearch()" style="height:50px; color:white">
				More
			</div>
		</div>
		`;

		$('#id_div_elvis_youtube_search_result').html(h);
		self.HighlightChoosedYoutubeVideo();
	};

	this.DISP_YoutubeVideoInfo = function(video_list){
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
			var on_click_ok = `window._elvis.OnClick_SearchedArtistOK('${artist_uid}')`;

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
		
		$('#id_div_cms_elvis_artist_search_result').html(h);
	};

	this.DISP_SearchedMusicList = function(){
		$('#id_div_cms_elvis_music_search_result').empty();

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
			var on_click_ok = `window._elvis.OnClick_MusicOK(${i})`;
			var on_click_plus = `window._elvis.OnClick_AddDiffNameOfMusic(${i})`;
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

		$('#id_div_cms_elvis_music_search_result').html(h);
	};

	this.DISP_MusicDiffNameList = function(){
		var h = `
		<table class="table table-sm table-stripped">
		`;

		for(var i=0 ; i<self._music_diff_name_list.length ; i++){
			var m = self._music_diff_name_list[i];
			var on_click_trash = `window._elvis.OnClick_DeleteMusicDiffName('${m.music_uid}')`;
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

		$('#id_div_cms_elvis_music_diff_name_list').html(h);
	};
}