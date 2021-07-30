$('document').ready(function(){
	window._playlist_control = new PlaylistControl().Init();
});

const EDIT_MODE = {
	NEW:0,
	UPDATE:1
};

const SAVE_BTN = {
	NEED_SAVE:0,
	SAVED:1
};

function PlaylistControl(){
	var self = this;
	this._edit_mode = EDIT_MODE.NEW;
	this._playlist_info = null;
	this._playlist_music_list = [];
	this._searched_music_list = [];
	this._hash_list = [];
	// this._artist_uid = null;
	this._elvis = null;

	this.Init = function(){
		$('#id_div_elvis').load('/__cms/elvis.htm', function(){
			var playlist_storage = new PlaylistStorage_Memory([]);
			window._cherry_player = new CherryPlayer().Init(playlist_storage);		

			//slider control은 원래 자동으로 초기화 되는데
			//타이밍 이슈로 인해 강제로 다시 초기화 함.
			window._slider_control = null;
			window._slider_control = new SliderControl().Init();
		});
		{
			window._elvis.SetCallback_SearchedArtistOK(self.CB_SearchedArtistOK);
			window._elvis.SetCallback_MusicOK(self.CB_UseThisMusicID);
			window._elvis.SetCallback_YoutubeSearchOK(self.CB_AutoMusicRegisterProcess);
		}

		self.InitHandle();
		self.InitKeyHandle();
		self.GetPlaylistList();
		return self;
	};

	this.InitHandle = function(){
		$('#id_input_cms_playlist_hash').on('keypress', self.OnInput_Hash);
	};

	this.InitKeyHandle = function(){
		document.addEventListener('keydown', function(e){
			// console.log('key ' + e.keyCode);
			switch(e.keyCode){
				case 49://1
					// self.SearchYoutube(self._working_idx);
					self.OnClick_SearchYoutube();
					break;
				case 50://1
					// self.SearchArtist(self._working_idx);
					self.OnClick_SearchArtist();
					break;
				case 51://3
					// self.SearchMusic(self._working_idx);
					self.OnClick_SearchMusic();
					break;
			}
		});
	};

	//-----------------------------------------------------------------------------

	this.OnInput_Hash = function(e){
		if(e.which != 13) {
			return;
		}
		var hash = $('#id_input_cms_playlist_hash').val().trim();

		for(var i=0 ; i<self._hash_list.length ; i++){
			if(self._hash_list[i].hash == hash){
				return;
			}
		}

		self._hash_list.push({hash:hash});
		self.DISP_HashList();

		$('#id_input_cms_playlist_hash').val('');
	};

	this.OnClick_NewPlaylist = function(){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert('Choose DJ');
			return;
		}

		$('#id_modal_playlist_edit').modal('show');

		self._edit_mode = EDIT_MODE.NEW;
		self._playlist_info = null;
		self._playlist_music_list = [];
		self._hash_list = [];
		self.DISP_NewPlaylist();
		self.DISP_PlaylistMusicList();
		self.DISP_HashList();
	};

	this.OnClick_DeleteHash = function(idx){
		self._hash_list.splice(idx, 1);
		self.DISP_HashList();
	};

	this.OnClick_EditPlaylist = function(playlist_uid){
		$('#id_modal_playlist_edit').modal('show');
		self._edit_mode = EDIT_MODE.UPDATE;
		var req_data = {
			playlist_uid: playlist_uid
		};

		$.ajax({
			url: '/cherry_api/get_playlist_info',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._playlist_info = res.playlist_info;
					self._playlist_music_list = res.music_list;
					self._hash_list = res.hash_list;
					self.DISP_PlaylistInfo();
					self.DISP_HashList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_PlaylistMusicList = function(playlist_uid){
		console.log('OnClick_PlaylistMusicList ' );
		var req_data = {
			playlist_uid: playlist_uid
		};

		$.ajax({
			url: '/cherry_api/get_playlist_info',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.ColorSaveButton(SAVE_BTN.SAVED);
					self._playlist_info = res.playlist_info;
					// console.log('self._playlist_info ' + self._playlist_info);
					self._playlist_music_list = res.music_list;
					self._hash_list = res.hash_list;
					self.DISP_PlaylistMusicList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.OnClick_SavePlaylist = function(){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert('Choose DJ');
			return;
		}

		var title = $('#id_input_playlist_title').val().trim();
		if(title == ''){
			alert('title empty');
			return;
		}

		var comment = $('#id_input_playlist_comment').val().trim();
		var is_open = $('#id_checkbox_playlist_is_open').is(":checked");
		console.log('is_open ' + is_open);

		var playlist_uid = null;
		if(self._edit_mode == EDIT_MODE.UPDATE){
			console.log('self._playlist_info.playlist_uid ' + self._playlist_info.playlist_uid);
			playlist_uid = self._playlist_info.playlist_uid;
		}

		var req_data = {
			dj_user_id: dj_user_id,
			playlist: {
				playlist_uid:   playlist_uid,
				country_code:  window._country_selector.GetCountryCode(),
				title:         title,
				comment:       comment,
				is_open:       is_open
			},
			hash_list: self._hash_list
		};

		console.log('self._edit_mode ' + self._edit_mode);

		if(self._edit_mode == EDIT_MODE.NEW){
			console.log('new mode ' );
			$.ajax({
				url: '/__cms_api/add_playlist',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					console.log('res ' + res);
					if(res.ok){
						self.GetPlaylistList();
					}else{
						alert(res.err);
					}
				}
			});
		}else{
			console.log('edit mode ' );
			$.ajax({
				url: '/__cms_api/update_playlist',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						self.GetPlaylistList();
					}else{
						alert(res.err);
					}
				}
			});
		}
		$('#id_modal_playlist_edit').modal('hide');
	};

	this.OnClick_SaveMusicList = function(){
		if(self._playlist_info == null){
			alert('select playlist.');
			return;
		}

		var music_uid_list = [];
		var video_id_list = [];

		for(var i=0 ; i<self._playlist_music_list.length ; i++){
			var m = self._playlist_music_list[i];
			if(m.music_uid == null || m.video_id == null){
				continue;
			}

			music_uid_list.push(m.music_uid);
			video_id_list.push(m.video_id);
		}

		var req_data = {
			playlist_uid:   self._playlist_info.playlist_uid,
			music_uid_list: music_uid_list,
			video_id_list:  video_id_list
		};

		$.ajax({
			url: '/__cms_api/update_playlist_music_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.ColorSaveButton(SAVE_BTN.SAVED);
					self.GetPlaylistList();
				}else{
					alert(res.err);
				}
			}
		});

	};

	this.OnClick_SearchArtist = function(){
		if(self._playlist_info == null){
			alert('select playlist.');
			return;
		}

		var artist_name = self._playlist_music_list[self._working_idx].artist;
		if(artist_name == ''){
			return;
		}
		window._elvis.SearchArtist(artist_name, function(artist_list){
			var artist_uid_found = null;
			for(var i=0 ; i<artist_list.length ; i++){
				var a = artist_list[i];
				if(a.name == artist_name){
					if(a.is_diff_name == 'Y'){
						artist_uid_found = a.org_artist_uid;
					}else{
						artist_uid_found = a.artist_uid;
					}
					break;
				}
			}
			
			if(artist_uid_found != null){
				self._playlist_music_list[self._working_idx].artist_uid = artist_uid_found;
				$(`#id_label_artist_uid_${self._working_idx}`).html(artist_uid_found);
				// self._artist_uid = artist_uid_found;
				// $('#id_label_cms_playlist_aid').html(artist_uid_found);
			}
		});
	};

	this.OnClick_SearchMusic = function(){
		if(self._playlist_info == null){
			alert('select playlist.');
			return;
		}

		var artist_name = self._playlist_music_list[self._working_idx].artist;//$('#id_input_cms_playlist_artist').val().trim();
		var title = self._playlist_music_list[self._working_idx].title;//$('#id_input_cms_playlist_title').val().trim();
		window._elvis.SearchMusic(artist_name, title);
	};

	this.OnClick_SearchYoutube = function(){
		if(self._playlist_info == null){
			alert('select playlist.');
			return;
		}

		var artist_name = self._playlist_music_list[self._working_idx].artist;//$('#id_input_cms_playlist_artist').val().trim();
		var title = self._playlist_music_list[self._working_idx].title;//$('#id_input_cms_playlist_title').val().trim();

		var artist_name = artist_name.replace('&amp;', '');
		var title = title.replace('&amp;', '').replace('?', '');
		var keyword = artist_name + "+" + title;

		window._elvis.SearchYoutube(keyword);
	};

	this.OnClick_BulkOpen = function(){
		if(self._playlist_info == null){
			alert('choose playlist first');
			return;
		}

		$('#id_text_bulk').val('');
		$('#id_modal_playlist_bulk').modal('show');
	};

	this.OnClick_SaveBulk = function(type){
		self._playlist_music_list = [];
		var txt = $('#id_text_bulk').val();
		var lines = txt.split('\n');
		// console.log('lines  ' + lines.length);
		for(var i=0 ; i<lines.length ; i++){
			var line = lines[i].trim();
			if(line == ''){
				continue;
			}
			// console.log('line ' + line);
			var artist;
			var title;
			if(type == 'a_t'){
				var arr = line.split('-');
				artist = arr[0].trim();
				if(arr.length > 0)
					title = arr[1].trim();
			}else if(type == 't_a'){
				var arr = line.split('-');
				title = arr[0].trim();
				if(arr.length > 0)
					artist = arr[1].trim();
			}
			var music = {
				artist: artist,
				artist_uid: null,
				title: title,
				music_uid: null,
				video_id: null
			};
			self._playlist_music_list.push(music);
		}
		self.AutoSearchArtistAndMusic();
		$('#id_modal_playlist_bulk').modal('hide');		
	};

	this.OnClick_UpdateSelectedMusic = function(){
		var artist = $('#id_input_cms_playlist_artist').val();
		var title = $('#id_input_cms_playlist_title').val();

		self._playlist_music_list[self._working_idx].artist = artist;
		self._playlist_music_list[self._working_idx].title = title;
		self._playlist_music_list[self._working_idx].music_uid = null;
		self._playlist_music_list[self._working_idx].video_id = null;

		$('#id_input_cms_playlist_artist').val('');
		$('#id_input_cms_playlist_title').val('');
		self.DISP_PlaylistMusicList();
	};

	//-----------------------------------------------------------------------------

	this.CB_SearchedArtistOK = function(artist_uid){
		$('#id_label_cms_playlist_aid').html(artist_uid);
		self._artist_uid = artist_uid;
	};

	this.CB_UseThisMusicID = function(music){
		var m = music;
		self._playlist_music_list[self._working_idx].artist_uid = m.artist_uid;
		self._playlist_music_list[self._working_idx].music_uid = m.music_uid;
		self._playlist_music_list[self._working_idx].video_id = m.video_id;
		$('#id_label_artist_uid_'+self._working_idx).html(m.artist_uid);
		$('#id_label_music_uid_'+self._working_idx).html(m.music_uid);
		self.DISP_VideoImage();
		self.ColorSaveButton(SAVE_BTN.NEED_SAVE);
	};

	this.CB_AutoMusicRegisterProcess = function(video_id){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert('Choose DJ');
			return;
		}
		var title = $('#id_input_cms_playlist_title').val().trim();
		var req = {
			dj_user_id: dj_user_id,
			music:{
				artist_uid: self._artist_uid,
				title:      title,
				video_id:   video_id
			}
		};
		POST('/__cms_api/add_music', req, res=>{
			if(res.ok){
				self.CB_UseThisMusicID(res.music_info);
			}else{
				alert(res.err);
			}
		});
	};

	//-----------------------------------------------------------------------------

	this.GetPlaylistList = function(){
		var req_data = {
			country_code: window._country_selector.GetCountryCode()
		};
		$.ajax({
			url: '/__cms_api/get_playlist_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.DISP_PlaylistList(res.playlist_list);
				}else{
					alert(res.err);
				}
			}
		});		
	};

	this.DeleteMusic = function(idx){
		self._playlist_music_list.splice(idx, 1);
		self.ColorSaveButton(SAVE_BTN.NEED_SAVE);
		self.DISP_PlaylistMusicList();
	};

	this.OnClickDeletePlaylist = function(playlist_uid){
		if(confirm('Sure to delete?') == false){
			return;
		}

		if(self._playlist_info != null && self._playlist_info.playlist_uid == playlist_uid){
			self.OnPlaylistNewClick();
		}

		var req_data = {
			playlist_uid: playlist_uid
		};

		$.ajax({
			url: '/cherry_api/delete_playlist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetPlaylistList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.ColorSaveButton = function(save){
		$('#id_btn_cms_playlist_save').removeClass("btn-primary");
		$('#id_btn_cms_playlist_save').removeClass("btn-danger");

		if(save == SAVE_BTN.NEED_SAVE)
			$('#id_btn_cms_playlist_save').addClass('btn-danger');
		else if(save == SAVE_BTN.SAVED)
			$('#id_btn_cms_playlist_save').addClass('btn-primary');
	};

	this.ClearMusicInput = function(){
		$('#id_input_cms_playlist_artist').val('');
		$('#id_input_cms_playlist_title').val('');
		$('#id_label_cms_playlist_aid').html('');
		self._artist_uid = null;
	};

	this.AutoSearchArtistAndMusic = function(artist, title){
		console.log('start auto search ' );
		var music_list = [];
		for(var i=0 ; i<self._playlist_music_list.length ; i++){
			var m = self._playlist_music_list[i];
			music_list.push({
				artist: m.artist,
				title: m.title
			});				
		}
		var req_data = {
			music_list: music_list
		};

		$.ajax({
			url: '/__cms_api/top_rank/auto_search_artist_and_music_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					for(var i=0 ; i<res.ret_music_list.length ; i++){
						var m = res.ret_music_list[i];
						self._playlist_music_list[i].music_uid = m.music_uid;
						self._playlist_music_list[i].artist_uid = m.artist_uid;
						self._playlist_music_list[i].video_id = m.video_id;							
					}
					self.DISP_PlaylistMusicList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.ChooseMusic = function(idx){
		self._working_idx = idx;

		for(var i=0 ; i<self._playlist_music_list.length ; i++){
			if((i%2) == 0){
				$(`#id_music_${i}`).css('background-color', '#eeeeee');
			}else{
				$(`#id_music_${i}`).css('background-color', 'white');
			}
		}

		$(`#id_music_${idx}`).css('background-color', 'yellow');
		$('#id_input_cms_playlist_artist').val(self._playlist_music_list[idx].artist);
		$('#id_input_cms_playlist_title').val(self._playlist_music_list[idx].title);
	};

/////////////////////////////////////////////////////////////////////////

	this.DISP_NewPlaylist = function(){
		$('#id_leable_playlist_edit_mode').html('New Mode');
		$('#id_label_playlist_uid').html('');
		$('#id_label_playlist_country_code').html(window._country_selector.GetCountryCode());
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		$('#id_label_playlist_user_id').html(dj_user_id);
		$('#id_input_playlist_title').val('');
		$('#id_input_playlist_comment').val('');
		$('#id_checkbox_playlist_is_open').prop("checked", false);
		$('#id_label_time_created').html('');
		$('#id_label_time_updated').html('');
	};

	this.DISP_PlaylistInfo = function(){
		$('#id_leable_playlist_edit_mode').html('Update Mode');
		$('#id_label_playlist_uid').html(self._playlist_info.playlist_uid);
		$('#id_label_playlist_country_code').html(self._playlist_info.country_code);
		$('#id_input_playlist_title').val(self._playlist_info.title);
		$('#id_input_playlist_comment').val(self._playlist_info.comment);

		if(self._playlist_info.is_open == 'Y'){
			$('#id_checkbox_playlist_is_open').prop("checked", true);
		}else{
			$('#id_checkbox_playlist_is_open').prop("checked", false);
		}

		$('#id_label_time_created').html(self._playlist_info.timestamp_created);
		$('#id_label_time_updated').html(self._playlist_info.timestamp_updated);
	};

	this.DISP_PlaylistList = function(playlist_list){
		var h = `
		<table class="table table-sm table-striped small">
		<tr class="small">
			<th>Title</th>
			<th>Name</th>
			<th>Open</th>
			<th></th>
		</tr>
		`;

		for(var i=0 ; i<playlist_list.length ; i++){
			var p = playlist_list[i];

			var on_click_delete = `window._playlist_control.OnClickDeletePlaylist('${p.playlist_uid}')`;
			var on_click_edit = `window._playlist_control.OnClick_EditPlaylist('${p.playlist_uid}')`;
			var on_click_title = `window._playlist_control.OnClick_PlaylistMusicList('${p.playlist_uid}')`;

			h += `
			<tr class="" style="cursor:pointer">
				<td onClick="${on_click_title}">${p.title}</td>
				<td onClick="${on_click_title}">${p.user_name}</td>
				<td onClick="${on_click_title}">${p.is_open}</td>
				<td>
					<span class="badge badge-sm badge-primary border pointer" onClick="${on_click_delete}">
						<i class="fas fa-trash-alt"></i>
					</span>
					<span class="badge badge-sm badge-primary border pointer" onClick="${on_click_edit}">
						<i class="fas fa-pen-alt"></i>
					</span>
				</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_playlist_list').html(h);
	};

	this.DISP_PlaylistMusicList = function(){
		// console.log('self._playlist_info ' + self._playlist_info);
		$('#id_label_cms_playlist_title').html(self._playlist_info.title);
		$('#id_label_cms_playlist_uid').html(self._playlist_info.playlist_uid);

		var h = `
		<table class="table table-sm table-striped small">
		<tr>
			<th>No</th>
			<th></th>
			<th>Artist</th>
			<th>AID</th>
			<th>Title</th>
			<th>MID</th>
			<th></th>
		</tr>
		`;

		if(self._playlist_music_list.length == 0){
			h += '<tr><td colspan="4" class="text-center">No Result</td></tr>';
		}

		for(var i=self._playlist_music_list.length-1 ; i>=0 ; i--){
			var m = self._playlist_music_list[i];
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var on_click_delete = `window._playlist_control.DeleteMusic(${i})`;
			var on_click_choose = `window._playlist_control.ChooseMusic(${i})`;

			h += `
			<tr id="id_music_${i}">
				<td>${i+1}</td>
				<td><image id="id_img_${i}" style="height: 40px; width: 40px;" src="${img_src}"></td>
				<td class="pointer" onClick="${on_click_choose}">${m.artist}</td>
				<td class="pointer" onClick="${on_click_choose}" id="id_label_artist_uid_${i}">${m.artist_uid==null?'-':m.artist_uid}</td>
				<td class="pointer" onClick="${on_click_choose}">${m.title}</td>
				<td class="pointer" onClick="${on_click_choose}" id="id_label_music_uid_${i}">${m.music_uid==null?'-':m.music_uid}</td>
				<td>
					<span class="badge badge-sm badge-primary pointer" onClick="${on_click_delete}">
						<i class="fas fa-trash-alt"></i>
					</span>
				</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_playlist_music_list').html(h);
	};

	this.DISP_HashList = function(){
		var h = ``;
		for(var i=0 ; i<self._hash_list.length ; i++){
			var hash = self._hash_list[i].hash;
			var on_click = `window._playlist_control.OnClick_DeleteHash(${i})`;
			h += `
			<span class="px-1 py-1">
				${hash}
				<span class="badge badge-sm border pointer" onClick="${on_click}">X</span>
			</span>
			`;
		}
		$('#id_div_cms_playlist_hash_list').html(h);
	};

	this.DISP_VideoImage = function(){
		var video_id = self._playlist_music_list[self._working_idx].video_id;
		var img_url = '';
		if(video_id != null && video_id != ''){
			img_url = `https://img.youtube.com/vi/${video_id}/0.jpg`;
		}
		
		$('#id_img_'+self._working_idx).attr('src', img_url);
	};
}