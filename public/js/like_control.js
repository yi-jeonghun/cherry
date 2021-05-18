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
	};

	/////////////////////////////////////////////////////////////////////////////

	this.OnTabChange = function(like_type){
		self._like_type = like_type;

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
					console.log('res.artist_list len ' + res.artist_list.length);
					self._playlist_list = res.playlist_list;
					self.DISP_Result();
				}else{
					alert(res.err);
				}
			}
		});
	};

	////////////////////////////////////////////////////////////////////

	this.DISP_ArtistResult = function(){
		var h = ``;

		for (let i = 0; i < self._artist_list.length; i++) {
			var artist = self._artist_list[i];
			var encode_name = encodeURI(artist.name);
			var onclick = `window._router.Go('/${window._country_code}/artist.go?a=${encode_name}')`;
			h += `
				<div class="row" style="padding-top:5px; border-bottom:1px solid #eeeeee">
					<div onclick="${onclick}" class="col-12">${artist.name}</div>
				</div>
			`;
		}
		$('#id_div_like_result_artist').html(h);
	};

	this.DISP_MusicResult = function(){
		var h = '';

		for (let i = 0; i < self._music_list.length; i++) {
			var m = self._music_list[i];
			var add_music = `window._search_control.AddMusic(${i})`;
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
						<button class="btn" type="button" onclick="${add_music}">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
			`;
		}

		$('#id_div_like_result_music').html(h);
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
			var on_click_title = `window._router.Go('/${window._country_code}/open_playlist_detail.go?pn=${title_encoded}&pid=${p.playlist_uid}')`;

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

	this.DISP_Result = function(){
		self.DISP_ArtistResult();
		// self.DISP_MusicResult();
		self.DISP_PlaylistResult();
	};

}