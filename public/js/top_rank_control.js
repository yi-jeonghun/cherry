function TopRankControl(){
	var self = this;
	this._music_list = [];

	this.Init = function(){
		self.GetMusicList();
		self.InitComponentHanele();
		return self;
	};

	this.InitComponentHanele = function(){
		$('#id_btn_top_rank_listen_all').on('click', self.ListenAll);
	};

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.GetMusicList = function(){
		var req_data = {
			country_code: window._country_code
		};

		$.ajax({
			url: '/cherry_api/top_rank/fetch_release_data',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list = res.music_list;
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
			var num = (i*1) + 1;
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
					<div class="col-1 text-center" style="font-size:0.8em; padding-left:2px; padding-top:10px">${num}</div>
					<div class="col-9 col-sm-10 d-flex" style="padding-left:0px">
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
					<div class="col-1" style="padding-top:10px">
						<button class="btn" type="button" onclick="Top_Rank_ListenMusic(${i})">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
				<div style="font-size:0.6em; text-align:right; color:white">
						${m.user_name}
				</div>
			`;
		}

		$('#id_div_top_rank_music_list').html(h);
	};
}