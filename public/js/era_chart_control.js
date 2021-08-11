function EraChartControl(){
	var self = this;
	this._year_list = [];
	this._era_uid = null;
	this._music_list = [];
	this._year = 0;

	this.Init = function(era_uid){
		self._era_uid = era_uid;

		self.InitHandle();
		self.GetEraInfo();
		// self.GetYearList();
		// self.GetMusicList();

		return self;
	};

	this.InitHandle = function(){
		// $('#id_sel_era_years').on('change', self.OnChange_Year);
		$('#id_btn_era_listen_all').on('click', self.ListenAll);
	};

	//-----------------------------------------------------------------
	
	// this.OnChange_Year = function(){
	// 	self._era_uid = $('#id_sel_era_years').val();
	// 	for(var i=0 ; i<self._year_list.length ; i++){
	// 		if(self._era_uid == self._year_list[i].era_uid){
	// 			self._year = self._year_list[i].year;
	// 			break;
	// 		}
	// 	}
	// 	window._router.UpdateMeta_EraChart(self._year);
	// 	self.GetMusicList();
	// };

	this.GoToYear = function(era_uid){
		window._router.Go(`/${window._country_code}/era_chart.go?eid=${era_uid}`);
	};

	//-----------------------------------------------------------------

	this.GetEraInfo = function(){
		var req = {
			era_uid: self._era_uid
		}
		POST('/cherry_api/era/get_era_info', req, res=>{
			if(res.ok)
			{
				var region = res.era_info.region;
				var year = res.era_info.year;

				var l_region = '';
				if(region == 'domestic'){
					l_region = TR(L_DOMESTIC);
				}else if(region == 'foreign'){
					l_region = TR(L_FOREIGN);
				}
				var meta = year + ' ' + l_region;
				window._router.UpdateMeta_EraChart(meta);
		
				$('#id_label_era_chart_year').html(year);
				$('#id_label_era_chart_region').html(l_region);
				self.GetMusicList();
			}
			else
			{
				alert(res.err);
			}
		})
	};

	this.GetYearList = function(){
		var req = {
			country_code: window._country_code
		};
		POST('/cherry_api/era/get_year_list', req, res=>{
			if(res.ok){
				self._year_list = res.year_list;
				self.DISP_YearList();
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
		{
			var h = '';
			for(var i=0 ; i<self._year_list.length ; i++){
				var y = self._year_list[i];
				if(y.region == 'domestic'){
					var onClick = `window._era_chart_control.GoToYear('${y.era_uid}')`;
					h += `
						<div class="text-center pointer border py-2" onClick="${onClick}">
							<i class="fas fa-music"></i>
							${y.year}
						</div>
					`;
				}
			}
			$('#id_div_era_domestic_years').html(h);
		}

		{
			var h = '';
			for(var i=0 ; i<self._year_list.length ; i++){
				var y = self._year_list[i];
				if(y.region == 'foreign'){
					var onClick = `window._era_chart_control.GoToYear('${y.era_uid}')`;
					h += `
						<div class="text-center pointer border py-2" onClick="${onClick}">
							<i class="fas fa-music"></i>
							${y.year}
						</div>
					`;
				}
			}
			$('#id_div_era_foreign_years').html(h);
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

			var on_click_plus = `window._era_chart_control.ListenMusic(${i})`;
			var on_click_heart = `window._era_chart_control.LikeMusic(${i})`;
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