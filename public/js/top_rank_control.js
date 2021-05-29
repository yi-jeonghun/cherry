function TopRankControl(source){
	var self = this;
	this._music_list = [];
	this._source = source;

	this.Init = function(){
		self.InitSource();
		self.GetMusicList();
		self.InitComponentHanele();
		return self;
	};

	this.InitComponentHanele = function(){
		$('#id_btn_top_rank_listen_all').on('click', self.ListenAll);
	};

	this.InitSource = function(){
		var source_list = window._top_100_source.list[window._country_code];
		if(self._source === undefined || self._source == null || self._source == ''){
			console.log('no source ');
			self._source = source_list[0].source;
		}

		var source_name = '';
		for(var s=0 ; s<source_list.length ; s++){
			if(self._source == source_list[s].source){
				source_name = source_list[s].name;
			}
		}
		$('#id_label_top_rank_source').html(source_name);
	};

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.GetMusicList = function(){
		var req_data = {
			country_code: window._country_code,
			source: self._source
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
				<div class="row ">
					<div class="" style="font-size:0.6em; width:50px; padding-left:5px">${num}</div>
				</div>
				<div class="row border" style="margin-bottom:2px; padding-right:0px">
					<div class="d-flex " style="width:calc( 100% - 75px); padding-left:0px">
						<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/${m.video_id}/0.jpg">
						<div class="pl-1" style="">
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
					<div class="text-right d-flex " style="padding-top:5px; padding-right:0px; margin-right:0px">
						<div>
							<span class="badge " style="width:33px; height:33px; padding-top:10px; margin:0px " onclick="Top_Rank_ListenMusic(${i})">
								<i class="fas fa-heart"></i>
							</span>
							<div class="text-center" style="font-size:0.5em"></div>
						</div>
						<div>
							<span class="badge " style="width:33px; height:33px; padding-top:10px; margin:0px" onclick="Top_Rank_ListenMusic(${i})">
								<i class="fas fa-plus"></i>
							</span>
						</div>
					</div>
				</div>
			`;
		}

		$('#id_div_top_rank_music_list').html(h);
	};
}