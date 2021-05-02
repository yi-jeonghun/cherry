$('document').ready(function(){
	window._search_control = new SearchControl().Init();
});

function SearchControl(){
	var self = this;
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

	this.Clear = function(){
		$('#id_input_search_keyword').val('');
		$('#id_div_search_result').empty();
	};

	this.OnChangeKeyword = function(){
		var keyword = $('#id_input_search_keyword').val();
		console.log('keyword ' + keyword);
		self.Search(keyword);
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
					self.DisplaySearchResult();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplaySearchResult = function(){
		$('#id_div_search_result').empty();

		h = '';

		if(self._artist_list.length > 0){
			h += `
				<div class="row">
					<div class="col-12 small text-right" style="border-bottom:1px solid #aaaaaa; margin-top:5px">Artist</div>
				</div>
			`;

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
		}

		if(self._music_list.length > 0){
			h += `
				<div class="row">
					<div class="col-12 small text-right" style="border-bottom:1px solid #aaaaaa; margin-top:5px">Music</div>
				</div>
			`;

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
		}

		$('#id_div_search_result').html(h);
	};

	this.AddMusic = function(idx){
		window._cherry_player.AddMusic(self._music_list[idx]);
	};
}