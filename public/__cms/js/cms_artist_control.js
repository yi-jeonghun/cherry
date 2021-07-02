$('document').ready(function(){
	window._artist_control = new ArtistControl().Init();
	var playlist_storage = new PlaylistStorage_Memory([]);
	window._cherry_player = new CherryPlayer().Init(playlist_storage);
});

const ARTIST_EDIT_MODE = {
	NEW: 0,
	EDIT: 1
};

const DIFFERENT_NAME_EDIT_MODE = {
	NEW: 0,
	EDIT: 1
};

const ARTIST_LIST_TYPE = {
	FAVORITE:0,
	SEARCH:1
};

function ArtistControl(){
	var self = this;
	this._artist_name = null;
	this._selected_artist_uid = null;
	this._youtube = null;
	this._youtube_searched_video_list = [];
	this._artist_edit_mode = ARTIST_EDIT_MODE.NEW;
	this._music_uid_to_edit = null;
	this._artist_list_type = ARTIST_LIST_TYPE.FAVORITE;
	this._artist_searched_list = [];
	this._member_artist_searched_list = [];
	this._cms_favorite_artist_list = [];
	this._artist_info = null;
	this._member_list = [];
	this._artist_diff_name_list = [];
	this._diff_name_edit_mode = DIFFERENT_NAME_EDIT_MODE.NEW;
	this._diff_name_artist_uid = null;
	this._music_list = [];
	this._working_music_idx = null;

	this.Init = function(){
		self._youtube = new YoutubeSearchControl();
		console.log('init  ArtistControl');
		self.InitComponentHandle();

		var tmp = window.localStorage.getItem('CMS_FAVORITE_ARTIST_LIST');
		console.log('tmp ' + tmp);
		if(tmp == null){
			self._cms_favorite_artist_list = [];
		}else{
			self._cms_favorite_artist_list = JSON.parse(tmp);
		}
		self.DISP_FavoriteArtistList();

		return self;
	};

	this.InitComponentHandle = function(){
		console.log('InitComponentHandle ');
		$('#id_input_artist_keyword').keyup(self.OnInputArtistKeyword);
		$('#id_btn_search_youtube').on('click', self.OnClick_SearchYoutube1);
		$('#id_btn_cms_artist_add').on('click', self.OnClick_id_btn_cms_artist_add);
		$('#id_btn_cms_artist_edit_ok').on('click', self.OnClick_id_btn_cms_artist_edit_ok);
		$('.slider_line_div').on('mousedown', self.OnTimeBarClick);
		$('#id_btn_cms_artist_music_edit_ok').on('click', self.OnClick_id_btn_cms_artist_music_edit_ok);
		$('#id_nav_cms_artist_list_favorite').on('click', self.OnChangeTab_Favorite);
		$('#id_nav_cms_artist_list_search').on('click', self.OnChangeTab_Search);
		$('#id_btn_cms_artist_diff_name_add').on('click', self.OnClick_id_btn_cms_artist_diff_name_add);
		$('#id_btn_cms_artist_diff_name_edit_ok').on('click', self.OnClick_id_btn_cms_artist_diff_name_edit_ok);
		$('#id_btn_cms_artist_edit_artist').on('click', self.OnClick_id_btn_cms_artist_edit_artist);
		$('#id_btn_cms_artist_delete_artist').on('click', self.OnClick_id_btn_cms_artist_delete_artist);
		$('#id_checkbox_cms_artist_is_various').on('click', self.OnClick_id_checkbox_cms_artist_is_various);
		$('#id_input_cms_artist_member_artist').keyup(self.SearchMemberArtist);;
		$('#id_btn_cms_artist_lyrics_ok').on('click', self.OnClick_LyricsOK);
	};

	///////////////////////////////////////////////////////////////////////////////

	this.OnInputArtistKeyword = function(){
		$('#id_div_cms_artist_search_list').empty();

		var keyword = $('#id_input_artist_keyword').val().trim();
		console.log('keyword ' + keyword);
		if(keyword == ''){
			return;
		}

		var req_data = {
			keyword: keyword
		};

		$.ajax({
			url: '/cherry_api/search_artist_like',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._artist_searched_list = res.artist_list;
					self.DISP_SearchedArtistList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.OnChooseArtist = function(artist_uid){
		$('#id_div_music_list').empty();
		self._selected_artist_uid = artist_uid;
		self.GetArtistInfo();
		self.GetVAMemberList();
		self.GetArtistDiffNameList();
		self.GetMusicListOfArtist();
	};

	this.OnClick_SearchYoutubeFromList = function(idx){
		var title = self._music_list[idx].title;
		$('#id_input_music_search_keyword').val(title);
		self.OnClick_SearchYoutube1();
	};

	this.OnClick_SearchYoutube1 = function(){
		var is_next = false;
		self.OnClickSearchYoutube(is_next);
	};

	this.OnClick_NextPageSearch = function(){
		var is_next = true;
		self.OnClickSearchYoutube(is_next);
	};

	this.OnClickSearchYoutube = function(is_next){
		var title = $('#id_input_music_search_keyword').val().trim();
		if(title == ''){
			return;
		}

		var keyword = self._artist_name + " + " + title;
		if(is_next == false){
			self._youtube_searched_video_list = [];
		}
		self._youtube.Search(keyword, is_next, self.DISP_YoutubeSearchResult, self.DISP_YoutubeVideoInfo);
	};

	this.OnClick_id_btn_cms_artist_add = function(){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert('Choose DJ');
			return;
		}
		
		self._artist_edit_mode = ARTIST_EDIT_MODE.NEW;
		$('#id_input_cms_artist_name').val('');
		$('#id_modal_cms_artist_edit').modal('show');
	};

	this.OnClick_id_btn_cms_artist_edit_ok = function(){
		var artist_name = $('#id_input_cms_artist_name').val().trim();
		if(artist_name == ''){
			alert('name empty');
			return;
		}

		if(self._artist_edit_mode == ARTIST_EDIT_MODE.NEW){
			self.FindOrAddArtist(artist_name);
		}else if(self._artist_edit_mode == ARTIST_EDIT_MODE.EDIT){
			var req_data = {
				artist_uid: self._selected_artist_uid,
				name: artist_name
			};
	
			$.ajax({
				url: '/__cms_api/update_artist_info',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						$('#id_modal_cms_artist_edit').modal('hide');
						self.GetArtistInfo();
					}else{
						alert(res.err);
					}
				}
			});	
		}
	};

	this.OnTimeBarClick = function(e){
		var ele = $('.slider_line_div');
		// var left = ele.position().left;
		var left = ele.offset().left;

		var width = ele.width();
		var click_x = e.pageX;

		var x = click_x - left;
		console.log('left ' + left + ' width ' + width + ' x ' + click_x);
		console.log('x ' + x);

		var percent = (x / width) * 100;
		console.log('percent ' + percent);
		window._cherry_player.SeekToPercent(percent);
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

	this.OnClick_MusicEdit = function(idx){
		var m = self._music_list[idx];
		self._music_uid_to_edit = m.music_uid;
		$('#id_input_cms_artist_music_title').val(m.title);
		$('#id_input_cms_artist_music_video_id').val(m.video_id);
		$('#id_input_cms_artist_music_artist_uid').val(m.artist_uid);
		$('#id_modal_cms_artist_music_edit').modal('show');
	};

	this.OnClick_MusicDelete = function(idx){
		var m = self._music_list[idx];
		if(confirm('Sure to Delete?\n' + m.title) == false){
			return;
		}

		var req_data = {
			music_uid: m.music_uid
		};
		$.ajax({
			url: '/cherry_api/delete_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetMusicListOfArtist();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_id_btn_cms_artist_music_edit_ok = function(){
		var title = $('#id_input_cms_artist_music_title').val().trim();
		var video_id = $('#id_input_cms_artist_music_video_id').val().trim();
		var artist_uid = $('#id_input_cms_artist_music_artist_uid').val().trim();

		if(title == ''){
			alert('title empty');
			return;
		}

		if(video_id == ''){
			alert('video id empty');
			return;
		}

		if(artist_uid == ''){
			alert('Artist UID empty');
			return;
		}

		var req_data = {
			music_uid: self._music_uid_to_edit,
			video_id:   video_id, 
			title:      title,
			artist_uid: artist_uid
		};
		$.ajax({
			url: '/__cms_api/update_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.OnChooseArtist(self._selected_artist_uid);
					$('#id_modal_cms_artist_music_edit').modal('hide');
				}else{
					alert(res.err);
				}
			}
		});
	};
	
	this.OnChangeTab_Favorite = function(){
		self.OnChangeTab(ARTIST_LIST_TYPE.FAVORITE);
	};

	this.OnChangeTab_Search = function(){
		self.OnChangeTab(ARTIST_LIST_TYPE.SEARCH);
	};

	this.OnChangeTab = function(list_type){
		self._artist_list_type = list_type;

		$('#id_nav_cms_artist_list_favorite').removeClass('active');
		$('#id_nav_cms_artist_list_search').removeClass('active');
		
		if(self._artist_list_type == ARTIST_LIST_TYPE.FAVORITE){
			$('#id_nav_cms_artist_list_favorite').addClass('active');
			$('#id_div_cms_artist_favorites_list').show();
			$('#id_div_cms_artist_search').hide();
		}else if(self._artist_list_type == ARTIST_LIST_TYPE.SEARCH){
			$('#id_nav_cms_artist_list_search').addClass('active');
			$('#id_div_cms_artist_favorites_list').hide();
			$('#id_div_cms_artist_search').show();
		}
	};

	this.OnChoose_FavoriteArtist = function(artist_uid, name){
		self._cms_favorite_artist_list.push({
			artist_uid: artist_uid,
			name: name
		});
		window.localStorage.setItem('CMS_FAVORITE_ARTIST_LIST', JSON.stringify(self._cms_favorite_artist_list));
		self.DISP_SearchedArtistList();
		self.DISP_FavoriteArtistList();
	};

	this.OnChoose_FavoriteArtist_Del = function(artist_uid){
		for(var i=0 ; i<self._cms_favorite_artist_list.length ; i++){
			if(self._cms_favorite_artist_list[i].artist_uid == artist_uid){
				self._cms_favorite_artist_list.splice(i, 1);
				break;
			}
		}

		window.localStorage.setItem('CMS_FAVORITE_ARTIST_LIST', JSON.stringify(self._cms_favorite_artist_list));
		self.DISP_SearchedArtistList();
		self.DISP_FavoriteArtistList();
	};

	this.OnClick_id_btn_cms_artist_diff_name_add = function(){
		if(self._selected_artist_uid == null || self._selected_artist_uid == ''){
			alert('choose artist first');
			return;
		}
		self._diff_name_edit_mode = DIFFERENT_NAME_EDIT_MODE.NEW;
		$('#id_input_cms_artist_diff_name').val('');
		$('#id_modal_cms_artist_diff_name_edit').modal('show');
	};

	this.OnClick_EditDiffName = function(idx){
		self._diff_name_edit_mode = DIFFERENT_NAME_EDIT_MODE.EDIT;
		self._diff_name_artist_uid = self._artist_diff_name_list[idx].artist_uid;
		$('#id_input_cms_artist_diff_name').val(self._artist_diff_name_list[idx].name);
		$('#id_modal_cms_artist_diff_name_edit').modal('show');
	};

	this.OnClick_id_btn_cms_artist_diff_name_edit_ok = function(){
		if(self._selected_artist_uid == null || self._selected_artist_uid == ''){
			alert('choose artist first');
			return;
		}

		var diff_name = $('#id_input_cms_artist_diff_name').val().trim();
		if(diff_name == ''){
			alert('name empty');
			return;
		}

		if(self._diff_name_edit_mode == DIFFERENT_NAME_EDIT_MODE.NEW){
			var req_data = {
				org_artist_uid:   self._selected_artist_uid,
				artist_diff_name: diff_name
			};
			$.ajax({
				url: '/__cms_api/add_artist_diff_name',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						$('#id_modal_cms_artist_diff_name_edit').modal('hide');
						self.GetArtistDiffNameList();
					}else{
						alert(res.err);
					}
				}
			});	
		}else if(self._diff_name_edit_mode == DIFFERENT_NAME_EDIT_MODE.EDIT){
			var req_data = {
				artist_uid:   self._diff_name_artist_uid,
				artist_diff_name: diff_name
			};
			$.ajax({
				url: '/__cms_api/update_artist_diff_name',
				type: 'POST',
				data: JSON.stringify(req_data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: function (res) {
					if(res.ok){
						$('#id_modal_cms_artist_diff_name_edit').modal('hide');
						self.GetArtistDiffNameList();
					}else{
						alert(res.err);
					}
				}
			});	
		}
	};

	this.OnClick_DeleteDiffName = function(artist_uid){
		var req_data = {
			artist_uid:   artist_uid
		};
		$.ajax({
			url: '/__cms_api/delete_artist_diff_name',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetArtistDiffNameList();
				}else{
					alert(res.err);
				}
			}
		});		
	};

	this.OnClick_id_btn_cms_artist_edit_artist = function(){
		if(self._selected_artist_uid == null){
			alert('choose artist first');
			return;
		}

		self._artist_edit_mode = ARTIST_EDIT_MODE.EDIT;
		$('#id_input_cms_artist_name').val(self._artist_name);
		$('#id_modal_cms_artist_edit').modal('show');
	};

	this.OnClick_id_btn_cms_artist_delete_artist = function(){
		if(self._selected_artist_uid == null){
			alert('choose artist first');
			return;
		}

		if(self._music_list.length > 0){
			alert('music list not empty');
			return;
		}

		if(confirm('Artist will be deleted.') == false){
			return;
		}

		var req_data = {
			artist_uid: self._selected_artist_uid
		};

		$.ajax({
			url: '/cherry_api/delete_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.OnChoose_FavoriteArtist_Del(self._selected_artist_uid);
					self._selected_artist_uid = null;
					self._music_list = [];
					$('#id_div_music_list').html('');
					$('#id_label_cms_artist_name').html('');
					$('#id_label_cms_artist_artist_uid').html('');
					$('#id_label_cms_artist_is_various').html('');
					$('#id_div_cms_artist_member_list').html('');
					$('#id_div_cms_artist_diff_name_list').html('');
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_id_checkbox_cms_artist_is_various = function(){
		if(self._selected_artist_uid == null){
			return;
		}
		var is_various = $('#id_checkbox_cms_artist_is_various').prop('checked');

		var req_data = {
			artist_uid: self._selected_artist_uid,
			is_various: is_various
		};
		$.ajax({
			url: '/__cms_api/update_artist_is_various',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetArtistInfo();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_Modal_AddMemberArtist = function(){
		console.log('OnClick_Modal_AddMemberArtist ' );
		$('#id_modal_cms_artist_add_member_artist').modal('show');
	};

	this.OnClick_DeleteMemberArtist = function(member_artist_uid){
		var req_data = {
			artist_uid: self._selected_artist_uid,
			member_artist_uid: member_artist_uid
		};
		
		$.ajax({
			url: '/cherry_api/delete_va_artist_member',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetVAMemberList();
				}else{
					alert(res.err);
				}
			}
		});

	};

	this.OnClick_LyricsEdit = function(idx){
		self._working_music_idx = idx;
		var title = self._music_list[idx].title;
		var artist = self._music_list[idx].artist;
		var music_uid = self._music_list[idx].music_uid;

		$('#id_modal_cms_artist_lyrics_title').html(title);
		$('#id_modal_cms_artist_lyrics_artist').html(artist);
		$('#id_input_cms_artist_lyrics').val('');
		$('#id_modal_cms_artist_lyrics').modal('show');

		var req = {music_uid:music_uid};
		$.ajax({
			url:  '/cherry_api/get_lyrics',
			type: 'POST',
			data: JSON.stringify(req),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					if(res.lyrics_info.registered){
						$('#id_input_cms_artist_lyrics').val(res.lyrics_info.text);
					}
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.OnClick_LyricsOK = function(){
		var music_uid = self._music_list[self._working_music_idx].music_uid;
		var has_lyrics = self._music_list[self._working_music_idx].has_lyrics;
		var text = $('#id_input_cms_artist_lyrics').val();
		var req = {
			has_lyrics:has_lyrics,
			dj_user_id: window._dj_selector.API_Get_Choosed_DJs_UserID(),
			music_uid: music_uid,
			text: text
		};

		POST('/cherry_api/update_lyrics', req, (res)=>{
			if(res.ok){
				alert('success');
				$('#id_modal_cms_artist_lyrics').modal('hide');
				self._music_list[self._working_music_idx].has_lyrics = 'Y';
				self.DISP_MusicList();
			}else{
				alert(res.err);
			}
		});
	};

	////////////////////////////////////////////////////////////////////////////////////

	this.FindOrAddArtist = function(artist_name){
		var req_data = {
			artist_name: artist_name.trim()
		};
		$.ajax({
			url: '/__cms_api/find_or_add_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.OnChooseArtist(res.artist_uid);
					$('#id_modal_cms_artist_edit').modal('hide');
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.GetArtistInfo = function(){
		var req_data = {
			artist_uid: self._selected_artist_uid
		};

		$.ajax({
			url: '/__cms_api/get_artist_info_by_artist_uid',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._artist_info = res.artist_info;
					self.DISP_ArtistInfo();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.GetVAMemberList = function(){
		var req_data = {
			artist_uid: self._selected_artist_uid
		};

		$.ajax({
			url: '/cherry_api/get_va_member_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._member_list = res.member_list;
					self.DISP_MemberList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.GetArtistDiffNameList = function(){
		var req_data = {
			artist_uid: self._selected_artist_uid
		};

		$.ajax({
			url: '/cherry_api/get_artist_diff_name_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._artist_diff_name_list = res.artist_diff_name_list;
					self.DISP_DiffNameList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.GetMusicListOfArtist = function(){
		var req_data = {
			artist_uid: self._selected_artist_uid
		};

		$.ajax({
			url: '/cherry_api/fetch_music_list_by_artist_uid',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list = res.music_list;
					self.DISP_MusicList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.AutoMusicRegisterProcess = function(video_id){
		var dj_user_id = window._dj_selector.API_Get_Choosed_DJs_UserID();
		if(dj_user_id == null){
			alert("Please Choose DJ");
			return;
		}

		console.log('video_id ' + video_id);
		var title = $('#id_input_music_search_keyword').val().trim();

		var req_data = {
			dj_user_id: dj_user_id,
			music:{
				artist_uid: self._selected_artist_uid,
				title:     title,
				video_id:  video_id
			}
		};

		$.ajax({
			url: '/__cms_api/add_music',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					alert('success');
					self.GetMusicListOfArtist();
				}else{
					console.log('res.err_code ' + res.err_code);
					if(res.err_code == -2){
						alert(TR(L_SIGN_IN_REQUIRED));
					}else if(res.err_code == -3){
						alert(TR(L_SAME_TITLE_EXISTS));
					}else if(res.err_code == -4){
						alert(TR(L_SAME_VIDEO_EXISTS));
					}else{
						alert(res.err_msg);
					}
				}
			}
		});
	};

	this.SearchMemberArtist = function(){
		var keyword = $('#id_input_cms_artist_member_artist').val().trim();
		if(keyword == ''){
			return;
		}

		console.log('keyword ' + keyword);

		var req_data = {
			keyword: keyword
		};

		$.ajax({
			url: '/cherry_api/search_artist_like',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					// console.log('res.artist_list ' + res.artist_list.length);
					self._member_artist_searched_list = res.artist_list;
					self.DISP_SearchedMemberArtistList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.AddMemberArtist = function(member_artist_uid){
		var req_data = {
			artist_uid: self._selected_artist_uid,
			member_artist_uid: member_artist_uid
		};
		
		$.ajax({
			url: '/__cms_api/add_various_artist',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self.GetVAMemberList();
				}else{
					alert(res.err);
				}
			}
		});
	};

	this.PlayVideo = function(idx){
		var video_id = self._music_list[idx].video_id;
		console.log('video_id ' + video_id);
		var music = {
			video_id: video_id
		};
		window._cherry_player.TryMusic(music);
	};

	//////////////////////////////////////////////////////////////////////////
	
	this.DISP_FavoriteArtistList = function(){
		$('#id_div_cms_artist_favorites_list').empty();
		var h = `
		<table class="table table-sm table-striped small">
		<tr>
			<th>ID</th>
			<th>Name</th>
			<th></th>
		</tr>
		`;

		for(var i=0 ; i<self._cms_favorite_artist_list.length ; i++){
			var a = self._cms_favorite_artist_list[i];
			var on_click = `window._artist_control.OnChooseArtist('${a.artist_uid}')`;
			var on_click_check = `window._artist_control.OnChoose_FavoriteArtist_Del('${a.artist_uid}')`;

			h += `
			<tr>
				<td>${a.artist_uid}</td>
				<td onClick="${on_click}" style="cursor:pointer">${a.name}</td>
				<td onClick="${on_click_check}" style="cursor:pointer">
					<i class="fas fa-check" style="color:red"></i>
				</td>
			</tr>
			`;
		}

		$('#id_div_cms_artist_favorites_list').html(h);
	};

	this.DISP_SearchedArtistList = function(){
		$('#id_div_cms_artist_search_list').empty();

		var h = `
		<table class="table table-sm table-striped small">
		<tr>
			<th>ID</th>
			<th>VA</th>
			<th>Name</th>
			<th></th>
		</tr>
		`;
		for(var i=0 ; i<self._artist_searched_list.length ; i++){
			var a = self._artist_searched_list[i];
			var artist_uid = a.artist_uid
			var diff_name_color = '';
			if(a.is_diff_name == 'Y'){
				artist_uid = a.org_artist_uid;
				diff_name_color = 'color:#aaaaaa'
			}
			var on_click = `window._artist_control.OnChooseArtist('${artist_uid}')`;
			var on_click_check = `window._artist_control.OnChoose_FavoriteArtist('${artist_uid}', '${a.name}')`;
			var check_color = '#aaaaaa';
			for(var k=0 ; k<self._cms_favorite_artist_list.length ; k++){
				console.log('fav uid ' + self._cms_favorite_artist_list[k].artist_uid + ' ' + artist_uid);
				if(self._cms_favorite_artist_list[k].artist_uid == artist_uid){
					console.log('is favoite ' );
					check_color = 'red';
					on_click_check = `window._artist_control.OnChoose_FavoriteArtist_Del('${artist_uid}')`;
					break;
				}
			}

			console.log('check_color ' + check_color);
			h += `
			<tr>
				<td>${artist_uid}</td>
				<td>${a.is_various}</td>
				<td onClick="${on_click}" style="cursor:pointer; ${diff_name_color}">${a.name}</td>
				<td style="color:${check_color}">
					<i class="fas fa-check" onClick="${on_click_check}" style="cursor:pointer"></i>
				</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_cms_artist_search_list').html(h);
	};

	this.DISP_MusicList = function(){
		var h = `
		<table class="table table-sm table-striped small">
		<tr>
			<th>Title</th>
			<th>DN</th>
			<th>MID</th>
			<th>VID</th>
			<th></th>
			<th>User</th>
			<th>L</th>
			<th></th>
		</tr>
		`;

		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			var music_uid = m.music_uid;
			var title_color = '';
			if(m.is_diff_name == 'Y'){
				music_uid = m.org_music_uid;
				title_color = 'color:gray'
			}
			var on_edit_click = `window._artist_control.OnClick_MusicEdit(${i})`;
			var on_trash_click = `window._artist_control.OnClick_MusicDelete(${i})`;
			var on_click_lyrics = `window._artist_control.OnClick_LyricsEdit(${i})`;
			var on_click_play = `window._artist_control.PlayVideo(${i})`;
			var on_click_youtube = `window._artist_control.OnClick_SearchYoutubeFromList(${i})`;
			var lyrics_badge_color = 'badge-danger';
			if(m.has_lyrics == 'Y'){
				lyrics_badge_color = 'border';
			}

			h += `
			<tr>
				<td style="${title_color}">${m.title}</td>
				<td>${m.is_diff_name}</td>
				<td>${music_uid}</td>
				<td>${m.video_id}</td>
				<td>
					<i class="fas fa-play border" onClick="${on_click_play}" style="cursor:pointer"></i>
					<i class="fas fa-search border" onClick="${on_click_youtube}" style="cursor:pointer"></i>
				</td>
				<td>${m.user_name}</td>
				<td>
			`;
			
			if(m.is_diff_name == 'N'){
			h += `<i class="badge badge-sm ${lyrics_badge_color} pointer" onClick="${on_click_lyrics}">${m.has_lyrics}</i>`;
			}
		
			h += `
				</td>
				<td>
					<i class="fas fa-pen border" onClick="${on_edit_click}" style="cursor:pointer"></i>
					<i class="fas fa-trash-alt border" onClick="${on_trash_click}" style="cursor:pointer"></i>
				</td>
			</tr>
			`;
		}

		$('#id_div_music_list').html(h);
	};

	this.DISP_YoutubeSearchResult = function(video_list){
		var searching_title = $('#id_input_music_search_keyword').val().trim();
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
			title = title.replace(searching_title, '<u style="color:red">'+searching_title+'</u>');
		
			var channel = video.channel;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;
			var id_video_duration_str = `id_video_duration-${video_id}`;
			var id_youtube_video_row_str = `id_youtube_video_row-${video_id}`;
			var OnChooseVideo = `window._artist_control.OnChooseVideo('${video_id}')`;
			var OnOkClick = `window._artist_control.AutoMusicRegisterProcess('${video_id}')`;

			h += `
			<div class="row" style="margin-top:10px; border-bottom: 1px solid #eeeeee" id="${id_youtube_video_row_str}">
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
					<button class="btn btn-sm btn-primary" type="button" onClick="${OnOkClick}">Add</button>
				</div>
			</div>
			`;
		}

		h += `
			<div class="text-center pointer border bg-primary" onClick="window._artist_control.OnClick_NextPageSearch()" style="height:50px; color:white">
				More
			</div>
		</div>
		`;

		$('#id_div_youtube_search_result').html(h);		
	};

	this.DISP_YoutubeVideoInfo = function(video_list){
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

	this.DISP_ArtistInfo = function(){
		self._artist_name = self._artist_info.name;
		$('#id_label_cms_artist_name').html(self._artist_info.name);
		$('#id_label_cms_artist_artist_uid').html(self._artist_info.artist_uid);
		if(self._artist_info.is_various == 'Y'){
			$('#id_label_cms_artist_is_various').html('Y');
			$('#id_checkbox_cms_artist_is_various').prop('checked', true);
		}else{
			$('#id_label_cms_artist_is_various').html('N');
			$('#id_checkbox_cms_artist_is_various').prop('checked', false);
		}

		self.DISP_DiffNameList();
	};

	this.DISP_MemberList = function(){
		if(self._member_list == null){
			$('#id_div_cms_artist_member_list').html('');
			return;
		}

		var h = '';

		for(var i=0 ; i<self._member_list.length ; i++){
			var m = self._member_list[i];
			var on_click = `window._artist_control.OnChooseArtist('${m.artist_uid}')`;
			var on_click_delete = `window._artist_control.OnClick_DeleteMemberArtist('${m.artist_uid}')`;

			h += `
				<div class="d-flex">
					<div class="col-7 pl-2" style="cursor:pointer" onClick="${on_click}">${m.name}</div>
					<div class="col-4" style="font-size:0.8em">${m.artist_uid}</div>
					<div class="col-1">
						<span class="badge badge-sm border" style="cursor:pointer" onClick="${on_click_delete}">
							<i class="fas fa-trash-alt"></i>
						</span>
					</div>
				</div>
			`;
		}

		$('#id_div_cms_artist_member_list').html(h);
	};

	this.DISP_DiffNameList = function(){
		var h = ``;
		
		for(var i=0 ; i<self._artist_diff_name_list.length ; i++){
			var da = self._artist_diff_name_list[i];
			var on_click_trash = `window._artist_control.OnClick_DeleteDiffName('${da.artist_uid}')`;
			var on_click_edit = `window._artist_control.OnClick_EditDiffName(${i})`;

			h += `
			<div class="d-flex">
				<div class="col-8">${da.name}</div>
				<div class="col-4 text-right d-flex">
					<span class="badge badge-sm border" style="cursor:pointer" onClick="${on_click_trash}">
						<i class="fas fa-trash-alt"></i>
					</span>
					<span class="badge badge-sm border" style="cursor:pointer" onClick="${on_click_edit}">
						<i class="fas fa-pen"></i>
					</span>
				</div>
			</div>
			`;
		}
		
		$('#id_div_cms_artist_diff_name_list').html(h);
	};

	this.DISP_SearchedMemberArtistList = function(){
		console.log('self._member_artist_searched_list ' + self._member_artist_searched_list.length);
		var h = `
		<table class="table table-sm table-stripped small">
		<tr>
			<th>AID</th>
			<th>Name</th>
			<th>DN</th>
		</tr>
		`;
		for(var i=0 ; i<self._member_artist_searched_list.length ; i++){
			var m = self._member_artist_searched_list[i];
			var artist_uid = m.artist_uid;
			if(m.is_diff_name == 'Y'){
				artist_uid = m.org_artist_uid;
			}
			var on_click = `window._artist_control.AddMemberArtist('${artist_uid}')`;
			h += `
			<tr onClick="${on_click}" style="cursor:pointer">
				<td>${artist_uid}</td>
				<td>${m.name}</td>
				<td>${m.is_diff_name}</td>
			</tr>
			`;
		}
		$('#id_div_cms_artist_member_searched_list').html(h);
	};
}