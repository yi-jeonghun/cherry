$('document').ready(function(){
	const today = new Date().toISOString().split('T')[0];
	window._calendar = new TavoCalendar('#my-calendar', {
		date: today,
		selected: [today],
		future_select: true,
		past_select: true,
	});
	window._radio_control = new RadioControl().Init();
	var playlist_storage = new PlaylistStorage_Memory([]);
	window._cherry_player = new CherryPlayer().Init(playlist_storage);
});

const EDIT_MODE = {
	ADD:0,
	UPDATE:1
};

function RadioControl(){
	var self = this;
	this._country_code_for_edit = C_US;
	this._radio_network_list = [];
	this._radio_program_list = [];
	this._radio_program_music_list = [];
	this._radio_network_edit_mode = EDIT_MODE.ADD;
	this._radio_program_edit_mode = EDIT_MODE.ADD;
	this._working_radio_network_idx = null;
	this._working_radio_program_idx = null;
	this._searched_artist_list = [];
	this._searched_music_list = [];
	this._youtube = null;
	this._searching_title = '';
	this._youtube_searched_video_list = [];
	this._artist_uid = null;
	this._draft_music_list = [];
	this._working_draft_idx = null;

	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		self.LoadCountryCode();
		self.GetRadioNetworks();
		self.InitKeyHandle();

		$('#my-calendar').on('calendar-select', ev=>{
			self.OnClick_Cdlendar(window._calendar.getSelected());
		});
	
		return this;
	};

	this._cmd_key_holding = false;
	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			// console.log('key ' + e.keyCode);
			switch(e.keyCode){
				case 49://1
					self.OnClick_SearchYoutube(false);
					break;
				case 50://1
					self.OnClick_SearchArtist();
					self.OnClick_NavTab('artist');
					break;
				case 51://3
					self.OnClick_SearchMusic();
					self.OnClick_NavTab('music');
					break;
			}
		});
	};

	this.LoadCountryCode = function(){
		var country_code_for_edit = window.localStorage.getItem('COUNTRY_CODE_FOR_EDIT');
		console.log('country_code_for_edit ' + country_code_for_edit);
		self._country_code_for_edit = country_code_for_edit;
		if(self._country_code_for_edit == null){
			self._country_code_for_edit = C_US;
		}
		console.log('self._country_code_for_edit ' + self._country_code_for_edit);
		$('#id_img_playlist_country').attr("src",`/img/flags/${self._country_code_for_edit}.png`);
	};

	//============================================================

	this.OnClick_RadioNetworkAdd = function(){
		self._radio_network_edit_mode = EDIT_MODE.ADD;
		$('#id_input_cms_radio_network_name').val('');
		$('#id_modal_cms_radio_network_edit').modal('show');
	};

	this.OnClick_RadioNetworkEdit = function(idx){
		self._working_radio_network_idx = idx;
		self._radio_network_edit_mode = EDIT_MODE.UPDATE;
		$('#id_input_cms_radio_network_name').val(self._radio_network_list[idx].name);
		$('#id_modal_cms_radio_network_edit').modal('show');
	};

	this.OnClick_RadioNetworkEditOK = function(){
		var name = $('#id_input_cms_radio_network_name').val().trim();
		if(name == ''){
			alert('ratio network empty');
			return;
		}

		if(self._radio_network_edit_mode == EDIT_MODE.ADD){
			var req = {
				country_code: self._country_code_for_edit,
				name:name
			};
			POST('/__cms_api/add_radio_network', req, res=>{
				if(res.ok){
					$('#id_modal_cms_radio_network_edit').modal('hide');
					self.GetRadioNetworks();
				}else{
					alert(res.err);
				}
			});
		}else{
			var req = {
				network_uid: self._radio_network_list[self._working_radio_network_idx].network_uid,
				name:name
			};
			POST('/__cms_api/update_radio_network', req, res=>{
				if(res.ok){
					$('#id_modal_cms_radio_network_edit').modal('hide');
					self.GetRadioNetworks();
				}else{
					alert(res.err);
				}
			});
		}
	}

	this.OnClick_RadioNetwork = function(idx){
		self._working_radio_network_idx = idx;
		var network_uid = self._radio_network_list[idx].network_uid;
		self.Highlist_RadioNetwork();
		self.GetRadioPrograms(network_uid);
	};

	this.OnClick_ProgramAdd = function(){
		self._radio_program_edit_mode = EDIT_MODE.ADD;
		console.log('self._working_radio_network_idx ' + self._working_radio_network_idx);
		if(self._working_radio_network_idx == null){
			alert('Choose Radio Network First.');
			return;
		}
		$('#id_label_cms_radio_program-network_name').html('');
		$('#id_modal_cms_radio_program_edit').modal('show');
	};

	this.OnClick_RadioProgramEdit = function(idx){
		self._working_radio_program_idx = idx;
		self._radio_program_edit_mode = EDIT_MODE.UPDATE;

		var network_name = self._radio_network_list[self._working_radio_network_idx].name;
		$('#id_label_cms_radio_program-network_name').html(network_name);

		var program_name = self._radio_program_list[idx].name;
		var parser_type = self._radio_program_list[idx].parser_type;
		var parser_info = self._radio_program_list[idx].parser_info;
		$('#id_input_cms_radio_program_name').val(program_name);
		$('#id_input_cms_radio_program_parser_type').val(parser_type);
		$('#id_input_cms_radio_program_parser_info').val(parser_info);

		if(self._radio_program_list[idx].is_open == 'Y'){
			$('#id_check_cms_radio_program_is_open').prop('checked', true);
		}else{
			$('#id_check_cms_radio_program_is_open').prop('checked', false);
		}

		$('#id_modal_cms_radio_program_edit').modal('show');
	};

	this.OnClick_ProgramEditOK = function(){
		var name = $('#id_input_cms_radio_program_name').val().trim();
		if(name == ''){
			alert('Enter Program Name');
			return;
		}

		var is_open = $('#id_check_cms_radio_program_is_open').prop('checked') == true ? 'Y' : 'N';
		console.log('is_open ' + is_open);
		var parser_type = $('#id_input_cms_radio_program_parser_type').val();
		var parser_info = $('#id_input_cms_radio_program_parser_info').val();

		var network_uid = self._radio_network_list[self._working_radio_network_idx].network_uid;
		if(self._radio_program_edit_mode == EDIT_MODE.ADD){
			var req = {
				network_uid: network_uid,
				name:        name,
				parser_type: parser_type,
				parser_info: parser_info,
				is_open:     is_open
			};
			POST('/__cms_api/add_radio_program', req, res=>{
				if(res.ok){
					$('#id_modal_cms_radio_program_edit').modal('hide');
					self.GetRadioPrograms(network_uid);
				}else{
					alert(res.err);
				}
			});
		}else{
			var req = {
				program_uid: self._radio_program_list[self._working_radio_program_idx].program_uid,
				name: name,
				parser_type: parser_type,
				parser_info: parser_info,
				is_open:     is_open
			};
			POST('/__cms_api/update_radio_program', req, res=>{
				if(res.ok){
					$('#id_modal_cms_radio_program_edit').modal('hide');
					self.GetRadioPrograms(network_uid);
				}else{
					alert(res.err);
				}
			});
		}
	};

	this.OnClick_RadioProgram = function(idx){
		self._working_radio_program_idx = idx;
		var program_uid = self._radio_program_list[self._working_radio_program_idx].program_uid;
		self.Highlight_Program();
		var date = window._calendar.getSelected();
		self.GetRadioProgramMusicsByDay(program_uid, date);
	};

	this.OnClick_Cdlendar = function(date){
		if(self._working_radio_program_idx == null){
			return;
		}
		var program_uid = self._radio_program_list[self._working_radio_program_idx].program_uid;
		self.GetRadioProgramMusicsByDay(program_uid, date);
		self._draft_music_list = [];
		self.DISP_DraftMusicList();
	};

	this.OnClick_Auto = function(){
		var parser_type = self._radio_program_list[self._working_radio_program_idx].parser_type;
		var parser_info = self._radio_program_list[self._working_radio_program_idx].parser_info;

		var date = window._calendar.getSelected();
		var req = {
			date:        date,
			parser_type: parser_type,
			parser_info: parser_info
		};
		POST('/__cms_api/auto_radio_playlist', req, res=>{
			if(res.ok){
				self._draft_music_list = [];
				var tmp_list = res.playlist;

				for(var i=0 ; i<tmp_list.length ; i++){
					var m = tmp_list[i];
					m.title = self.FirstCharUp(m.title);
					m.artist = self.FirstCharUp(m.artist);
				}

				for(var i=0 ; i<tmp_list.length ; i++){
					var m1 = tmp_list[i];
					var same_found = false;
					for(var k=0 ; k<tmp_list.length ; k++){
						var m2 = tmp_list[k];
						if(i == k){
							continue;
						}
						if(m1.title == m2.title && m1.artist == m2.artist){
							same_found = true;
							break;
						}
					}

					if(same_found == false){
						self._draft_music_list.push(m1);
					}
				}

				self.OnClick_NavDraft('draft');
				self.DISP_DraftMusicList();
				self.AutoSearchArtistAndMusic();
			}else{
				alert(res.err);
			}
		});
	};

	this.FirstCharUp = function(str){
		var str2 = [];
		var begin = true;
		for(var i=0 ; i<str.length ; i++){
			var c = str.charAt(i);
			if(begin){
				c = c.toUpperCase();
			}else{
				c = c.toLowerCase();
			}

			if(c == ' ' || c == '('){
				begin = true;
			}else{
				begin = false;
			}

			str2.push(c);
		}
		return str2.join('');
	};

	this.AutoSearchArtistAndMusic = function(){
		console.log('start auto search ' );
		var req_data = {
			music_list: self._draft_music_list
		};

		$.ajax({
			url: '/__cms_api/top_rank/auto_search_artist_and_music_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					var ret_music_list = res.ret_music_list;

					for(var i=0 ; i<ret_music_list.length ; i++){
						var m = ret_music_list[i];
						self._draft_music_list[i].artist_uid = m.artist_uid;
						self._draft_music_list[i].video_id = m.video_id;
						self._draft_music_list[i].music_uid = m.music_uid;
						$('#id_draft_artist_uid-'+i).html(m.artist_uid);
						$('#id_draft_music_uid-'+i).html(m.music_uid);
					}
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.OnClick_Release = function(){
		console.log('release ');
		if(self._working_radio_program_idx == null){
			alert('choose radio program');
			return;
		}

		if(self._draft_music_list.length == 0){
			alert('no draft');
			return;
		}

		var music_list = [];
		for(var i=0 ; i<self._draft_music_list.length ; i++){
			var m = self._draft_music_list[i];
			if(m.music_uid === undefined || m.music_uid == null){
				continue;
			}
			music_list.push({music_uid: m.music_uid});
		}
		console.log('music_list.len ' + music_list.length);

		var req = {
			program_uid: self._radio_program_list[self._working_radio_program_idx].program_uid,
			date: window._calendar.getSelected(),
			music_list: music_list
		};

		POST('/__cms_api/release_radio_program_music', req, res=>{
			if(res.ok){
				self.OnClick_RadioProgram(self._working_radio_program_idx);
			}else{
				alert(res.err);
			}
		});
	};

	//---=---=--=---=---=---=---=---=---=---=---=---=---=---=---=---=

	this.OnClick_NavDraft = function(type){
		$('#id_nav_cms_radio_draft').removeClass('active');
		$('#id_nav_cms_radio_release').removeClass('active');
		$('#id_div_cms_radio_draft').hide();
		$('#id_div_cms_radio_release').hide();
		if(type == 'draft'){
			$('#id_nav_cms_radio_draft').addClass('active');
			$('#id_div_cms_radio_draft').show();
		}else if(type == 'release'){
			$('#id_nav_cms_radio_release').addClass('active');
			$('#id_div_cms_radio_release').show();
		}
	};

	this.OnClick_NavTab = function(type){
		$('#id_nav_cms_radio_artist').removeClass('active');
		$('#id_nav_cms_radio_music').removeClass('active');
		$('#id_div_cms_radio_music_search_result').hide();
		$('#id_div_cms_radio_artist_search_result').hide();
		if(type == 'artist'){
			$('#id_nav_cms_radio_artist').addClass('active');
			$('#id_div_cms_radio_artist_search_result').show();
		}else if(type == 'music'){
			$('#id_nav_cms_radio_music').addClass('active');
			$('#id_div_cms_radio_music_search_result').show();
		}
	};

	this.OnClick_SearchArtist = function(){
		if(self._working_draft_idx == null){
			return;
		}
		var keyword = self._draft_music_list[self._working_draft_idx].artist;
		if(keyword == ''){
			return;
		}
		$('#id_input_cms_radio_artist_search').val(keyword);
		self.OnClick_NavTab('artist');

		self._SearchArtist(keyword, function(res){
			if(res.ok){
				self._searched_artist_list = res.artist_list;
				var artist_uid_found = null;
				for(var i=0 ; i<self._searched_artist_list.length ; i++){
					var a = self._searched_artist_list[i];
					if(a.name == keyword){
						if(a.is_diff_name == 'Y'){
							artist_uid_found = a.org_artist_uid;
						}else{
							artist_uid_found = a.artist_uid;
						}
						break;
					}
				}
				
				if(artist_uid_found != null){
					self._draft_music_list[self._working_draft_idx].artist_uid = artist_uid_found;
					$('#id_draft_artist_uid-'+self._working_draft_idx).html(artist_uid_found);
				}
				self.DISP_SearchedArtistList();		
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_AddArtist = function(){
		var artist_name = $('#id_input_cms_radio_artist_search').val().trim();
		if(artist_name == ''){
			alert('artist name empty');
			return;
		}

		var req_data = {
			artist_name: artist_name
		};

		$.ajax({
			url:  '/__cms_api/find_or_add_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._draft_music_list[self._working_draft_idx].artist_uid = res.artist_uid;
					$('#id_draft_artist_uid-'+self._working_draft_idx).html(res.artist_uid);

					self._SearchArtist(artist_name, function(res){
						if(res.ok){
							self._searched_artist_list = res.artist_list;
							self.DISP_SearchedArtistList();
						}else{
							alert(res.err);
						}
					});
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_AddVAArtist = function(){
		var artist_name = $('#id_input_cms_radio_artist_search').val().trim();
		if(artist_name == ''){
			alert('artist name empty');
			return;
		}

		var artist_name_list = artist_name.split(',');
		for(var i=0 ; i<artist_name_list.length ; i++){
			artist_name_list[i] = artist_name_list[i].trim();
		}

		var req_data = {
			artist_name_list: artist_name_list
		};

		$.ajax({
			url:  '/__cms_api/find_or_add_various_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._draft_music_list[self._working_draft_idx].artist_uid = res.artist_uid;
					$('#id_draft_artist_uid-'+self._working_draft_idx).html(res.artist_uid);

					self._SearchArtist(artist_name, function(res){
						if(res.ok){
							self._searched_artist_list = res.artist_list;
							self.DISP_SearchedArtistList();
						}else{
							alert(res.err);
						}
					});
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_SearchedArtistOK = function(artist_uid){
		self._draft_music_list[self._working_draft_idx].artist_uid = artist_uid;
		$('#id_draft_artist_uid-'+self._working_draft_idx).html(artist_uid);
	};

	this.OnClick_SearchMusic = function(){
		if(self._working_draft_idx == null){
			return;
		}

		self.OnClick_NavTab('music');
		self._searched_music_list = [];

		var req_data = {
			artist_name: self._draft_music_list[self._working_draft_idx].artist,
			title:       self._draft_music_list[self._working_draft_idx].title
		};

		console.log('req ' + req_data);

		$.ajax({
			url: '/cherry_api/search_music_smart',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					var list1 = res.list1;
					var list2 = res.list2;

					for(var i1=0 ; i1<list1.length ; i1++){
						var m1 = list1[i1];
						for(var i2=0 ; i2<list2.length ; i2++){
							var m2 = list2[i2];
							if(m1.music_uid == m2.music_uid){
								list2.splice(i2, 1);
								break;
							}
						}
					}

					self._searched_music_list = list1.concat(list2);
					self.DISP_SearchedMusicList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_SearchYoutube = function(){
		self.SearchYoutube(false);
	};

	this.OnClick_NextPageSearch = function(){
		self.SearchYoutube(true);
	};

	this.OnClick_DraftMusic = function(idx){
		self._working_draft_idx = idx;
		self.HighlightDraftMusic(idx);
		var title = self._draft_music_list[self._working_draft_idx].title;
		var artist = self._draft_music_list[self._working_draft_idx].artist;
		$('#id_input_cms_radio_artist').val(artist);
		$('#id_input_cms_radio_title').val(title);
	};

	this.HighlightDraftMusic = function(idx){
		for(var i=0 ; i<self._draft_music_list.length ; i++){
			if(i == idx){
				$('#id_draft_music-'+i).css('color', 'red');
			}else{
				$('#id_draft_music-'+i).css('color', 'black');
			}
		}
	};

	this.OnClick_DeleteDraftMusic = function(idx){
		self._draft_music_list.splice(idx, 1);
		self.DISP_DraftMusicList();
	};

	this.OnClick_UpdateDraftMusic = function(){
		if(self._working_draft_idx == null){
			return;
		}

		var artist = $('#id_input_cms_radio_artist').val();
		var title = $('#id_input_cms_radio_title').val();
		self._draft_music_list[self._working_draft_idx].title = title;
		self._draft_music_list[self._working_draft_idx].artist = artist;

		self.DISP_DraftMusicList();
		self.HighlightDraftMusic(self._working_draft_idx);
	};

	//============================================================

	this.GetRadioNetworks = function(){
		var url = `/cherry_api/get_radio_networks_by_country?cc=${self._country_code_for_edit}`;
		$.get(url, res=>{
			if(res.ok){
				self._radio_network_list = res.radio_network_list;
				console.log('self._radio_network_list ' + self._radio_network_list.length);
				self.DISP_RadioNetworkList();
			}else{
				alert(res.err);
			}
		});
	};

	this.GetRadioPrograms = function(network_uid){
		var url = `/cherry_api/get_radio_programs?nid=${network_uid}`;
		$.get(url, res=>{
			if(res.ok){
				self._radio_program_list = res.radio_program_list;
				self.DISP_RadioProgramList();
			}else{
				alert(res.err);
			}
		});
	};

	this.GetRadioProgramMusicsByDay = function(program_uid, date){
		$.get(`/cherry_api/get_radio_program_musics_by_day?pid=${program_uid}&d=${date}`, res=>{
			if(res.ok){
				self._radio_program_music_list = res.music_list;
				self.OnClick_NavDraft('release');
				self.DISP_RadioProgramMusicList();
			}else{
				alert(res.err);
			}
		});
	};

	this.Highlist_RadioNetwork = function(){
		var network_uid = self._radio_network_list[self._working_radio_network_idx].network_uid;
		for(var i=0 ; i<self._radio_network_list.length ; i++){
			var r = self._radio_network_list[i];
			if(network_uid == r.network_uid){
				$(`#id_radio_network-${r.network_uid}`).css('background-color', 'yellow');
			}else{
				$(`#id_radio_network-${r.network_uid}`).css('background-color', 'white');
			}
		}
	};

	this.Highlight_Program = function(){
		var program_uid =  self._radio_program_list[self._working_radio_program_idx].program_uid;
		for(var i=0 ; i<self._radio_program_list.length ; i++){
			var p = self._radio_program_list[i];
			if(program_uid == p.program_uid){
				$(`#id_radio_program-${p.program_uid}`).css('background-color', 'yellow');
			}else{
				$(`#id_radio_program-${p.program_uid}`).css('background-color', 'white');
			}
		}
	};

	this._SearchArtist = function(keyword, cb){
		POST('/cherry_api/search_artist_like', {keyword:keyword}, res=>{
			if(cb){
				cb(res);
			}
		});
	};

	this.UseThisMusicID = function(idx){
		var m = self._searched_music_list[idx];
		self._draft_music_list[self._working_draft_idx].music_uid = m.music_uid;
		$('#id_draft_music_uid-'+self._working_draft_idx).html(m.music_uid);
	};

	this.SearchYoutube = function(is_next){
		if(self._working_draft_idx == null){
			return;
		}

		var artist_name = self._draft_music_list[self._working_draft_idx].artist.replace('&amp;', '');
		var title = self._draft_music_list[self._working_draft_idx].title.replace('&amp;', '');
		var keyword = artist_name + "+" + title;
		self._searching_title = title;

		if(is_next == false){
			self._youtube_searched_video_list = [];
		}
		self._youtube.Search(keyword, is_next, self.DISP_OnYoutubeSearched, self.DISP_OnYoutubeVideoInfo);
	};

	this.OnChooseVideo = function(video_id){
		for(var i=0 ; i<self._youtube_searched_video_list.length ; i++){
			var tmp_video_id = self._youtube_searched_video_list[i].video_id;
			if(tmp_video_id == video_id){
				$('#id_youtube_video_row-'+tmp_video_id).css('background', 'orange');
			}else{
				$('#id_youtube_video_row-'+tmp_video_id).css('background', 'white');
			}
		}

		console.log('video_id ' + video_id);
		var music = {
			video_id: video_id
		};
		window._cherry_player.TryMusic(music);
	};

	this.AutoMusicRegisterProcess = function(video_id){
		if(self._working_draft_idx == null){
			return;
		}

		var artist_uid = self._draft_music_list[self._working_draft_idx].artist_uid;
		var title = self._draft_music_list[self._working_draft_idx].title;
		if(artist_uid === undefined){
			alert('choose artist first');
			return;
		}

		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert('Choose DJ');
			return;
		}

		var req = {
			dj_user_id: dj_user_id,
			music:{
				artist_uid: artist_uid,
				title:      title,
				video_id:   video_id
			}
		};

		POST('/__cms_api/add_music', req, res=>{
			if(res.ok){
				self._draft_music_list[self._working_draft_idx].music_uid = res.music_info.music_uid;
				$('#id_draft_music_uid-'+self._working_draft_idx).html(res.music_info.music_uid);
			}else{
				alert(res.err);
			}
		});
	};
	//=============================================================

	this.DISP_RadioNetworkList = function(){
		var h = '';

		for(var i=0 ; i<self._radio_network_list.length ; i++){
			var r = self._radio_network_list[i];
			var on_click_edit = `window._radio_control.OnClick_RadioNetworkEdit(${i})`;
			var on_click_network = `window._radio_control.OnClick_RadioNetwork(${i})`;
			h += `
			<div class="border d-flex" id="id_radio_network-${r.network_uid}">
				<div class="col-9 pointer" onClick="${on_click_network}">${r.name}</div>
				<div class="col-2 text-right">
					<span class="badge badge-sm border" style="cursor:pointer" onClick="${on_click_edit}">
						<i class="fas fa-pen"></i>
					</span>
				</div>
			</div>
			`;
		}

		$('#id_div_network_list').html(h);
	};

	this.DISP_RadioProgramList = function(){
		var h = '';

		for(var i=0 ; i<self._radio_program_list.length ; i++){
			var p = self._radio_program_list[i];
			var on_click_edit = `window._radio_control.OnClick_RadioProgramEdit(${i})`;
			var on_click_program = `window._radio_control.OnClick_RadioProgram(${i})`;

			h += `
			<div class="border d-flex" id="id_radio_program-${p.program_uid}">
				<div class="col-9 pointer" onClick="${on_click_program}">[${p.is_open}]${p.name}</div>
				<div class="col-3 text-right">
					<span class="badge badge-sm border" style="cursor:pointer" onClick="${on_click_edit}">
						<i class="fas fa-pen"></i>
					</span>
				</div>
			</div>
			`;
		}

		$('#id_div_cms_radio_program_list').html(h);
	};

	this.DISP_SearchedArtistList = function(){
		var h = `<table class="table table-sm small">
		<tr>
		<th>AID</th>
		<th>Name</th>
		<th>VA</th>
		<th>Diff</th>
		<th></th>
		</tr>`;

		for(var i=0 ; i<self._searched_artist_list.length ; i++){
			var a = self._searched_artist_list[i];
			console.log(a.name + ' ' + a.artist_uid + ' ' + a.is_diff_name + ' ' + a.org_artist_uid);
			var artist_uid = a.artist_uid;
			if(a.is_diff_name == 'Y'){
				artist_uid = a.org_artist_uid;
			}
			var on_click_ok = `window._radio_control.OnClick_SearchedArtistOK('${artist_uid}')`;

			h += `
			<tr>
				<td>${artist_uid}</td>
				<td>${a.name}</td>
				<td>${a.is_various}</td>
				<td>${a.is_diff_name}</td>
				<td>
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${on_click_ok}">OK</span>
				</td>
			</tr>
			`;
		}
		
		$('#id_div_cms_radio_artist_search_result').html(h);
	};

	this.DISP_SearchedMusicList = function(){
		$('#id_div_cms_top_rank_music_search_result').empty();

		var h = `<table class="table table-sm table-striped small">
		<tr>
			<th>Music ID</th>
			<th>Artist</th>
			<th>Title</th>
			<th>Video ID</th>
			<th></th>
		</tr>`;

		for(var i=0 ; i<self._searched_music_list.length ; i++){
			var m = self._searched_music_list[i];
			var on_click_ok = `window._radio_control.UseThisMusicID(${i})`;
			var on_click_plus = `window._radio_control.OnClick_AddDiffNameOfMusic(${i})`;
			var music_uid = m.music_uid;
			console.log(m.title + ' ' + m.is_diff_name + ' ' + m.org_music_uid);
			var title_color = 'black';
			
			if(m.is_diff_name == 'Y'){
				music_uid = m.org_music_uid;
				title_color = '#bbbbbb';
			}

			h += `
			<tr>
				<td>${music_uid}</td>
				<td>${m.artist}</td>
				<td style="color:${title_color}">${m.title}</td>
				<td>${m.video_id}</td>
				<td class="text-right">
			`;

			if(m.is_diff_name == 'N'){
				h += `
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${on_click_ok}">OK</span>
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${on_click_plus}"><i class="fas fa-pen"></i></span>
				`;
			}
			h += `
				</td>
			</tr>`;
		}

		if(self._searched_music_list.length == 0){
			h += '<tr><td colspan="4" class="text-center">No Result</td></tr>';
		}

		h += '</table>';

		$('#id_div_cms_radio_music_search_result').html(h);
	};

	this.DISP_RadioProgramMusicList = function(){
		var h = '<table class="table table-sm table-striped small">';
		h += `
		<tr>
		<th>Num</th>
		<th>Artist</th>
		<th>Title</th>
		<th></th>
		</tr>
		`;

		for(var i=0 ; i<self._radio_program_music_list.length ; i++){
			var m = self._radio_program_music_list[i];
			h += `
			<tr>
			<td>${m.number}</td>
			<td>${m.artist}</td>
			<td>${m.title}</td>
			</tr>
			`;
		}

		$('#id_div_music_list').html(h);
	};

	this.DISP_OnYoutubeSearched = function(video_list){
		for(var i=0 ; i<video_list.length ; i++){
			self._youtube_searched_video_list.push(video_list[i]);
		}
		$('#id_div_youtube_search_result').empty();

		var h = `
		<div class="container-fluid small">
		`;
		for(var i=0 ; i<self._youtube_searched_video_list.length ; i++){
			var video = self._youtube_searched_video_list[i];

			var video_id = video.video_id;
			var title = video.title;
			title = title.replace(self._searching_title, '<u style="color:red">'+self._searching_title+'</u>');
			var channel = video.channel;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;
			var id_video_duration_str = `id_video_duration-${video_id}`;
			var id_youtube_video_row_str = `id_youtube_video_row-${video_id}`;
			var OnChooseVideo = `window._radio_control.OnChooseVideo('${video_id}')`;
			var OnOkClick = `window._radio_control.AutoMusicRegisterProcess('${video_id}')`;

			h += `
			<div class="row" style="margin-top:10px; border-bottom: 1px solid #eeeeee; cursor:pointer" id="${id_youtube_video_row_str}">
				<div class="col-1">
					<image style="height: 50px; width: 50px;" src="${img_src}">
				</div>
				<div class="col-1" id="${id_video_duration_str}">${video.duration}</div>
				<div class="col-8 d-flex">
					<div class="pl-1">
						<div class="text-dark">${title}</div>
						<div class="text-secondary" style="font-size: 0.8em">
						${channel}
						[${video_id}]
						</div>
					</div>
				</div>
				<div class="col-1">
					<button type="button" class="btn btn-sm border" onclick="${OnChooseVideo}">
						<i style="font-size: 1.2em;margin-left:3px" class="fas fa-play"></i>
					</button>
				</div>
				<div class="col-1">
					<span class="badge badge-sm badge-primary border" style="cursor:pointer" onClick="${OnOkClick}">OK</span>
				</div>
			</div>
			`;
		}

		h += `
			<div class="text-center pointer border bg-primary" onClick="window._radio_control.OnClick_NextPageSearch()" style="height:50px; color:white">
				More
			</div>
		</div>
		`;

		$('#id_div_youtube_search_result').html(h);
	};

	this.DISP_OnYoutubeVideoInfo = function(video_list){
		for(var i=0 ; i<video_list.length ; i++){
			for(var j=0 ; j<self._youtube_searched_video_list.length ; j++){
				if(self._youtube_searched_video_list[i].video_id == video_list[i].video_id){
					self._youtube_searched_video_list[i].duration = video_list[i].duration
					break;
				}
			}
			$('#id_video_duration-'+video_list[i].video_id).html(video_list[i].duration);
		}
	};

	this.DISP_DraftMusicList = function(){
		var h = `<table class="table table-sm table-striped small">
		<tr>
			<th>No</th>
			<th>Artist</th>
			<th>AID</th>
			<th>Title</th>
			<th>MID</th>
			<th></th>
		</tr>
		`;
		for(var i=0 ; i<self._draft_music_list.length ; i++){
			var m = self._draft_music_list[i];
			var on_click_music = `window._radio_control.OnClick_DraftMusic(${i})`;
			var on_click_trash = `window._radio_control.OnClick_DeleteDraftMusic(${i})`;

			h += `
			<tr class="pointer" id="id_draft_music-${i}">
				<td>${i+1}</td>
				<td onClick="${on_click_music}">${m.artist}</td>
				<td id="id_draft_artist_uid-${i}">${m.artist_uid}</td>
				<td onClick="${on_click_music}">${m.title}</td>
				<td id="id_draft_music_uid-${i}">${m.music_uid}</td>
				<td>
					<span class="badge badge-sm border pointer" onClick="${on_click_trash}"><i class="fas fa-trash-alt"></i></span>
				</td>
			</tr>
			`;
		}
		h += '</table>';
		$('#id_div_draft_music_list').html(h);
	};
}