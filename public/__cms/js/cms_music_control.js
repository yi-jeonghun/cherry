$('document').ready(function(){
	$('#id_btn_add_ok').on('click', AddMusic);
	$('#id_btn_artist_search').on('click', SearchArtist);
	$('#id_text_artist_name').on('focusout', SearchArtist);

	GetMusicList();
});

var _searched_artist_id = null;

function SearchArtist(){
	var artist_name = $('#id_text_artist_name').val();
	if(artist_name == ''){
		$('#id_label_artist_search_result').html('Empty');
		return;
	}
	var data = {
		artist_name: artist_name
	};

	$.ajax({
		url: '/cherry_api/search_artist',
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				if(res.data.found){
					$('#id_label_artist_search_result').html('Found');
					console.log('res.artist_id ' + res.data.artist_id);
					_searched_artist_id = res.data.artist_id;
				}else{
					$('#id_label_artist_search_result').html('Not Found');
					_searched_artist_id = null;
				}
			}else{
				alert(res.err);
			}
		}
	});	
}

function AddMusic(){
	var artist = $('#id_text_artist_name').val();
	artist = artist.trim();
	if(artist == ''){
		alert('No artist');
		return;
	}

	var title = $('#id_text_title').val();
	title = title.trim();
	if(title == ''){
		alert('Enter title');
		return;
	}

	var video_id = $('#id_text_video_id').val();
	video_id = video_id.trim();
	if(video_id == ''){
		alert('Enter video ID');
		return;
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
	h += '<th>Artist</th>';
	h += '<th>Title</th>';
	h += '<th>Del</th>';
	h += '</tr>';
	for(var i=0 ; i<music_list.length ; i++){
		var m = music_list[i];
		h += '<tr>';
		h += '	<td>' + m.artist + '</td>';
		h += '	<td>' + m.title + '</td>';
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