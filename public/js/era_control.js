function EraControl(era_uid){
	var self = this;
	this._year_list = [];
	this._era_uid = null;
	this._era_uid_param = era_uid;
	this._music_list = [];

	this.Init = function(){
		self.InitHandle();
		self.GetYearList();
		return self;
	};

	this.InitHandle = function(){
		$('#id_sel_era_years').on('change', self.OnChange_Year);
		$('#id_btn_era_listen_all').on('click', self.ListenAll);
	};

	//-----------------------------------------------------------------
	
	this.OnChange_Year = function(){
		self._era_uid = $('#id_sel_era_years').val();
		console.log('self._era_uid ' + self._era_uid);
		self.GetMusicList();
	};

	//-----------------------------------------------------------------

	this.GetYearList = function(){
		var req = {
			country_code: window._country_code
		};
		POST('/cherry_api/era/get_year_list/', req, res=>{
			if(res.ok){
				self._year_list = res.year_list;
				self.DISP_YearList();

				if(self._era_uid_param != null){
					self._era_uid = self._era_uid_param;
				}else{
					if(self._year_list.length > 0){
						self._era_uid = self._year_list[0].era_uid;
					}
				}
				console.log('self._era_uid ' + self._era_uid);
				if(self._era_uid != null){
					self.GetMusicList();
				}
			}else{
				alert(res.err);
			}
		});
	};

	this.GetMusicList = function(){
		console.log('Get Music List ' );
		$.get(`/cherry_api/era/get_music_list?eid=${self._era_uid}`, res=>{
			if(res.ok){
				self._music_list = res.music_list;
				self.DISP_MusicList();
			}else{
				alert(res.err);
			}
		});
	};

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
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

	//-----------------------------------------------------------------

	this.DISP_YearList = function(){
		var sel = $('#id_sel_era_years');
		sel.empty();
		for(var i=0 ; i<self._year_list.length ; i++){
			var y = self._year_list[i];
			var year = y.year;
			var era_uid = y.era_uid;
			var selected = '';
			if(self._era_uid_param == era_uid){
				selected = 'selected';
			}
			var option = $(`<option value="${era_uid}" ${selected}>${year}</option>`);
			sel.append(option);
		}
	};

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

			var on_click_plus = `window._era_control.ListenMusic(${i})`;
			var on_click_heart = `window._era_control.LikeMusic(${i})`;
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

		$('#id_div_era_music_list').html(h);
	};
}