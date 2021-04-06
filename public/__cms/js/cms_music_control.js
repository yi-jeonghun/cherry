$('document').ready(function(){
	$('#id_btn_add_ok').on('click', OnOKClicked);
	{
		$('#id_text_artist_name').on('keypress', OnEnterKeyPressed);
		$('#id_text_title').on('keypress', OnEnterKeyPressed);
		$('#id_text_video_id').on('keypress', OnEnterKeyPressed);
	}
	{
		$('#id_text_artist_name').on('focusout', SearchMusic);
		$('#id_text_title').on('focusout', SearchMusic);
		$('#id_text_artist_name').on('focusout', SearchYoutube);
		$('#id_text_title').on('focusout', SearchYoutube);
	}

	{
		$('#id_text_video_id').on('focusout', TestVideoID);
	}

	$('#id_btn_stop').on('click', function(){
		console.log('stop ' );
		__yt_player.Stop();
	});

	// GetMusicList();
});

const EDIT_MODE = {
	ADD: 0,
	UPDATE: 1
};

var _music_list = [];
var _cur_mode = EDIT_MODE.ADD;
var _music_id_for_edit = -1;
var _music_id_for_update = null;

function OnEnterKeyPressed(e){
	if(e.keyCode == 13){
		if(_cur_mode == EDIT_MODE.ADD){
			AddMusic();
		}else if(_cur_mode == EDIT_MODE.UPDATE){
			UpdateMusic();
		}
	}
}

function OnOKClicked(){
	if(_cur_mode == EDIT_MODE.ADD){
		console.log('MODE ADD');
		AddMusic();
	}else if(_cur_mode == EDIT_MODE.UPDATE){
		console.log('MODE UPDATE');
		UpdateMusic();
	}
}

function TestVideoID(){
	var video_id = $('#id_text_video_id').val();
	video_id = UTIL_Escape(video_id);
	video_id = video_id.trim();
	if(video_id == ''){
		return null;
	}

	var idx = video_id.indexOf('watch?v=');
	if(idx != -1){
		video_id = video_id.substr(idx + 'watch?v='.length);
		$('#id_text_video_id').val(video_id);
	}
	__yt_player.LoadVideo(video_id);
}

function FormValidation(){
	var artist = $('#id_text_artist_name').val();
	artist = UTIL_Escape(artist);
	artist = artist.trim();
	if(artist == ''){
		alert('No artist');
		return null;
	}

	var title = $('#id_text_title').val();
	title = UTIL_Escape(title);
	title = title.trim();
	if(title == ''){
		alert('Enter title');
		return null;
	}

	var video_id = $('#id_text_video_id').val();
	video_id = UTIL_Escape(video_id);
	video_id = video_id.trim();
	if(video_id == ''){
		alert('Enter video ID');
		return null;
	}

	var idx = video_id.indexOf('watch?v=');
	if(idx != -1){
		video_id = video_id.substr(idx + 'watch?v='.length);
	}

	var music = {
		artist:   artist,
		title:    title,
		video_id: video_id
	};

	return music;	
}

function ClearForm(){
	$('#id_text_artist_name').val('');
	$('#id_text_title').val('');
	$('#id_text_video_id').val('');
}

function AddMusic(){
	var music = FormValidation();
	if(music == null){
		return;
	}

	$.ajax({
		url: '/cherry_api/add_music',
		type: 'POST',
		data: JSON.stringify(music),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				GetMusicList();
				alert('Success');
				ClearForm();
			}else{
				alert(res.err);
			}
		}
	});
}

function GetMusicList(){
	_music_list = [];

	$.ajax({
		url: '/cherry_api/get_music_list',
		type: 'GET',
		data: null,
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				_music_list = res.music_list;
				DisplayMusicList();
			}else{
				alert(res.err);
			}
		}
	});
}

function DisplayMusicList(){
	$('#id_div_music_list').empty();

	var h = '<table class="table table-sm">';
	h += '<tr>';
	h += '<th>ID</th>';
	h += '<th>Artist</th>';
	h += '<th>Title</th>';
	h += '<th>Video ID</th>';
	h += '<th></th>';
	h += '</tr>';
	for(var i=0 ; i<_music_list.length ; i++){
		var m = _music_list[i];
		h += '<tr>';
		h += '	<td>' + m.music_id + '</td>';
		h += '	<td>' + m.artist + '</td>';
		h += '	<td>' + m.title + '</td>';
		h += '	<td>' + m.video_id + '</td>';
		h += '	<td>';
		h += '		<span class="badge badge-primary" style="cursor:pointer" onclick="DeleteMusic('+m.music_id+')">';
		h += '			<i class="fas fa-trash-alt"></i>';
		h += '		</span>';
		h += '		<span class="badge badge-primary" style="cursor:pointer" onclick="OnEditMusic('+i+')">';
		h += '			<i class="fas fa-pencil-alt"></i>';
		h += '		</span>';
		h += '	</td>';
		h += '</tr>';
	}
	h += '</table>';

	$('#id_div_music_list').html(h);
}

function DeleteMusic(music_id){
	var answer = confirm('sure to delete?');
	if(answer == false){
		return;
	}

	var req_data = {
		music_id: music_id
	};

	$.ajax({
		url: '/cherry_api/delete_music',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				GetMusicList();
				alert('Success');
			}else{
				alert(res.err);
			}
		}
	});
}

function OnEditMusic(idx){
	_music_id_for_update = _music_list[idx].music_id;
	_cur_mode = EDIT_MODE.UPDATE;
	$('#id_text_artist_name').val(_music_list[idx].artist);
	$('#id_text_title').val(_music_list[idx].title);
	$('#id_text_video_id').val(_music_list[idx].video_id);
	$('#id_btn_add_ok').html('UPDATE');
}

function UpdateMusic(){
	var music = FormValidation();
	if(music == null){
		return;
	}

	var req_data = {
		music_id: _music_id_for_update,
		music:    music
	};

	console.log('req music_id ' + req_data.music_id);

	$.ajax({
		url: '/cherry_api/update_music',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				_music_id_for_update = null;
				_cur_mode = EDIT_MODE.ADD;
				$('#id_btn_add_ok').html('OK');
				alert('Success');
				ClearForm();
				GetMusicList();
			}else{
				alert(res.err);
			}
		}
	});
}

function SearchMusic(){
	var artist_name = $('#id_text_artist_name').val().trim();
	var title = $('#id_text_title').val().trim();
	var req_data = {
		artist_name: artist_name,
		title:       title
	};

	if(artist_name == '' && title == ''){
		return;
	}

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

				// console.log('list1 len ' + list1.length);
				// console.log('list2 len ' + list2.length);

				for(var i1=0 ; i1<list1.length ; i1++){
					var m1 = list1[i1];
					for(var i2=0 ; i2<list2.length ; i2++){
						var m2 = list2[i2];
						if(m1.music_id == m2.music_id){
							list2.splice(i2, 1);
							break;
						}
					}
				}
				// console.log('list2 len ' + list2.length);

				_music_list = list1.concat(list2);

				console.log('_music_list len ' + _music_list.length);
				DisplayMusicList();
			}else{
				alert(res.err);
			}
		}
	});
}

function SearchYoutube(){
	var artist_name = $('#id_text_artist_name').val().trim();
	var title = $('#id_text_title').val().trim();
	var keyword = artist_name + "+" + title;
	top.document.getElementById('id_iframe_youtube').src = "https://www.youtube.com/results?search_query="+keyword;
}