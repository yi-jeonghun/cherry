function MyPlaylistDetailControl(playlist_uid){
	var self = this;
	this._playlist_uid = playlist_uid;
	this._playlist_info = null;
	this._music_list = [];
	this._is_edit_mode = false;
	this._searched_artist_list = [];
	this._searched_music_list = [];
	this._music_uid_list_to_add = [];
	this._hash_list = [];

	this.Init = function(){
		self.InitHandle();
		self.LoadPlaylistDetail();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_playlist_detail_listen_all').on('click', self.ListenAll);
		$('#id_btn_my_playlist_detail_edit_mode_toggle').on('click', self.OnClick_id_btn_my_playlist_detail_edit_mode_toggle);
		$('#id_btn_my_playlist_detail_add_music').on('click', self.OnClick_id_btn_my_playlist_detail_add_music);
		$('#id_btn_my_playlist_detail_close_add').on('click', self.OnClick_id_btn_my_playlist_detail_close_add);
		$('#id_input_my_playlist_detail_search_keyword').keyup(self.OnChangeKeyword);
		$('#id_btn_my_playlist_detail_add_music_complete').on('click', self.OnClick_id_btn_my_playlist_detail_add_music_complete);
		$('#id_btn_my_playlist_detail_export').on('click', self.OnClick_id_btn_my_playlist_detail_export);
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////

	this.OnClick_id_btn_my_playlist_detail_add_music_complete = function(){
		var req_data = {
			playlist_uid: self._playlist_uid,
			music_uid_list: self._music_uid_list_to_add,
			begin_order: self._music_list.length+1
		};

		$.ajax({
			url: '/cherry_api/add_music_list_to_playlist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._searched_artist_list = [];
					self._searched_music_list = [];
					$('#id_div_my_playlist_detail_search_result').empty();
					self.OnClick_id_btn_my_playlist_detail_close_add();
					self.LoadPlaylistDetail();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.OnChangeKeyword = function(){
		var keyword = $('#id_input_my_playlist_detail_search_keyword').val();
		self.Search(keyword);
	};

	this.Search = function(keyword){
		keyword = keyword.trim();
		if(keyword == ''){
			return;
		}

		self._searched_artist_list = [];
		self._searched_music_list = [];

		var req_data = {
			keyword: keyword
		};

		$.ajax({
			url: '/cherry_api/search_artist_and_music_like',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._searched_artist_list = res.artist_list;
					self._searched_music_list = res.music_list;
					self.DisplaySearchResult();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.OnClick_id_btn_my_playlist_detail_add_music = function(){
		$('#id_div_my_playlist_detail').hide();
		$('#id_div_my_playlist_add_music').show();
	};

	this.OnClick_id_btn_my_playlist_detail_close_add = function(){
		$('#id_div_my_playlist_detail').show();
		$('#id_div_my_playlist_add_music').hide();
	};

	this.OnClick_id_btn_my_playlist_detail_edit_mode_toggle = function(){
		self._is_edit_mode = !self._is_edit_mode;
		self.DISP_music_list();	
	};

	this.OnClick_id_btn_my_playlist_detail_export = function(){
		var embed = `
		<iframe src="http://cherrymusic.io/playlist_embed.go?pid=${self._playlist_uid}" width="400" height="600"></iframe>
		`;
		$('#id_div_my_playlist_embed').val(embed.trim());
		$('#id_modal_my_playlis_detail_export').modal('show');
	};

	////////////////////////////////////////////////////////////////////////////////////////////////////

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.AddMusic = function(idx){
		window._cherry_player.AddMusic(self._music_list[idx]);
	};

	this.DeleteMusic = function(idx){
		var req_data = {
			playlist_uid: self._playlist_uid,
			music_uid: self._music_list[idx].music_uid
		};

		$.ajax({
			url: '/cherry_api/delete_music_from_playlist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.LoadPlaylistDetail();
				}else{
					alert(res.err);
				}
			}
		});		
	};

	this.LoadPlaylistDetail = function(){
		console.log('playlist_uid ' + self._playlist_uid);
		var req_data = {
			playlist_uid: self._playlist_uid
		};

		$.ajax({
			url: '/cherry_api/get_playlist_info',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list = res.music_list;
					self._playlist_info = res.playlist_info;
					self._hash_list = res.hash_list;
					self.DISP_playlist_info();
					self.DISP_music_list();
					self.DISP_HashList();

					var desc = '';
					for(var i=0 ; i<self._hash_list.length ; i++){
						desc += self._hash_list[i].hash + ', ';
					}
					window._router.UpdateMeta_MyPlaylistDetail(self._playlist_info.title, desc);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.ChooseMusicToAdd = function(idx){
		var music_uid = self._searched_music_list[idx].music_uid;
		self._music_uid_list_to_add.push(music_uid);
		// _music_list_to_add가 0보다 크면 X 버튼 대신 완료 버튼으로 바꾸기.
		// 선택된 음악의 체크박스 색을 파란색으로.
		$('#id_music_checkbox-'+idx).css('color', 'green');

		$('#id_btn_my_playlist_detail_close_add').hide();
		$('#id_btn_my_playlist_detail_add_music_complete').show();
	};

	this.GetArtistMusicList = function(artist_uid){
		console.log('artist_uid ' + artist_uid);
		var req_data = {
			artist_uid: artist_uid
		};

		$.ajax({
			url: '/cherry_api/fetch_music_list_by_artist_uid',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					console.log('res.music_list ' + res.music_list.length);
					self._searched_artist_list = [];
					self._searched_music_list = res.music_list;
					self.DisplaySearchResult();
				}else{
					alert(res.err);
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

	///////////////////////////////////////////////////////////////////

	this.DISP_playlist_info = function(){
		$('#id_label_playlist_title').html(self._playlist_info.title);
		$('#id_label_my_playlist_comment').html(self._playlist_info.comment);
	};

	this.DISP_music_list = function(){
		var h = '';

		var btn_listen_disp = '';
		var btn_trash_disp = '';
		if(self._is_edit_mode){
			btn_listen_disp = 'display:none';
			btn_trash_disp = '';
		}else{
			btn_listen_disp = '';
			btn_trash_disp = 'display:none';
		}

		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var on_click_listen = `window._my_playlist_detail_control.AddMusic(${i})`;
			var on_click_delete = `window._my_playlist_detail_control.DeleteMusic(${i})`;
			var on_click_heart = `window._my_playlist_detail_control.LikeMusic(${i})`;
			var on_click_title = `window._router.Go('/${window._country_code}/music.go?mid=${m.music_uid}')`
			var id_heart_icon = `id_icon_music_heart-${m.music_uid}`;
			var like_color = '#bbbbbb';
			if(m.is_like == 'Y'){
				like_color = 'red';
			}

			var artist_list = [];
			{
				if(m.is_various == 'Y'){
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
					var name_encoded = encodeURI(m.artist);
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
								<span class="border-bottom pointer" style="margin-right: 5px" onClick="${artist_list[k].onclick}">${artist_list[k].name}</span>
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
							<span class="badge" style="width:33px; height:33px; padding-top:10px; ${btn_listen_disp}" onclick="${on_click_listen}">
								<i class="fas fa-plus"></i>
							</span>
						</div>
						<div>
							<span class="badge" style="width:33px; height:33px; padding-top:10px; ${btn_trash_disp}" onclick="${on_click_delete}">
								<i class="fas fa-trash-alt"></i>
							</span>
						</div>
					</div>
				</div>
			`;
		}

		$('#id_div_playlist_music_list').html(h);
	};

	this.DisplaySearchResult = function(){
		$('#id_div_my_playlist_detail_search_result').empty();

		h = '';

		if(self._searched_artist_list.length > 0){
			h += `
				<div class="row">
					<div class="col-12 small text-right" style="border-bottom:1px solid #aaaaaa; margin-top:5px">Artist</div>
				</div>
			`;

			for (let i = 0; i < self._searched_artist_list.length; i++) {
				var artist = self._searched_artist_list[i];
				var onclick = `window._my_playlist_detail_control.GetArtistMusicList('${artist.artist_uid}')`;
				h += `
					<div class="row" style="padding-top:5px; border-bottom:1px solid #eeeeee">
						<div onclick="${onclick}" class="col-12">${artist.name}</div>
					</div>
				`;
			}
		}

		if(self._searched_music_list.length > 0){
			h += `
				<div class="row">
					<div class="col-12 small text-right" style="border-bottom:1px solid #aaaaaa; margin-top:5px">Music</div>
				</div>
			`;

			for (let i = 0; i < self._searched_music_list.length; i++) {
				var m = self._searched_music_list[i];
				var on_choose_music_to_add = `window._my_playlist_detail_control.ChooseMusicToAdd(${i})`;
				var id_music_checkbox = `id_music_checkbox-${i}`;

				var artist_list = [];
				{
					if(m.is_various == 'Y'){
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
						var name_encoded = encodeURI(m.artist);
						artist_list.push({
							name: m.artist,
							onclick: `window._router.Go('/${window._country_code}/artist.go?aid=${m.artist_uid}')`
						});
					}
				}
	
				h += `
					<div class="row" style="padding-top:5px; border-bottom:1px solid #eeeeee">
						<div class="col-10 col-sm-11 d-flex">
							<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/${m.video_id}/0.jpg">
							<div class="pl-1">
								<div class="text-dark">${m.title}</div>
								<div class="text-secondary" style="font-size:0.8em">
				`;

				for(var k=0 ; k<artist_list.length ; k++){
					h += `
									<span style="cursor:pointer; border-bottom:1px solid #aaaaaa; margin-right: 5px" onClick="${artist_list[k].onclick}">${artist_list[k].name}</span>
					`;
				}
					
				h += `
								</div>
							</div>
						</div>
						<div class="col-1">
							<i class="fas fa-check" style="cursor;pointer; font-size:1.5em; color:#eeeeee" OnClick="${on_choose_music_to_add}" id="${id_music_checkbox}"></i>
						</div>
					</div>
				`;
			}
		}

		$('#id_div_my_playlist_detail_search_result').html(h);
	};
	
	this.DISP_HashList = function(){
		var h = ``;
		for(var i=0 ; i<self._hash_list.length ; i++){
			var hash = self._hash_list[i].hash;
			h += `<span class="px-1 py-1">#${hash}</span>`;
		}
		$('#id_label_my_playlist_hash_list').html(h);
	};
}