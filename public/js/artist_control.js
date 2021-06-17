function ArtistControl(){
	var self = this;
	this._artist_name = null;
	this._artist_uid = null;
	this._music_list = [];
	this._api_key = 'AIzaSyAavEwSLYg0zl1fxk_5uAZdx3_4tzbmSyQ';
	this._youtube_video_list = [];
	this._video_id_to_add = null;
	this._is_my_like_artist = false;

	this.Init = function(artist_name, artist_uid){
		self._artist_name = artist_name;
		self._artist_uid = artist_uid;
		$('#id_label_artist-ARTIST_EJS').html(artist_name);
		self.InitHandle();
		self.GetArtistInfo();
		self.GetArtistLike();
		self.GetMusicList();
		
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_artist_listen_all').on('click', self.ListenAll);
		$('#id_btn_artist_youtube_search').on('click', self.OnSearchClick);
		$('#id_btn_artist_add_music').on('click', self.OnAddMusicClick);
		$('#id_btn_artist_like').on('click', self.OnClick_id_btn_artist_like);
	};

	////////////////////////////////////////////////////////////////////////////////

	this.ClearYoutubeKeyword = function(){
		$('#id_input_artist_youtube_keyword').val('');
		$('#id_div_artist_youtube_search_list').empty();
		self._video_id_to_add = null;
	};

	this.OnAddMusicClick = function(){
		if(window._auth_control.IsLogin() == false){
			console.log('OnAddMusicClick ' );
			alert(TR(L_SIGN_IN_REQUIRED));
			return;
		}

		if(self._video_id_to_add == null){
			alert(TR(L_SEARCH_AND_CHOOSE_VIDEO_PLZ));
			return;
		}

		var title = $('#id_input_artist_youtube_keyword').val().trim();
		if(title == ''){
			alert(TR(L_INPUT_TITLE_PLZ));
			return;
		}

		var req_data = {
			artist_uid: self._artist_uid,
			title:     title,
			video_id:  self._video_id_to_add
		};

		$.ajax({
			url: '/cherry_api/add_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					alert(TR(L_SUCCESS));
					self.GetMusicList();
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

	this.OnSearchClick = function(){
		self._video_id_to_add = null;
		self._youtube_video_list = [];
		var keyword = $('#id_input_artist_youtube_keyword').val();
		// console.log('keyword ' + keyword);
		if(keyword == ''){
			return;
		}
		keyword = encodeURI(self._artist_name + ' + ' + keyword);
		var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${keyword}&type=video&key=${self._api_key}`;

		$.ajax({
			url: url,
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				for(var i=0 ; i<res.items.length ; i++){
					var item = res.items[i];
					var video = {
						video_id: item.id.videoId,
						title:    item.snippet.title,
						img_src:  `https://img.youtube.com/vi/${item.id.videoId}/0.jpg`,
						channel:  item.snippet.channelTitle,
						duration: ''
					};
					self._youtube_video_list.push(video);
				}
				self.DisplayYoutubeSearchResult();
				self.FetchYoutubeVideosInfo();
			}
		});	
	};

	this.OnChooseVideoToAdd = function(idx){
		self.TryListen(idx);
		self._video_id_to_add = self._youtube_video_list[idx].video_id;
		for(var i=0 ; i<self._youtube_video_list.length ; i++){
			if(self._video_id_to_add == self._youtube_video_list[i].video_id){
				$('#id_youtube_video_row-'+self._youtube_video_list[i].video_id).css('background-color', 'orange');
			}else{
				$('#id_youtube_video_row-'+self._youtube_video_list[i].video_id).css('background-color', 'white');
			}
		}
	};

	this.OnClick_id_btn_artist_like = function(){
		if(window._auth_control.IsLogin() == false){
			alert(TR((L_SIGN_IN_REQUIRED)));
			return;
		}

		self._is_my_like_artist = !self._is_my_like_artist;

		var req_data = {
			artist_uid: self._artist_uid,
			is_my_like_artist: self._is_my_like_artist
		};

		$.ajax({
			url: '/cherry_api/update_artist_like',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DISP_UpdateLike();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	////////////////////////////////////////////////////////////////////////////////////

	this.GetArtistInfo = function(){
		var req = {
			artist_uid: self._artist_uid
		};
		POST('/cherry_api/get_artist_info', req, res=>{
			if(res.ok){
				$('#id_label_artist-ARTIST_EJS').html(res.artist_info.name);
				window._router.UpdateMeta_Artist(res.artist_info.name);
			}else{
				alert(res.err);
			}
		});
	};

	this.GetArtistLike = function(){
		if(window._auth_control.IsLogin() == false){
			return;
		}

		var req_data = {
			artist_uid: self._artist_uid
		};

		$.ajax({
			url: '/cherry_api/is_my_like_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._is_my_like_artist = res.is_like_artist;
					self.DISP_UpdateLike();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.TryListen = function(idx){
		var input_title = $('#id_input_artist_youtube_keyword').val();
		var music = {
			artist:   self._artist_name,
			title:    input_title,
			video_id: self._youtube_video_list[idx].video_id
		};
		window._cherry_player.TryMusic(music);
	};

	this.GetMusicList = function(){
		console.log('self._artist_name ' + self._artist_name);
		var req_data = {
			artist_uid: self._artist_uid
		};

		$.ajax({
			url: '/cherry_api/fetch_music_list_by_artist_uid',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list = res.music_list;
					console.log('self._music_list ' + self._music_list.length);
					self.GetMusicListVA();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.GetMusicListVA = function(){
		var req_data = {
			artist_uid: self._artist_uid
		};

		$.ajax({
			url: '/cherry_api/fetch_VA_music_list_by_artist_uid',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					var list = res.music_list;
					console.log('list ' + list.length);

					for(var i=0 ; i<list.length ; i++){
						self._music_list.push(list[i]);
					}

					self.DisplayMusicList();
				}else{
					alert(res.err);
				}
			}
		});			
	};

	this.AddMusic = function(idx){
		var music = self._music_list[idx];
		if(music != null){
			window._cherry_player.AddMusic(music);
		}
	};

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.ConvertTimeformat = function(pt){
		console.log('pt ' + pt);
		var tmp = pt.replace('PT', '');
		var h = 0;
		var m = 0;
		var s = 0;
		if(tmp.includes('H')){
			h = tmp.split('H')[0];
			tmp = tmp.substr(tmp.indexOf('H')+1);
		}
		if(tmp.includes('M')){
			m = tmp.split('M')[0];
			tmp = tmp.substr(tmp.indexOf('M')+1);
		}
		if(tmp.includes('S')){
			s = tmp.split('S')[0];
		}

		var h_str = h >= 10 ? h : '0'+h;
		var m_str = m >= 10 ? m : '0'+m;
		var s_str = s >= 10 ? s : '0'+s;

		var str = '';
		if(h > 0){
			str = h_str + ':' + m_str + ':' + s_str;
		}else{
			str = m_str + ':' + s_str;
		}
		return str;
	};

	this.FetchYoutubeVideosInfo = function(){
		var video_id_arr = [];
		for(var i=0 ; i<self._youtube_video_list.length ; i++){
			var video = self._youtube_video_list[i];
			if(i == 0){
				// console.log(' ' + JSON.stringify(item, null, '\t'));
			}
			video_id_arr.push(video.video_id);
		}
		var video_id_list_str = video_id_arr.join(',');
		// console.log('video_id_list_str ' + video_id_list_str);
		var url = `https://www.googleapis.com/youtube/v3/videos?id=${video_id_list_str}&part=snippet,contentDetails&fields=items(etag,id,snippet(publishedAt,title,thumbnails(default(url)),tags),contentDetails(duration))&key=${self._api_key}`;
		$.ajax({
			url: url,
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				// console.log('res len ' + JSON.stringify(res, null, '\t'));
				for(var i=0 ; i<res.items.length ; i++){
					var item = res.items[i];
					if(i==0){
						// console.log(' ' + JSON.stringify(res.items[i], null, '\t'));
					}

					for(var v=0 ; v<self._youtube_video_list.length ; v++){
						if(self._youtube_video_list[v].video_id == item.id){
							var dur = self.ConvertTimeformat(item.contentDetails.duration);
							self._youtube_video_list[v].duration = dur;
							$('#id_video_duration-'+item.id).html(dur);
							continue;
						}
					}
				}
			}
		});	
	};

	this.LikeMusic = function(idx){
		var user_id = window._auth_control.GetUserID();
		if(user_id == null || user_id == ''){
			alert('Sign in required');
			return;
		}

		var m = self._music_list[idx];
		var is_like = m.is_like == 'Y' ? false : true;
		m.is_like = m.is_like == 'Y' ? 'N' : 'Y';
		CMN_LikeMusic(m.music_uid, is_like);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////

	this.DisplayMusicList = function(){
		var h = '';

		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			if(m.is_diff_name == 'Y'){
				continue;
			}
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var fn_listen = `window._artist_control.AddMusic(${i})`;
			var on_click_heart = `window._artist_control.LikeMusic(${i})`;
			var on_click_title = `window._router.Go('/${window._country_code}/music.go?mid=${m.music_uid}')`
			var id_heart_icon = `id_icon_music_heart-${m.music_uid}`;
			var like_color = '#bbbbbb';
			if(m.is_like == 'Y'){
				like_color = 'red';
			}

			var artist_list = [];
			{
				if(m.is_various == 'Y'){
					console.log('m.member_list_json ' + m.member_list_json);
					var member_list = JSON.parse(m.member_list_json);
					for(var j=0 ; j<member_list.length ; j++){
						var name = member_list[j].name;
						var artist_uid = member_list[j].artist_uid;
						artist_list.push({
							name: name,
							onclick: `window._router.Go('/${window._country_code}/artist.go?aid=${artist_uid}')`
						});
					}
				}else{
					artist_list.push({
						name: m.artist,
						onclick: `window._router.Go('/${window._country_code}/artist.go?aid=${m.artist_uid}')`
					});
				}
			}
			h += `
				<div class="row border" style="margin-bottom:5px;">
					<div class="d-flex" style="width:calc( 100% - 75px);">
						<image style="height: 50px; width: 50px;" src="${img_src}">
						<div class="pl-1">
							<div class="text-dark">
								<span class="pointer border-bottom" onClick="${on_click_title}">${m.title}</span>
							</div>
							<div class="text-secondary" style="font-size:0.8em">
			`;

			for(var k=0 ; k<artist_list.length ; k++){
				h += `
								<span class="border-bottom" style="margin-right: 5px" onClick="${artist_list[k].onclick}">${artist_list[k].name}</span>
				`;
			}

			h += `
							</div>
						</div>
					</div>
					<div class="text-right d-flex " style="padding-top:5px;">
						<div>
							<span class="badge" style="width:33px; height:33px; padding-top:10px;" onclick="${on_click_heart}">
								<i id="${id_heart_icon}" class="fas fa-heart" style="color: ${like_color}"></i>
							</span>
							<div class="text-center" style="font-size:0.5em"></div>
						</div>
						<div>
							<span class="badge" style="width:33px; height:33px; padding-top:10px;" onclick="${fn_listen}">
								<i class="fas fa-plus"></i>
							</span>
						</div>
					</div>
				</div>
			`;
		}

		$('#id_div_artist_music_list').html(h);
	};

	this.DisplayYoutubeSearchResult = function(){
		$('#id_div_artist_youtube_search_list').empty();

		var h = '';

		for(var i=0 ; i<self._youtube_video_list.length ; i++){
			var video = self._youtube_video_list[i];

			var video_id = video.video_id;
			var title = video.title;
			var channel = video.channel;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;
			var id_video_duration_str = `id_video_duration-${video_id}`;
			var id_youtube_video_row_str = `id_youtube_video_row-${video_id}`;
			var on_click_action = `window._artist_control.OnChooseVideoToAdd('${i}')`;

			h += `
				<div class="row" style="margin-top:10px; border-bottom: 1px solid #eeeeee; cursor:pointer" id="${id_youtube_video_row_str}" onClick="${on_click_action}">
					<div class="col-12 d-flex">
						<div>
							<div>
								<image style="height: 50px; width: 50px;" src="${img_src}">
							</div>
							<div class="text-right" style="font-size:0.8em" id="${id_video_duration_str}">00:00:00</div>
						</div>
						<div class="pl-1">
							<div class="text-dark">${title}</div>
							<div class="text-secondary" style="font-size: 0.8em">${channel}</div>
						</div>
					</div>
				</div>
			`;
		}

		$('#id_div_artist_youtube_search_list').html(h);
	};

	this.DISP_UpdateLike = function(){
		if(self._is_my_like_artist){
			$('#id_icon_artist_like').css('color', 'red');
		}else{
			$('#id_icon_artist_like').css('color', '#bbbbbb');
		}
	};
}