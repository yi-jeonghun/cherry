function ArtistControl(){
	var self = this;
	this._artist = null;
	this._music_list = [];

	this.Init = function(artist){
		self._artist = artist;
		$('#id_label_artist-ARTIST_EJS').html(artist);
		self.GetMusicList();
		self.InitHandle();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_artist_listen_all').on('click', self.ListenAll);
	};

	this.GetMusicList = function(){
		console.log('self._artist ' + self._artist);
		var req_data = {
			keyword: self._artist
		};

		$.ajax({
			url: '/cherry_api/search_music_by_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list = res.music_list;
					console.log('self._music_list ' + self._music_list.length);
					self.DisplayMusicList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplayMusicList = function(){
		var h = '';

		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var fn_listen = `window._artist_control.AddMusic(${i})`;

			h += `
			<div class="row my-2 border">
				<div class="col-10 col-sm-11 d-flex">
					<image style="height: 50px; width: 50px;" src="${img_src}">
					<div class="pl-1">
						<div class="text-dark">${m.title}</div>
						<div class="text-secondary" style="font-size:0.8em">
							${m.artist}
						</div>
					</div>
				</div>
				<div class="col-2 col-sm-1">
					<button class="btn" type="button" onclick="${fn_listen}">
						<i class="fas fa-plus"></i>
					</button>
				</div>
			</div>
			`;
		}

		$('#id_div_music_list').html(h);
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
}