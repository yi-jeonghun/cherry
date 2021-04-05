$('document').ready(function(){
	$('#id_btn_add_ok').on('click', OnOKClicked);
	{
		$('#id_text_artist_name').on('keypress', OnEnterKeyPressed);
		$('#id_text_title').on('keypress', OnEnterKeyPressed);
		$('#id_text_video_id').on('keypress', OnEnterKeyPressed);
	}

	GetMusicList();
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