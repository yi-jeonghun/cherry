function OpenPlaylistDetailControl(playlist_name, playlist_uid){
	var self = this;
	this._playlist_name = decodeURI(playlist_name);
	this._playlist_uid = playlist_uid;
	this._playlist_info = null;
	this._music_list = [];
	this._hash_list = [];
	this._is_my_like_playlist = false;

	this.Init = function(){
		self.InitHandle();
		self.LoadPlaylistDetail();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_open_playlist_detail_listen_all').on('click', self.ListenAll);
		$('#id_btn_playlist_detail_like').on('click', self.OnClick_id_btn_playlist_detail_like);
		$('#id_btn_open_playlist_detail_export').on('click', self.OnClick_id_btn_open_playlist_detail_export);
	};

	//////////////////////////////////////////////////////////////////////////////

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.AddMusic = function(idx){
		window._cherry_player.AddMusic(self._music_list[idx]);
	};

	this.OnClick_id_btn_playlist_detail_like = function(){
		if(window._auth_control.IsLogin() == false){
			alert(TR((L_SIGN_IN_REQUIRED)));
			return;
		}

		self._is_my_like_playlist = !self._is_my_like_playlist;
		console.log('self._is_my_like_playlist ' + self._is_my_like_playlist);

		var req_data = {
			playlist_uid: self._playlist_uid,
			is_my_like_playlist: self._is_my_like_playlist
		};

		$.ajax({
			url: '/cherry_api/update_playlist_like',
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

	this.OnClick_id_btn_open_playlist_detail_export = function(){
		var embed = `
		<iframe src="http://cherrymusic.io/playlist_embed.go?pid=${self._playlist_uid}" width="400" height="600"></iframe>
		`;
		$('#id_div_open_playlist_embed').val(embed.trim());
		$('#id_modal_open_playlis_detail_export').modal('show');
	};

	//////////////////////////////////////////////////////////////////////////////

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
					self._is_my_like_playlist = res.is_my_like_playlist;
					console.log('res.is_my_like_playlist ' + res.is_my_like_playlist);
					self.DISP_UpdateLike();
					self.DISP_playlist_info();
					self.DISP_music_list();
					self.DISP_HashList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	///////////////////////////////////////////////////////////////////

	this.DISP_playlist_info = function(){
		$('#id_label_open_playlist_title').html(self._playlist_name);
		$('#id_label_open_playlist_user_name').html(self._playlist_info.user_name);
		$('#id_label_open_playlist_comment').html(self._playlist_info.comment);
	};

	this.DISP_music_list = function(){
		var h = '';

		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var on_click_listen = `window._open_playlist_detail_control.AddMusic(${i})`;

			var artist_list = [];
			{
				if(m.is_various == 'Y'){
					var member_list = JSON.parse(m.member_list_json);
					for(var j=0 ; j<member_list.length ; j++){
						var name = member_list[j].name;
						var name_encoded = encodeURI(name);
						var artist_uid = member_list[j].artist_uid;
						artist_list.push({
							name: name,
							onclick: `window._router.Go('/${window._country_code}/artist.go?a=${name_encoded}&aid=${artist_uid}')`
						});
					}
				}else{
					var name_encoded = encodeURI(m.artist);
					artist_list.push({
						name: m.artist,
						onclick: `window._router.Go('/${window._country_code}/artist.go?a=${name_encoded}&aid=${m.artist_uid}')`
					});
				}
			}
			h += `
				<div class="row border">
					<div class="col-10 col-sm-11 d-flex" style="padding-left:0px">
						<image style="height: 50px; width: 50px;" src="${img_src}">
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
					<div class="col-2 col-sm-1" style="padding-top:10px">
						<button class="btn" type="button" onclick="${on_click_listen}">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
				<div style="font-size:0.6em; text-align:right; color:white">
						${m.user_name}
				</div>
			`;
		}

		$('#id_div_open_playlist_music_list').html(h);
	};

	this.DISP_UpdateLike = function(){
		if(self._is_my_like_playlist){
			$('#id_icon_playlist_detail_like').css('color', 'red');
		}else{
			$('#id_icon_playlist_detail_like').css('color', '#bbbbbb');
		}
	};

	this.DISP_HashList = function(){
		var h = ``;
		for(var i=0 ; i<self._hash_list.length ; i++){
			var hash = self._hash_list[i].hash;
			h += `<span class="px-1 py-1">#${hash}</span>`;
		}
		$('#id_label_open_playlist_hash_list').html(h);
	};
}