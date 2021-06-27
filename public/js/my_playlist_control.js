$('document').ready(function(){
	window._my_playlist_control = new MyPlaylistControl().Init();
});

var MY_PLAYLIST_EDIT_TYPE = {
	NEW    :0,
	UPDATE :1
};

function MyPlaylistControl(){
	var self = this;
	this._playlist_list = [];
	this._is_edit_mode = false;
	this._playlist_uid = null;
	this._my_playlist_edit_type = MY_PLAYLIST_EDIT_TYPE.NEW;
	this._hash_list = [];

	this.Init = function(){
		self.InitHandle();
		self.LoadPlaylist();
		return self;
	};

	this.InitHandle = function(){
		$('#id_btn_my_playlist_plus').on('click', self.OnClickPlus);
		$('#id_btn_modal_my_plalist_ok').on('click', self.OnClickMyPlaylistOK);
		$('#id_btn_my_playlist_edit_mode_toggle').on('click', self.OnClick_id_btn_my_playlist_edit_mode_toggle);
		$('#id_btn_my_playlist_hash_plus').on('click', self.OnClick_id_btn_my_playlist_hash_plus);
	};

	///////////////////////////////////////////////////////////////////////////////////

	this.OnClick_id_btn_my_playlist_hash_plus = function(){
		var hash = $('#id_input_my_playlist_hash').val().trim();
		if(hash == ''){
			return;
		}

		for(var i=0 ; i<self._hash_list.length ; i++){
			if(self._hash_list[i].hash == hash){
				return;
			}
		}

		$('#id_input_my_playlist_hash').val('');
		self._hash_list.push({hash:hash});
		self.DISP_HashList();
	};

	this.OnClick_DeleteHash = function(idx){
		self._hash_list.splice(idx, 1);
		self.DISP_HashList();
	};

	this.OnClick_id_btn_my_playlist_edit_mode_toggle = function(){
		self._is_edit_mode = !self._is_edit_mode;
		self.DISP_playlist_list();
	};

	this.OnClickPlus = function(){
		var user_id = window._auth_control.GetUserID();
		if(user_id == null || user_id == ''){
			alert('Sign in required');
			return;
		}
		self._my_playlist_edit_type = MY_PLAYLIST_EDIT_TYPE.NEW;

		$('#id_input_my_playlist_title').val('');
		$('#id_input_my_playlist_comment').val('');
		$('#id_checkbox_my_playlist_open').prop("checked", false);
		self._hash_list = [];
		self.DISP_HashList();

		$('#modal_my_playlist').modal('show');
	};

	this.OnClickMyPlaylistOK = function(){
		$('#modal_my_playlist').modal('hide');
		var title = $('#id_input_my_playlist_title').val().trim();
		var comment = $('#id_input_my_playlist_comment').val().trim();
		var is_open = $('#id_checkbox_my_playlist_open').is(":checked");

		console.log('self._is_edit_mode ' + self._is_edit_mode);

		if(self._my_playlist_edit_type == MY_PLAYLIST_EDIT_TYPE.NEW){
			var req_data = {
				playlist:{
					country_code:  window._country_code,
					title:         title,
					comment:       comment,
					is_open:       is_open
				},
				hash_list:self._hash_list
			};
		
			$.ajax({
				url: '/cherry_api/add_playlist',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						self.LoadPlaylist();
						alert('success');
					}else{
						alert(res.err);
					}
				}
			});
		}else{
			var req_data = {
				playlist:{
					playlist_uid:   self._playlist_uid,
					country_code:  window._country_code,
					title:         title,
					comment:       comment,
					is_open:       is_open
				},
				hash_list: self._hash_list
			};
		
			$.ajax({
				url: '/cherry_api/update_playlist',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						self.LoadPlaylist();
						alert('success');
					}else{
						if(res.err_code == -1){
							alert(res.err);
						}else if(res.err_code == -2){
							alert(res.err);
						}else{
							alert(res.err);
						}
					}
				}
			});
		}
	};

	this.LoadPlaylist = function(){
		var req_data = {
			country_code: window._country_code,
			mine_only: true,
			open_only: false
		};

		$.ajax({
			url: '/cherry_api/get_playlist_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					console.log('res.playlist_list ' + res.playlist_list.length);
					self._playlist_list = res.playlist_list;
					self.DISP_playlist_list();
				}else{
					console.log('res.err_code ' + res.err_code);
					if(res.err_code == -1){
						//login required
					}else{
						alert(res.err);
					}
				}
			}
		});
	};

	this.DeletePlaylist = function(idx){
		if(confirm('Sure to delete?') == false){
			return;
		}

		var req_data = {
			playlist_uid: self._playlist_list[idx].playlist_uid
		};
		$.ajax({
			url: '/cherry_api/delete_playlist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.LoadPlaylist();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OpenEditPlaylist = function(idx){
		var user_id = window._auth_control.GetUserID();
		if(user_id == null || user_id == ''){
			alert('Sign in required');
			return;
		}
		self._my_playlist_edit_type = MY_PLAYLIST_EDIT_TYPE.UPDATE;
		$('#modal_my_playlist').modal('show');

		self._playlist_uid = self._playlist_list[idx].playlist_uid;
		self.GetPlaylistHashList(self._playlist_uid);

		$('#id_input_my_playlist_title').val(self._playlist_list[idx].title);
		$('#id_input_my_playlist_comment').val(self._playlist_list[idx].comment);

		if(self._playlist_list[idx].is_open == 'Y'){
			$('#id_checkbox_my_playlist_open').prop("checked", true);
		}else{
			$('#id_checkbox_my_playlist_open').prop("checked", false);
		}
	};

	this.GetPlaylistHashList = function(playlist_uid){
		console.log('GetPlaylistHashList ');
		var req_data = {
			playlist_uid: playlist_uid
		};
	
		$.ajax({
			url: '/cherry_api/get_playlist_hash_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._hash_list = res.hash_list;
					self.DISP_HashList();
				}else{
					alert(res.err);
				}
			}
		});	

	};

	/////////////////////////////////////////////////////////////

	this.DISP_playlist_list = function(){
		var display = '';
		if(self._is_edit_mode == true){
		}else{
			display = 'display:none';
		}

		var h = `
			<table class="table table-sm table-striped" style="margin: 0px">
			<tr>
			<th>Title</th>
			<th>Like</th>
			<th>Open</th>
			<th style="${display}"></th>
			</tr>
		`;

		for(var i=0 ; i<self._playlist_list.length ; i++){
			var p = self._playlist_list[i];
			var title_encoded = encodeURI(p.title);
			var on_click_title = `window._router.Go('/${window._country_code}/my_playlist_detail.go?pid=${p.playlist_uid}')`;
			var on_click_trash = `window._my_playlist_control.DeletePlaylist('${i}')`;
			var on_click_edit = `window._my_playlist_control.OpenEditPlaylist('${i}')`;

			h += `
			<tr>
				<td style="cursor:pointer" onClick="${on_click_title}">${p.title}</td>
				<td style="cursor:pointer" onClick="${on_click_title}">${p.like_count}</td>
				<td style="cursor:pointer" onClick="${on_click_title}">${p.is_open}</td>
				<td style="${display}">
					<button type="button" class="btn btn-light" onClick="${on_click_trash}">
						<i class="fas fa-trash-alt"></i>
					</button>
					<button type="button" class="btn btn-light" onClick="${on_click_edit}">
						<i class="fas fa-edit"></i>
					</button>
				</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_playlist_list').html(h);
	};

	this.DISP_HashList = function(){
		var h = ``;

		for(var i=0 ; i<self._hash_list.length ; i++){
			var hash = self._hash_list[i].hash;
			var on_click = `window._my_playlist_control.OnClick_DeleteHash(${i})`;
			h += `
			<span class="px-1 py-1">
				${hash}
				<span class="badge badge-sm border pointer" onClick="${on_click}">X</span>
			</span>
			`;
		}

		$('#id_div_my_playlist_hash_list').html(h);
	};
}