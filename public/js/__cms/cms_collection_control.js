$('document').ready(function(){
	$('#id_btn_add_ok').on('click', AddCollection);
	$('#id_btn_search_artist').on('click', SearchMusicByArtist);
	$('#id_btn_search_title').on('click', SearchMusicTitle);
	$('#id_btn_save').on('click', Save);

	// GetCollectionList();
});

const COLLECTION_TYPE = {
	KPOP:0,
	BILLBOARD:1
};

var _collection_type = -1;
var _top_100 = [];

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
				alert('Success');
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
}

function LoadBillboardTop100(){
	$('#id_link_kpop_top_100').css("background-color", "white");
	$('#id_link_billboard_top_100').css("background-color", "gray");
	LoadTop100(COLLECTION_TYPE.BILLBOARD);
	_collection_type = COLLECTION_TYPE.BILLBOARD;
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
				DisplayKpopTop100();
				// console.log('music list ' + res.music_list);
			}else{
				alert(res.err);
			}
		}
	});
}

function DisplayKpopTop100(){
	var htm = '';

	for(var i=0 ; i<_top_100.length ; i++){
		var m = _top_100[i];
		console.log('m ' + JSON.stringify(m));
		htm += '<div class="row">';
		htm += '	<div class="col-1">' + m.ranking + '</div>';
		htm += '	<div class="col-5">' + m.artist + '</div>';
		htm += '	<div class="col-6">' + m.title + '</div>';
		htm += '</div>';
	}

	$('#id_div_music_list').html(htm);
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
				// DisplayCollectionList(res.collection_list);
				// console.log('res ' + res.music_list.length);
				DisplaySearchedMusicList(res.music_list);
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
}

function DisplaySearchedMusicList(music_list){
	var htm = '';
	for(var i=0 ; i<music_list.length ; i++){
		var m = music_list[i];
		htm += '<div class="row" style="cursor:pointer" onclick="AddMusicIntoCollection(\'' + m.artist + '\',' + m.music_id + ',\'' + m.title + '\')">';
		htm += '<div class="col-4">' + m.artist + '</div>';
		htm += '<div class="col-8">' + m.title + '</div>';
		htm += '</div>';
	}
	
	$('#id_searched_music_list').html(htm);
}

function AddMusicIntoCollection(artist, music_id, title){
	$('#id_modal_add_music').modal('hide');

	var ranking = _top_100.length + 1;
	_top_100.push({
		ranking:ranking,
		music_id:music_id,
		artist: artist,
		title: title
	});
	DisplayKpopTop100();
}

