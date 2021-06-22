function RadioProgramControl(program_uid){
	var self = this;
	this._program_uid = program_uid;
	this._music_list = [];

	this.Init = function(){
		self.InitComponentHanele();
		self.GetProgramInfo();
		self.GetProgramMusicList();
		return this;
	}

	this.InitComponentHanele = function(){
		$('#id_btn_top_rank_listen_all').on('click', self.ListenAll);
	};

	//===============================================================

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

	this.GetProgramInfo = function(){
		var req = {program_uid: self._program_uid};
		POST('/cherry_api/get_radio_program_info', req, res=>{
			if(res.ok){
				console.log('res.program_info ' + res.program_info);
				$('#id_label_program_name').html(res.program_info.name);
			}else{
				alert(res.err);
			}
		});
	};

	this.GetProgramMusicList = function(){
		var req = {program_uid: self._program_uid};
		POST('/cherry_api/get_radio_program_music_list', req, res=>{
			if(res.ok){
				self._music_list = res.music_list;
				self.DISP_MusicList();
			}else{
				alert(res.err);
			}
		});
	};

	this.ListenDay = function(date){
		console.log('date ' + date);
		var music_list = [];
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			console.log('m.date ' + m.date);
			if(date == m.date){
				music_list.push(m);
			}
		}
		console.log('music_list ' + music_list.length);
		if(music_list.length > 0){
			window._cherry_player.LoadMusicList(music_list);
		}
	};

	//=============================================================

	this.DISP_MusicList = function(){
		console.log('disp music list ' + self._music_list.length);
		var h = '';
		var prev_date = '';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];

			if(m.date != prev_date){
				h += `
				<div class="row border py-2">
					<div class="col-6">${m.date.split('T')[0]}</div>
					<div class="col-6 text-right">
						<button type="button" class="btn btn-sm btn-primary" onClick="window._radio_program_control.ListenDay('${m.date}')">
							<i style="font-size: 1.2em;margin-left:3px" class="fas fa-play"></i>
						</button>
					</div>
				</div>
				`;
			}
			prev_date = m.date;

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

			var on_click_plus = `window._radio_program_control.ListenMusic(${i})`;
			var on_click_heart = `window._radio_program_control.LikeMusic(${i})`;
			var on_click_title = `window._router.Go('/${window._country_code}/music.go?mid=${m.music_uid}')`
			var id_heart_icon = `id_icon_music_heart-${m.music_uid}`;
			var like_color = '#bbbbbb';
			if(m.is_like == 'Y'){
				like_color = 'red';
			}

			h += `
				<div class="row ">
					<div class="" style="font-size:0.6em; width:50px; padding-left:5px">${m.number}</div>
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

		$('#id_div_radio_music_list').html(h);
	};
}