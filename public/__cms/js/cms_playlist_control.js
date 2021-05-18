$('document').ready(function(){
	window._playlist_control = new PlaylistControl().Init();
});

const EDIT_MODE = {
	NEW:0,
	UPDATE:1
};

function PlaylistControl(){
	var self = this;
	this._edit_mode = EDIT_MODE.NEW;
	this._country_code_for_edit = null;
	this._playlist_info = null;
	this._playlist_music_list = [];
	this._searched_music_list = [];

	this.Init = function(){
		self.InitHandle();
		self.LoadCountryCode();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_playlist_new').on('click', self.OnPlaylistNewClick);
		$('#id_img_playlist_country').on('click', self.OnFlagClick);
		$('#id_btn_playlist_save').on('click', self.Save);
		$('#id_btn_playlist_search_artist').on('click', self.OnSearchArtistClick);
		$('#id_btn_playlist_search_music').on('click', self.OnSearchMusicClick);
		$('#id_btn_cms_playlist_refresh').on('click', self.OnClick_id_btn_cms_playlist_refresh);
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////

	this.OnSearchMusicClick = function(){
		var keyword = $('#id_input_playlist_search_keyword').val().trim();
		var req_data = {
			keyword: keyword
		};
		$.ajax({
			url: '/cherry_api/search_music_by_title',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._searched_music_list = res.music_list;
					self.DISP_SearchMusicList(res.music_list);
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnSearchArtistClick = function(){
		var keyword = $('#id_input_playlist_search_keyword').val().trim();
		var req_data = {
			keyword: keyword
		};
		$.ajax({
			url: '/cherry_api/search_music_list_by_artist_name_like',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._searched_music_list = res.music_list;
					self.DISP_SearchMusicList(res.music_list);
				}else{
					alert(res.err);
				}
			}
		});

	};

	this.OnPlaylistNewClick = function(){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert('Choose DJ');
			return;
		}

		self._edit_mode = EDIT_MODE.NEW;
		self._playlist_info = null;
		self._playlist_music_list = [];
		self.DISP_NewPlaylist();
		self.DISP_PlaylistMusicList();
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

	this.OnFlagClick = function(){
		var h = '<div class="container">';
		h += '<div class="row">';

		for(var i=0 ; i<COUNTRY_CODE_LIST.length ; i++){
			var cc = COUNTRY_CODE_LIST[i];
			var cn = COUNTRY_NAME_LIST[cc];

			h += `
			<div class="col-3 pb-1">
				<img src='/img/flags/${cc}.png' style="width:50px">
			</div>
			<div class="col-8" style="cursor:pointer" onClick="window._playlist_control.OnChooseCountry('${cc}')">
				${cn}
			</div>
			`;
		}
		h += '</div>';
		h += '</div>';
		
		$('#id_div_country_list').html(h);
	};

	this.OnChooseCountry = function(country_code){
		$('#modal_choose_country').modal('hide');
		console.log('country_code ' + country_code);

		window.localStorage.setItem('COUNTRY_CODE_FOR_EDIT', country_code);
		self.LoadCountryCode();
	};

	this.OnClick_id_btn_cms_playlist_refresh = function(){
		self.GetPlaylistList();
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////

	this.Save = function(){
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

		var music_id_list = [];

		for(var i=0 ; i<self._playlist_music_list.length ; i++){
			music_id_list.push(self._playlist_music_list[i].music_id);
		}

		var playlist_uid = null;
		if(self._edit_mode == EDIT_MODE.UPDATE){
			console.log('self._playlist_info.playlist_uid ' + self._playlist_info.playlist_uid);
			playlist_uid = self._playlist_info.playlist_uid;
		}

		var req_data = {
			dj_user_id: dj_user_id,
			playlist: {
				playlist_uid:   playlist_uid,
				country_code:  self._country_code_for_edit,
				title:         title,
				comment:       comment,
				is_open:       is_open,
				music_id_list: music_id_list	
			}
		};

		if(self._edit_mode == EDIT_MODE.NEW){
			$.ajax({
				url: '/__cms_api/add_playlist_and_music_list',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						self.GetPlaylistList();
						self.OpenPlaylistForEdit(res.playlist_uid);
						alert('success');
					}else{
						alert(res.err);
					}
				}
			});
		}else{
			$.ajax({
				url: '/__cms_api/update_playlist_and_music_list',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						self.GetPlaylistList();
						self.OpenPlaylistForEdit(self._playlist_info.playlist_uid);
						alert('success');
					}else{
						alert(res.err);
					}
				}
			});
		}
	};

	this.OpenPlaylistForEdit = function(playlist_uid){
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
					self.DISP_PlaylistInfo();
					self.DISP_PlaylistMusicList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.GetPlaylistList = function(){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert("Please Choose DJ");
			return;
		}

		var req_data = {
			country_code: self._country_code_for_edit,
			dj_user_id: dj_user_id
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

	this.AddMusic = function(idx){
		var m = self._searched_music_list[idx];

		for(var i=0 ; i<self._playlist_music_list.length ; i++){
			if(m.music_id == self._playlist_music_list[i].music_id){
				alert('Already added');
				return;
			}
		}

		var copy = {
			music_id: m.music_id,
			artist:   m.artist,
			title:    m.title,
			video_id: m.video_id
		};
		self._playlist_music_list.push(copy);
		self.DISP_PlaylistMusicList();
	};

	this.DeleteMusic = function(idx){
		self._playlist_music_list.splice(idx, 1);
		self.DISP_PlaylistMusicList();
	};

	this.OnClickDeletePlaylist = function(playlist_uid){
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

/////////////////////////////////////////////////////////////////////////

	this.DISP_NewPlaylist = function(){
		$('#id_leable_playlist_edit_mode').html('New Mode');
		$('#id_label_playlist_uid').html('');
		$('#id_label_playlist_country_code').html(self._country_code_for_edit);
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
		$('#id_div_playlist_list').html(playlist_list.length);
		var h = `
		<table class="table table-sm table-striped">
		<tr>
			<th>Title</th>
			<th>Like</th>
			<th>Open</th>
			<th></th>
		</tr>
		`;

		for(var i=0 ; i<playlist_list.length ; i++){
			var p = playlist_list[i];

			var on_click_title = `window._playlist_control.OpenPlaylistForEdit('${p.playlist_uid}')`;
			var on_click_delete = `window._playlist_control.OnClickDeletePlaylist('${p.playlist_uid}')`;

			h += `
			<tr style="cursor:pointer">
				<td onClick="${on_click_title}" style="cursor:pointer">${p.title}</td>
				<td onClick="${on_click_title}" style="cursor:pointer">${p.like_count}</td>
				<td onClick="${on_click_title}" style="cursor:pointer">${p.is_open}</td>
				<td><button class="btn btn-sm btn-primary" onClick="${on_click_delete}">X</button></td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_playlist_list').html(h);
	};

	this.DISP_SearchMusicList = function(music_list){
		var h = `
		<table class="table table-sm table-striped small">
		<tr>
			<th></th>
			<th>Artist</th>
			<th>Title</th>
			<th></th>
		</tr>
		`;

		if(music_list.length == 0){
			h += '<tr><td colspan="2" class="text-center">No Result</td></tr>';
		}

		for(var i=0 ; i<music_list.length ; i++){
			var m = music_list[i];
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var on_click = `window._playlist_control.AddMusic(${i})`;

			h += `
			<tr>
				<td><image style="height: 40px; width: 40px;" src="${img_src}"></td>
				<td>${m.artist}</td>
				<td>${m.title}</td>
				<td>
					<button type="button" class="btn btn-sm btn-primary" onClick="${on_click}">Add</button>
				</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_playlist_search_music_list').html(h);
	};

	this.DISP_PlaylistMusicList = function(){
		var h = `
		<table class="table table-sm table-striped small">
		<tr>
			<th></th>
			<th>Artist</th>
			<th>Title</th>
			<th></th>
		</tr>
		`;

		if(self._playlist_music_list.length == 0){
			h += '<tr><td colspan="4" class="text-center">No Result</td></tr>';
		}

		for(var i=0 ; i<self._playlist_music_list.length ; i++){
			var m = self._playlist_music_list[i];
			var img_src = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
			var on_click = `window._playlist_control.DeleteMusic(${i})`;

			h += `
			<tr>
				<td><image style="height: 40px; width: 40px;" src="${img_src}"></td>
				<td>${m.artist}</td>
				<td>${m.title}</td>
				<td><button type="button" class="btn btn-sm btn-primary" onClick="${on_click}">X</button></td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_playlist_music_list').html(h);
	};
}