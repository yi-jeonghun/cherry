$('document').ready(function(){
	$('#id_btn_add_ok').on('click', AddMusic);
	{
		$('#id_text_artist_name').on('keypress', OnEnterKeyPressed);
		$('#id_text_title').on('keypress', OnEnterKeyPressed);
		$('#id_text_video_id').on('keypress', OnEnterKeyPressed);
	}

	GetMusicList();
});

function OnEnterKeyPressed(e){
	if(e.keyCode == 13){
		AddMusic();
	}
}

function AddMusic(){
	var artist = $('#id_text_artist_name').val();
	artist = UTIL_Escape(artist);
	artist = artist.trim();
	if(artist == ''){
		alert('No artist');
		return;
	}

	var title = $('#id_text_title').val();
	title = UTIL_Escape(title);
	title = title.trim();
	if(title == ''){
		alert('Enter title');
		return;
	}

	var video_id = $('#id_text_video_id').val();
	video_id = UTIL_Escape(video_id);
	video_id = video_id.trim();
	if(video_id == ''){
		alert('Enter video ID');
		return;
	}

	var idx = video_id.indexOf('watch?v=');
	if(idx != -1){
		video_id = video_id.substr(idx + 'watch?v='.length);
	}

	var music = {
		artist: artist,
		title: title,
		video_id: video_id
	};

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
				$('#id_text_artist_name').val('');
				$('#id_text_title').val('');
				$('#id_text_video_id').val('');
			}else{
				alert(res.err);
			}
		}
	});

	$('#id_modal_add').modal('hide');
}

function GetMusicList(){
	$.ajax({
		url: '/cherry_api/get_music_list',
		type: 'GET',
		data: null,
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				DisplayMusicList(res.music_list);
			}else{
				alert(res.err);
			}
		}
	});
}

function DisplayMusicList(music_list){
	$('#id_div_music_list').empty();

	var h = '<table class="table table-sm">';
	h += '<tr>';
	h += '<th>ID</th>';
	h += '<th>Artist</th>';
	h += '<th>Title</th>';
	h += '<th>Video ID</th>';
	h += '<th>Del</th>';
	h += '</tr>';
	for(var i=0 ; i<music_list.length ; i++){
		var m = music_list[i];
		h += '<tr>';
		h += '	<td>' + m.music_id + '</td>';
		h += '	<td>' + m.artist + '</td>';
		h += '	<td>' + m.title + '</td>';
		h += '	<td>' + m.video_id + '</td>';
		h += '	<td>';
		h += '		<span class="badge badge-primary" style="cursor:pointer" onclick="DeleteMusic('+m.music_id+')"> X </span>';
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