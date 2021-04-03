$('document').ready(function(){
	$('#id_btn_add_ok').on('click', AddCollection);
	$('#id_btn_search_artist').on('click', SearchMusicByArtist);
	$('#id_btn_search_title').on('click', SearchMusicTitle);
	$('#id_btn_save').on('click', Save);
});

const COLLECTION_TYPE = {
	KPOP:0,
	BILLBOARD:1
};

var _collection_type = -1;
var _top_100 = [];
var _searched_music_list = [];

function Save(){
	if(_collection_type == -1){
		alert('select collection type first');
		return;
	}

	$.ajax({
		url: '/cherry_api/collection/save?type='+_collection_type,
		type: 'POST',
		data: JSON.stringify(_top_100),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				SaveComplete();
			}else{
				alert(res.err);
			}
		}
	});
}

function AddCollection(){
	var collection_name = $('#id_text_collection_name').val();
	if(collection_name == ''){
		alert('empty collection name');
		return;
	}

	var data = {
		collection_name: collection_name
	};

	$.ajax({
		url: '/cherry_api/add_collection',
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				alert('Success');
			}else{
				alert(res.err);
			}
		}
	});

	$('#id_modal_add').modal('hide');
}

function GetCollectionList(){
	$.ajax({
		url: '/cherry_api/get_collection_list',
		type: 'GET',
		data: null,
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				DisplayCollectionList(res.collection_list);
			}else{
				alert(res.err);
			}
		}
	});	
}

function DisplayCollectionList(collection_list){
	var html = '';
	for(var i=0 ; i<collection_list.length ; i++){
		html += '<div class="col-12">' + collection_list[i].name + '</div>';
	}
	$('#id_div_collection_list').html(html);
}

function LoadKPopTop100(){
	$('#id_link_kpop_top_100').css("background-color", "gray");
	$('#id_link_billboard_top_100').css("background-color", "white");
	LoadTop100(COLLECTION_TYPE.KPOP);
	_collection_type = COLLECTION_TYPE.KPOP;
	SaveComplete();
}

function LoadBillboardTop100(){
	$('#id_link_kpop_top_100').css("background-color", "white");
	$('#id_link_billboard_top_100').css("background-color", "gray");
	LoadTop100(COLLECTION_TYPE.BILLBOARD);
	_collection_type = COLLECTION_TYPE.BILLBOARD;
	SaveComplete();
}

function LoadTop100(type){
	$.ajax({
		url: '/cherry_api/collection/get_top_100?type='+type,
		type: 'GET',
		data: null,
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				// DisplaySearchedMusicList(res.music_list);
				console.log('res.music_list length ' + res.music_list.length);
				_top_100 = res.music_list;
				DisplayTop100();
				// console.log('music list ' + res.music_list);
			}else{
				alert(res.err);
			}
		}
	});
}

function DisplayTop100(){
	$('#id_div_music_list').empty();
	var h = '<table class="table table-sm table-striped">';
	h += '<tr>';
	h += '	<th>No.</th>';
	h += '	<th>Artist</th>';
	h += '	<th>Title</th>';
	h += '	<th>Del</th>';
	h += '</tr>';

	for(var i=0 ; i<_top_100.length ; i++){
		var m = _top_100[i];
		h += '<tr>';
		h += '	<td>';
		h += '		<span class="input-group input-group-sm">';
		h += '			<input onChange="EditRank('+i+', this)" style="width:5px" class="form-control" type="text" value="' + m.ranking +'">';
		h += '		</span>';
		h += '	</td>';
		h += '	<td>' + m.artist + '</td>';
		h += '	<td>' + m.title + '</td>';
		h += '	<td>' + '<span class="badge badge-primary" style="cursor:pointer" onclick="DeleteMusic(' + i + ')">X</span>' + '</td>';
		h += '</tr>';
	}
	h += '</table>';

	$('#id_div_music_list').html(h);
}

function EditRank(idx, obj){
	var new_rank = obj.value;
	if(isNaN(new_rank)){
		obj.value = idx+1;
		return;
	}

	if(new_rank < 1){
		obj.value = idx+1;
		return;
	}

	if(new_rank > _top_100.length){
		obj.value = _top_100.length;
		new_rank = _top_100.length;
	}

	var cur_rank = idx + 1;

	var music_copy = {
		ranking:  _top_100[idx].ranking,
		music_id: _top_100[idx].music_id,
		artist:   _top_100[idx].artist,
		title:    _top_100[idx].title
	};

	if(new_rank < cur_rank){
		//위로 올라가는 경우
		//지우기
		_top_100.splice(idx, 1);
		//추가하기
		_top_100.splice(new_rank-1, 0, music_copy);
	}else{
		//아래로 내려가는 경우
		console.log('아래로 ');
		//추가하기
		_top_100.splice(new_rank, 0, music_copy);
		//지우기
		_top_100.splice(idx, 1);
	}

	ReOrderRank();
	NeedToSave();
	DisplayTop100();
}

function DeleteMusic(idx){
	_top_100.splice(idx, 1);
	ReOrderRank();
	NeedToSave();
	DisplayTop100();
}

function ReOrderRank(){
	for(var i=0 ; i<_top_100.length ; i++){
		var m = _top_100[i];
		m.ranking = i+1;
	}
}

function SearchMusicByArtist(){
	var keyword = $('#id_text_keyword').val();
	console.log('keyword ' + keyword);
	if(keyword == ''){
		alert('Keyword Empty');
		return;
	}

	var req_data = {
		keyword: keyword
	};
	$.ajax({
		url: '/cherry_api/search_music_by_artist',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				_searched_music_list = res.music_list;
				DisplaySearchedMusicList();
			}else{
				alert(res.err);
			}
		}
	});	
}

function SearchMusicTitle(){
	var keyword = $('#id_text_keyword').val();
	if(keyword == ''){
		alert('Keyword Empty');
		return;
	}

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
				_searched_music_list = res.music_list;
				DisplaySearchedMusicList();
			}else{
				alert(res.err);
			}
		}
	});	
}

function DisplaySearchedMusicList(){
	$('#id_searched_music_list').empty();
	var h = '';
	for(var i=0 ; i<_searched_music_list.length ; i++){
		var m = _searched_music_list[i];
		h += '<div class="row" style="cursor:pointer" onclick="AddMusicIntoCollection(' + i + ')">';
		h += '<div class="col-4">' + m.artist + '</div>';
		h += '<div class="col-8">' + m.title + '</div>';
		h += '</div>';
	}
	
	$('#id_searched_music_list').html(h);
}

function AddMusicIntoCollection(idx){
	$('#id_modal_add_music').modal('hide');

	var ranking = _top_100.length + 1;
	_top_100.push({
		ranking:  ranking,
		music_id: _searched_music_list[idx].music_id,
		artist:   _searched_music_list[idx].artist,
		title:    _searched_music_list[idx].title
	});
	DisplayTop100();
	NeedToSave();
}

function NeedToSave(){
	$('#id_btn_save').removeClass('btn-primary');
	$('#id_btn_save').addClass('btn-danger');
}

function SaveComplete(){
	$('#id_btn_save').removeClass('btn-danger');
	$('#id_btn_save').addClass('btn-primary');
}
