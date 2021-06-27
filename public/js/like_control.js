$('document').ready(function(){
	window._like_control = new LikeControl().Init();
});

var LIKE_TYPE = {
	ARTIST:1,
	MUSIC:2,
	PLAYLIST:3
};

function LikeControl(){
	var self = this;
	this._like_type = LIKE_TYPE.ARTIST;
	this._artist_list = [];
	this._music_list = [];
	this._playlist_list = [];

	this.Init = function(){
		self.InitComponentHandle();
		self.LoadInit();
		return self;
	};

	this.InitComponentHandle = function(){
		$('#id_like_tab_artist').on('click', self.OnTabChange);
		$('#id_like_tab_playlist').on('click', self.OnTabChange);
		$('#id_like_tab_music').on('click', self.OnTabChange);
	};

	/////////////////////////////////////////////////////////////////////////////

	this.OnTabChange = function(){
		console.log(this.id);
		switch(this.id){
			case 'id_like_tab_artist':
				self._like_type = LIKE_TYPE.ARTIST;
				break;
			case 'id_like_tab_playlist':
				self._like_type = LIKE_TYPE.PLAYLIST;
				break;
			case 'id_like_tab_music':
				self._like_type = LIKE_TYPE.MUSIC;
				break;
		}

		$('#id_like_tab_artist').removeClass('active');
		$('#id_like_tab_music').removeClass('active');
		$('#id_like_tab_playlist').removeClass('active');

		$('#id_div_like_result_artist').css('display', 'none');
		$('#id_div_like_result_music').css('display', 'none');
		$('#id_div_like_result_playlist').css('display', 'none');

		switch(self._like_type){
			case LIKE_TYPE.ARTIST:
				$('#id_like_tab_artist').addClass('active');
				$('#id_div_like_result_artist').css('display', '');
				break;
			case LIKE_TYPE.PLAYLIST:
				$('#id_like_tab_playlist').addClass('active');
				$('#id_div_like_result_playlist').css('display', '');
				break;
			case LIKE_TYPE.MUSIC:
				$('#id_like_tab_music').addClass('active');
				$('#id_div_like_result_music').css('display', '');
				break;
			}
	};

	/////////////////////////////////////////////////////////////////////////////

	this.LoadInit = function(){
		var req_data = {
		};

		$.ajax({
			url: '/cherry_api/get_like_artist_playlist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._artist_list = res.artist_list;
					self._playlist_list = res.playlist_list;
					self._music_list = res.music_list;
					self.DISP_Result();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.ListenMusic = function(idx){
		var music = self._music_list[idx];
		if(music != null){
			window._cherry_player.AddMusic(music);
		}
	}

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
	
	////////////////////////////////////////////////////////////////////

	this.DISP_ArtistResult = function(){
		var h = ``;

		for (let i = 0; i < self._artist_list.length; i++) {
			var artist = self._artist_list[i];
			var onclick = `window._router.Go('/${window._country_code}/artist.go?aid=${artist.artist_uid}')`;
			h += `
				<div class="row" style="padding-top:5px; border-bottom:1px solid #eeeeee">
					<div onclick="${onclick}" class="col-12">${artist.name}</div>
				</div>
			`;
		}
		$('#id_div_like_result_artist').html(h);
	};

	this.DISP_PlaylistResult = function(){
		console.log('self._playlist_list ' + self._playlist_list.length);
		var h = `
			<table class="table table-sm table-striped" style="margin: 0px">
			<tr>
			<th>Title</th>
			<th>Like</th>
			</tr>
		`;

		for(var i=0 ; i<self._playlist_list.length ; i++){
			var p = self._playlist_list[i];
			var title_encoded = encodeURI(p.title);
			var on_click_title = `window._router.Go('/${window._country_code}/open_playlist_detail.go?pid=${p.playlist_uid}')`;

			h += `
			<tr>
				<td onClick="${on_click_title}">${p.title}</td>
				<td onClick="${on_click_title}">${p.like_count}</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_like_result_playlist').html(h);
	};

	this.DISP_MusicListResult = function(){
		var h = ``;

		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
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

			var on_click_plus = `window._like_control.ListenMusic(${i})`;
			var on_click_heart = `window._like_control.LikeMusic(${i})`;
			var on_click_title = `window._router.Go('/${window._country_code}/music.go?mid=${m.music_uid}')`
			var id_heart_icon = `id_icon_music_heart-${m.music_uid}`;
			var like_color = '#bbbbbb';
			if(m.is_like == 'Y'){
				like_color = 'red';
			}

			h += `
				<div class="row border" style="margin-bottom:2px;">
					<div class="d-flex " style="width:calc( 100% - 75px);">
						<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/${m.video_id}/0.jpg">
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
							<span class="badge" style="width:33px; height:33px; padding-top:10px;" onclick="${on_click_plus}">
								<i class="fas fa-plus"></i>
							</span>
						</div>
					</div>
				</div>
			`;
		}

		$('#id_div_like_result_music').html(h);
	};

	this.DISP_Result = function(){
		self.DISP_ArtistResult();
		self.DISP_PlaylistResult();
		self.DISP_MusicListResult();
	};

}