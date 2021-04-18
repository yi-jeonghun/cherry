function TopRankControl(country_code){
	var self = this;
	this._country_code = country_code;
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
			country_code: self._country_code
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

			h += `
			<div class="row my-2 border">
				<div class="col-1">${num}</div>
				<div class="col-9 col-sm-10 d-flex">
					<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/${m.video_id}/0.jpg">
					<div class="pl-1">
						<div class="text-dark">${m.title}</div>
						<div class="text-secondary" style="font-size:0.8em">${m.artist}</div>
					</div>
				</div>
				<div class="col-1">
					<button class="btn" type="button" onclick="Top_Rank_ListenMusic(${i})">
						<i class="fas fa-play"></i>
					</button>
				</div>
			</div>
			`;
		}

		$('#id_div_top_rank_music_list').html(h);
	};
}