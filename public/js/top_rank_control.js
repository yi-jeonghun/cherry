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

	/////////////////////////////////////////////////////////////////////////

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.GetMusicList = function(){
		var req = {
			country_code: window._country_code,
			source: self._source
		};
		POST('/cherry_api/top_rank/fetch_release_data', req, function(res){
			if(res.ok){
				self._music_list = res.music_list;

				self.DISP_MusicList();
			}else{
				alert(res.err);
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

	/////////////////////////////////////////////////////////////////////////

	this.DISP_MusicList = function(){
		console.log('disp music list ' + self._music_list.length);
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
						var artist_uid = member_list[j].artist_uid;
						artist_list.push({
							name: name,
							onclick: `window._router.Go('/${window._country_code}/artist.go?aid=${artist_uid}')`
						});
					}
				}else{
					artist_list.push({
						name: m.artist,
						onclick: `window._router.Go('/${window._country_code}/artist.go?aid=${m.artist_uid}')`
					});
				}
			}

			var on_click_plus = `window._top_rank_control.ListenMusic(${i})`;
			var on_click_heart = `window._top_rank_control.LikeMusic(${i})`;
			var on_click_title = `window._router.Go('/${window._country_code}/music.go?mid=${m.music_uid}')`
			var id_heart_icon = `id_icon_music_heart-${m.music_uid}`;
			var like_color = '#bbbbbb';
			if(m.is_like == 'Y'){
				like_color = 'red';
			}

			h += `
				<div class="row ">
					<div class="" style="font-size:0.6em; width:50px; padding-left:5px">${num}</div>
				</div>
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
								<span class="border-bottom" style="cursor:pointer; margin-right: 5px" onClick="${artist_list[k].onclick}">${artist_list[k].name}</span>
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

		$('#id_div_top_rank_music_list').html(h);
	};
}