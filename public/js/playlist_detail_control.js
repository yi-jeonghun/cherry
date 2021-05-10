function PlaylistDetailControl(playlist_name, playlist_id){
	var self = this;
	this._playlist_name = decodeURI(playlist_name);
	this._playlist_id = playlist_id;
	this._playlist_info = null;
	this._music_list = [];

	this.Init = function(){
		self.InitHandle();
		self.LoadPlaylistDetail();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_playlist_detail_listen_all').on('click', self.ListenAll);
	};

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.LoadPlaylistDetail = function(){
		console.log('playlist_id ' + self._playlist_id);
		var req_data = {
			playlist_id: self._playlist_id
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
					self.DISP_playlist_info();
					self.DISP_music_list();
				}else{
					alert(res.err);
				}
			}
		});
	};

	///////////////////////////////////////////////////////////////////

	this.DISP_playlist_info = function(){
		$('#id_label_playlist_title').html(self._playlist_name);
	};

	this.DISP_music_list = function(){
		var h = '';

		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var fn_listen = `window._artist_control.AddMusic(${i})`;
			var artist_list = [];
			{
				var artist_arr = m.artist.split(',');
				for(var j=0 ; j<artist_arr.length ; j++){
					var name = artist_arr[j].trim();
					var name_encoded = encodeURI(artist_arr[j].trim());
					artist_list.push({
						name: name,
						onclick: `window._router.Go('/${window._country_code}/artist.go?a=${name_encoded}')`
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
						<button class="btn" type="button" onclick="${fn_listen}">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
				<div style="font-size:0.6em; text-align:right">
						${m.user_name}
				</div>
			`;
		}

		$('#id_div_playlist_music_list').html(h);
	};
}