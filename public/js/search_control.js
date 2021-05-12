$('document').ready(function(){
	window._search_control = new SearchControl().Init();
});

const SEARCH_TYPE = {
	ARTIST:1,
	MUSIC:2,
	PLAYLIST:3
};

function SearchControl(){
	var self = this;
	this._search_type = SEARCH_TYPE.ARTIST;
	this._artist_list = [];
	this._music_list = [];

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

		var req_data = {
			keyword: keyword
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
		$('#id_div_search_result_artist').html(h);
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

		$('#id_div_search_result_music').html(h);
	};

	this.DISP_SearchResult = function(){
		self.DISP_ArtistResult();
		self.DISP_MusicResult();
	};

}