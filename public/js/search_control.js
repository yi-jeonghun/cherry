$('document').ready(function(){
	window._search_control = new SearchControl().Init();
});

var SEARCH_TYPE = {
	ARTIST:1,
	MUSIC:2,
	PLAYLIST:3
};

function SearchControl(){
	var self = this;
	this._search_type = SEARCH_TYPE.ARTIST;
	this._artist_list = [];
	this._music_list = [];
	this._playlist_list = [];

	this.Init = function(){
		console.log('SearchControl init ' );
		self.InitComponentHandle();
		return self;
	};

	this.InitComponentHandle = function(){
		$('#id_input_search_keyword').keyup(self.OnChangeKeyword);
	};

	/////////////////////////////////////////////////////////////////////////////

	this.OnChangeKeyword = function(){
		var keyword = $('#id_input_search_keyword').val();
		console.log('keyword ' + keyword);
		self.Search(keyword);
	};

	this.OnTabChange = function(search_type){
		self._search_type = search_type;

		$('#id_search_tab_artist').removeClass('active');
		$('#id_search_tab_music').removeClass('active');
		$('#id_search_tab_playlist').removeClass('active');

		$('#id_div_search_result_artist').css('display', 'none');
		$('#id_div_search_result_music').css('display', 'none');
		$('#id_div_search_result_playlist').css('display', 'none');

		switch(self._search_type){
			case SEARCH_TYPE.ARTIST:
				$('#id_search_tab_artist').addClass('active');
				$('#id_div_search_result_artist').css('display', '');
				break;
			case SEARCH_TYPE.MUSIC:
				$('#id_search_tab_music').addClass('active');
				$('#id_div_search_result_music').css('display', '');
				break;
			case SEARCH_TYPE.PLAYLIST:
				$('#id_search_tab_playlist').addClass('active');
				$('#id_div_search_result_playlist').css('display', '');
				break;
			}
	};

	/////////////////////////////////////////////////////////////////////////////

	this.Clear = function(){
		$('#id_input_search_keyword').val('');
		$('#id_div_search_result_artist').empty();
		$('#id_div_search_result_music').empty();
		$('#id_div_search_result_playlist').empty();
	};

	this.Search = function(keyword){
		keyword = keyword.trim();
		if(keyword == ''){
			return;
		}

		self._artist_list = [];
		self._music_list = [];
		self._playlist_list = [];

		var req_data = {
			keyword: keyword,
			country_code: window._country_code
		};

		$.ajax({
			url: '/cherry_api/search_artist_music_like',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._artist_list = res.artist_list;
					self._music_list = res.music_list;
					self._playlist_list = res.playlist_list;
					self._playlist_hash_search_list = res.playlist_hash_search_list;
					self.DISP_SearchResult();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.AddMusic = function(idx){
		window._cherry_player.AddMusic(self._music_list[idx]);
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


	////////////////////////////////////////////////////////////////////

	this.DISP_ArtistResult = function(){
		var h = ``;

		for (let i = 0; i < self._artist_list.length; i++) {
			var artist = self._artist_list[i];
			var artist_uid = artist.artist_uid;
			if(artist.is_diff_name == 'Y'){
				artist_uid = artist.org_artist_uid;
			}
			var onclick = `window._router.Go('/${window._country_code}/artist.go?aid=${artist_uid}')`;
			h += `
				<div class="row" style="padding-top:5px; border-bottom:1px solid #eeeeee">
					<div onclick="${onclick}" class="col-12">${artist.name}</div>
				</div>
			`;
		}
		$('#id_div_search_result_artist').html(h);
	};

	this.DISP_MusicResult = function(){
		var h = '';

		for (let i = 0; i < self._music_list.length; i++) {
			var m = self._music_list[i];
			var add_music = `window._search_control.AddMusic(${i})`;
			var on_click_heart = `window._search_control.LikeMusic(${i})`;
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
							<span class="badge" style="width:33px; height:33px; padding-top:10px;" onclick="${add_music}">
								<i class="fas fa-plus"></i>
							</span>
						</div>
					</div>
				</div>
			`;
		}

		$('#id_div_search_result_music').html(h);
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
			var on_click_title = `window._router.Go('/${window._country_code}/open_playlist_detail.go?pid=${p.playlist_uid}')`;

			h += `
			<tr>
				<td onClick="${on_click_title}">${p.title}</td>
				<td onClick="${on_click_title}">${p.like_count}</td>
			</tr>
			`;
		}

		// h += `<tr><td colspan="2" class="text-center color-primary">Hash Search</td></tr>`;

		for(var i=0 ; i<self._playlist_hash_search_list.length ; i++){
			var p = self._playlist_hash_search_list[i];
			var on_click_title = `window._router.Go('/${window._country_code}/open_playlist_detail.go?pid=${p.playlist_uid}')`;

			h += `
			<tr>
				<td onClick="${on_click_title}">${p.title}</td>
				<td onClick="${on_click_title}">${p.like_count}</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_search_result_playlist').html(h);
	};

	this.DISP_SearchResult = function(){
		self.DISP_ArtistResult();
		self.DISP_MusicResult();
		self.DISP_PlaylistResult();
	};

}