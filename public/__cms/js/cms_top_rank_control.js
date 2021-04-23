$('document').ready(function(){
	DisplayCountryList();
	GetReleaseTime();
	InitHandle();
	InitKeyHandle();
	UpdateReleaseModeBtn();
});

//-----------------------------------------------------------------
const RELEASE_MODE = {
	DRAFT:0,
	RELEASE:1
};

var _release_mode = RELEASE_MODE.DRAFT;
var _country_code = null;
var _music_list_draft = [];
var _music_list_release = [];
var _searched_music_list = [];
var _working_idx = -1;
var _win_arrange = 0;

//-----------------------------------------------------------------

function InitHandle(){
}

function DisplayCountryList(){
	var h = '<table class="table table-sm">';

	for (var i = 0; i < COUNTRY_CODE_LIST.length; i++) {
		var cc = COUNTRY_CODE_LIST[i];
		h += `
		<tr>
			<td>
				<button type="button" class="btn btn-sm btn-light w-100" 
				onclick="ChooseCountry('${cc}')">${cc}</button>
			</td>
			<td id="id_label_country_release_time-${cc}" style="font-size:0.7em">
			</td>
		</tr>
		`;
	}

	h += '</table>';
	$('#id_div_country_list').html(h);
}

function GetReleaseTime(){
	$.ajax({
		url:  '/cherry_api/top_rank/get_release_time',
		type: 'GET',
		data: null,
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				console.log('release_time_list length ' + res.release_time_list.length);
				for(var i=0 ; i<res.release_time_list.length ; i++){
					var c = res.release_time_list[i];
					var d = new Date(c.release_time);
					// var date_str = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

					const time = d.toLocaleString('ko-KR', { hour: 'numeric', minute: 'numeric', second:'numeric', hour12: true });
					const date = d.toLocaleString('ko-KR', { day: 'numeric', month: 'numeric', year:'numeric' });

					$(`#id_label_country_release_time-${c.country_code}`).html(date + '<br>' + time);
				}
			}else{
				alert(res.err);
			}
		}
	});
}

function DisplayReleaseTime(){

}

function ArrangeWindow(){
	if(_win_arrange == 0){

		//좌우 배치
		_win_arrange = 1;
		$('body').addClass('d-flex');

		$('#id_div_main').css('height', '100%');
		$('#id_div_main').css('width', '50%');
		$('#id_iframe_youtube').css('height', '100%');
		$('#id_iframe_youtube').css('width', '50%');
		$('#id_div_bottom').css('height', '100%');
		$('#id_div_bottom').css('width', '50%');
	}else{
		//상하 배치
		_win_arrange = 0;
		$('body').removeClass('d-flex');

		$('#id_div_main').css('height', '60%');
		$('#id_div_main').css('width', '100%');
		$('#id_iframe_youtube').css('height', '40%');
		$('#id_iframe_youtube').css('width', '100%');
		$('#id_div_bottom').css('height', '40%');
		$('#id_div_bottom').css('width', '100%');
	}
}

function InitKeyHandle(){
	document.addEventListener('keydown', function(e){
		console.log('key ' + e.keyCode);
		switch(e.keyCode){
			case 49://1
				SearchYoutube(_working_idx);
				break;
			case 50://2
				{
					navigator.clipboard.readText()
					.then(text => {
						// console.log('Pasted content: ', text);
						AutoMusicRegisterProcess(text);
					})
					.catch(err => {
						console.error('Failed to read clipboard contents: ', err);
					});
				}
				break;
			case 51://3
				SearchMusic(_working_idx);
				break;
		}
	});
}

function AutoMusicRegisterProcess(txt){
	var video_id = UTIL_ExtractVideoIDFromUrl(txt);
	if(video_id == null){
		return;
	}

	console.log('video_id ' + video_id);
	_music_list_draft[_working_idx].video_id = video_id;
	$(`#id_text_video_id_${_working_idx}`).val(video_id);
	RegisterMusic(_working_idx);
}

function ToggleReleaseType(){
	if(_release_mode == RELEASE_MODE.DRAFT){
		_release_mode = RELEASE_MODE.RELEASE;
	}else{
		_release_mode = RELEASE_MODE.DRAFT;
	}
	UpdateReleaseModeBtn();
	OpenWork();
}

function UpdateReleaseModeBtn(){
	$('#id_btn_release_type_draft').removeClass('btn-primary');
	$('#id_btn_release_type_draft').removeClass('btn-outline-primary');
	$('#id_btn_release_type_release').removeClass('btn-primary');
	$('#id_btn_release_type_release').removeClass('btn-outline-primary');
	
	if(_release_mode == RELEASE_MODE.DRAFT){
		$('#id_btn_release_type_draft').addClass('btn-primary');
		$('#id_btn_release_type_release').addClass('btn-outline-primary');
	}else{
		$('#id_btn_release_type_draft').addClass('btn-outline-primary');
		$('#id_btn_release_type_release').addClass('btn-primary');
	}
}

function ChooseCountry(country_code){
	console.log('country_code ' + country_code);
	_country_code = country_code;
	OpenWork();
}

function OpenWork(){
	_music_list_draft = [];
	_music_list_release = [];
	DisplayRankTitle();
	FetchTopRank();
}

function DisplayRankTitle(){
	var title = _country_code;
	if(_release_mode == RELEASE_MODE.DRAFT){
		title += '[Draft]';
	}else{
		title += '[Release]';
	}

	$('#id_label_rank_title').html(title);
}

function FetchTopRank(){
	var req_data = {
		country_code: _country_code
	};

	var url = '';
	if(_release_mode == RELEASE_MODE.DRAFT){
		url = '/__cms_api/top_rank/fetch_draft_data'; 
	}else if(_release_mode == RELEASE_MODE.RELEASE){
		url = '/__cms_api/top_rank/fetch_release_data'; 
	}

	$.ajax({
		url:  url,
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				if(_release_mode == RELEASE_MODE.DRAFT){
					_music_list_draft = res.music_list;
					DisplayMusicList_Draft();
					DisplayDraftStatus();
				}else if(_release_mode == RELEASE_MODE.RELEASE){
					_music_list_release = res.music_list;
					DisplayMusicList_Release();
				}
			}else{
				alert(res.err);
			}
		}
	});
}

function Auto(){
	_music_list_draft = [];
	$('#id_div_music_list').empty();

	var url = COUNTRY_TOP_RANK_SRC[_country_code].a_src;
	var req_data = {
		url: url
	};

	$.ajax({
		url: '/__cms_api/fetch_content_from_url',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				ParseContent(res.content);
			}else{
				alert(res.err);
			}
		}
	});	
}

function DisplayDraftStatus(){
	$('#id_label_total').text(_music_list_draft.length);
	var ok_cnt = 0;
	for(var i=0 ; i<_music_list_draft.length ; i++){
		var m = _music_list_draft[i];
		if(m.music_id != null){
			ok_cnt++;
		}
	}
	$('#id_label_ok').text(ok_cnt);
}

function ParseContent(content){
	var arr = content.split('\n');
	// console.log('arr len ' + arr.length);
	for(var i=0 ; i<arr.length ; i++){
		var line = arr[i];

		//노래를 찾았음.
		if(line.includes('song-name typography-body-tall')){
			var music = {
				rank_num:null,
				title:null,
				artist:null,
				video_id:null,
				music_id:null
			};

			music.rank_num = _music_list_draft.length + 1;

			//바로 그 다음 줄에 제목이 있음.
			var title_str = arr[i+1];
			music.title = ParseTitle(title_str);

			var artist_str = arr[i+3];
			var artist_list = ParseArtist(artist_str);
			music.artist = artist_list.join(", ");

			_music_list_draft.push(music);
		}
	}

	DisplayMusicList_Draft();
	AutoSearchMusic();
}

function AutoSearchMusic(){
	console.log('start auto search ' );
	var req_data = {
		music_list: _music_list_draft
	};

	$.ajax({
		url: '/__cms_api/top_rank/auto_search_music_list',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				var ret_music_list = res.ret_music_list;

				for(var i=0 ; i<ret_music_list.length ; i++){
					var m = ret_music_list[i];
					_music_list_draft[i].video_id = m.video_id;
					_music_list_draft[i].music_id = m.music_id;
					$('#id_label_music_id_'+i).html(m.music_id);
					$('#id_text_video_id_'+i).val(m.video_id);
					DisplayVideoImage(i);
				}
				DisplayDraftStatus();
			}else{
				alert(res.err);
			}
		}
	});	
}

/**
	Example 
 	<!---->Leave The Door Open</div>
*/
function ParseTitle(str){
	str = str.substr('<!---->'.length);
	return str.substr(0, str.length - (str.length - str.lastIndexOf('</div>')));
}

/**
	Example
                                        <span>                                                    <a href="https://music.apple.com/us/artist/bruno-mars/278873078" class="dt-link-to" tabindex="-1">Bruno Mars</a>,                                                    <a href="https://music.apple.com/us/artist/anderson-paak/855484536" class="dt-link-to" tabindex="-1">Anderson .Paak</a>,                                                    <a href="https://music.apple.com/us/artist/silk-sonic/1556097160" class="dt-link-to" tabindex="-1">Silk Sonic</a><!----></span>
*/
function ParseArtist(str){
	var artist_list = [];
	var arr = str.split('</a>');
	for(var i=0 ; i<arr.length ; i++){
		var tmp = arr[i];
		var index_of = tmp.indexOf('class="dt-link-to" tabindex="-1">');
		if(index_of != -1){
			var begin_pos = index_of + 'class="dt-link-to" tabindex="-1">'.length;
			var artist = tmp.substr(begin_pos);
			artist_list.push(artist);
		}
	}
	return artist_list;
}

function DisplayMusicList_Draft(){
	$('#id_div_music_list').empty();
	var h = '<table class="table table-sm table-striped">';
	h += `
	<tr>
		<th>No.</th>
		<th>Artist</th>
		<th>Title</th>
		<th>Video ID</th>
		<th>IMG</th>
		<th>Music ID</th>
		<th>Tool</th>
	</tr>
	`;

	for(var i=0 ; i<_music_list_draft.length ; i++){
		var m = _music_list_draft[i];
		var img_url = '';
		if(m.video_id != null)
			img_url = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;

		h += `
		<tr onclick="ChooseMusicForWorking(${i})" id="id_row_music_${i}">
			<td class="bd-danger">${m.rank_num}</td>
			<td>${m.artist}</td>
			<td>${m.title}</td>
			<td>
				<input type="text" style="width:100px; font-size:0.8em" id="id_text_video_id_${i}" onFocusOut="CheckVideoID(this, ${i})" value="${m.video_id}"></input>
			</td>
			<td><img style="height: 30px; width: 30px;" id="id_img_${i}" src="${img_url}"/></td>
			<td id="id_label_music_id_${i}">${m.music_id}</td>
			<td class="d-flex">
				<span style="cursor:pointer" class="badge badge-primary" onClick="RegisterMusic(${i})">C</span>
				<span style="cursor:pointer" class="badge badge-primary" onClick="SearchYoutube(${i})">Y</span>
				<span style="cursor:pointer" class="badge badge-primary" onClick="SearchMusic(${i})">M</span>
			</td>
		</tr>
		`;
	}
	h += '</table>';

	$('#id_div_music_list').html(h);
}

function DisplayMusicList_Release(){
	$('#id_div_music_list').empty();
	var h = '<table class="table table-sm table-striped">';
	h += `
	<tr>
		<th>No.</th>
		<th>Artist</th>
		<th>Title</th>
		<th>Video ID</th>
		<th>IMG</th>
		<th>Music ID</th>
	</tr>
	`;

	for(var i=0 ; i<_music_list_release.length ; i++){
		var m = _music_list_release[i];
		var img_url = '';
		if(m.video_id != null){
			img_url = `https://img.youtube.com/vi/${m.video_id}/0.jpg`;
		}

		h += `
		<tr>
			<td class="bd-danger">${m.rank_num}</td>
			<td>${m.artist}</td>
			<td>${m.title}</td>
			<td>${m.video_id}</td>
			<td><img style="height: 30px; width: 30px;" id="id_img_${i}" src="${img_url}"/></td>
			<td id="id_label_music_id_${i}">${m.music_id}</td>
		</tr>
		`;
	}
	h += '</table>';

	$('#id_div_music_list').html(h);
}

function ChooseMusicForWorking(idx){
	_working_idx = idx;
	console.log('idx ' + idx);
	for(var i=0 ; i<_music_list_draft.length ; i++){
		if((i%2) == 1){
			$(`#id_row_music_${i}`).css('background-color', '#eeeeee');
		}else{
			$(`#id_row_music_${i}`).css('background-color', 'white');
		}
	}

	$(`#id_row_music_${idx}`).css('background-color', 'yellow');
}

function RegisterMusic(idx){
	if(_music_list_draft[idx].video_id == null){
		alert('video id null');
		return;
	}

	var req_data = {
		artist:   _music_list_draft[idx].artist,
		title:    _music_list_draft[idx].title,
		video_id: _music_list_draft[idx].video_id
	};
	$.ajax({
		url: '/cherry_api/add_music',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				// alert('success');
				_music_list_draft[idx].music_id = res.music_id;
				$('#id_label_music_id_'+idx).html(res.music_id);
				DisplayVideoImage(idx);
				NeedToSave();
				DisplayDraftStatus();
			}else{
				alert(res.err);
			}
		}
	});
}


function CheckVideoID(ele, idx){
	var url = $(ele).val();
	var extract = UTIL_ExtractVideoIDFromUrl(url);

	if(extract == null){
		return null;
	}
	var video_id = extract;

	$(ele).val(video_id);
	_music_list_draft[idx].video_id = video_id;
	DisplayVideoImage(idx);
}

function DisplayVideoImage(idx){
	var video_id = _music_list_draft[idx].video_id;
	var img_url = '';
	if(video_id != null && video_id != ''){
		img_url = `https://img.youtube.com/vi/${video_id}/0.jpg`;
	}
	 
	$('#id_img_'+idx).attr('src', img_url);
}

function SearchYoutube(idx){
	if(idx == -1){
		return;
	}

	$('#id_div_bottom').hide();
	$('#id_iframe_youtube').show();

	var artist_name = _music_list_draft[idx].artist;
	artist_name = artist_name.replace('&amp;', '');
	var title = _music_list_draft[idx].title;
	title = title.replace('&amp;', '');
	var keyword = artist_name + "+" + title;
	// console.log('keyword ' + keyword);
	// console.log("https://www.youtube.com/results?search_query="+keyword);
	top.document.getElementById('id_iframe_youtube').src = "https://www.youtube.com/results?search_query="+keyword;
}

function SearchMusic(idx){
	$('#id_div_bottom').show();
	$('#id_iframe_youtube').hide();

	_searched_music_list = [];
	console.log('idx ' + idx);
	var req_data = {
		artist_name: _music_list_draft[idx].artist,
		title:       _music_list_draft[idx].title
	};

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

				_searched_music_list = list1.concat(list2);

				// if(_searched_music_list.length > 0){
				// 	_music_list_draft[idx].video_id = _searched_music_list[0].video_id;
				// 	_music_list_draft[idx].music_id = _searched_music_list[0].music_id;
				// 	$('#id_label_music_id_'+idx).html(_searched_music_list[0].music_id);
				// 	$('#id_text_video_id_'+idx).val(_searched_music_list[0].video_id);
				// 	DisplayVideoImage(idx);
				// 	NeedToSave();
				// }
				DisplaySearchedMusicList();
			}else{
				alert(res.err);
			}
		}
	});
}

function DisplaySearchedMusicList(){
	$('#id_div_bottom').empty();

	var h = `<table class="table table-sm">
	<tr>
	<th>Music ID</th>
	<th>Artist</th>
	<th>Title</th>
	<th>Video ID</th>
	</tr>`;

	for(var i=0 ; i<_searched_music_list.length ; i++){
		var m = _searched_music_list[i];
		h += `
		<tr>
			<td>${m.music_id}</td>
			<td>${m.artist}</td>
			<td>${m.title}</td>
			<td>${m.video_id}</td>
			<td>
				<button type="button" class="btn btn-sm btn-primary" onClick="UseThisMusicID(${i})">OK</button>
			</td>
		</tr>`;
	}

	if(_searched_music_list.length == 0){
		h += '<tr><td colspan="4" class="text-center">No Result</td></tr>';
	}

	h += '</table>';

	$('#id_div_bottom').html(h);
}

function UseThisMusicID(searched_music_idx){
	console.log('searched_music_idx ' + searched_music_idx);

	_music_list_draft[_working_idx].video_id = _searched_music_list[searched_music_idx].video_id;
	_music_list_draft[_working_idx].music_id = _searched_music_list[searched_music_idx].music_id;
	$('#id_label_music_id_'+_working_idx).html(_searched_music_list[searched_music_idx].music_id);
	$('#id_text_video_id_'+_working_idx).val(_searched_music_list[searched_music_idx].video_id);
	DisplayVideoImage(_working_idx);
	NeedToSave();
}

function Save(){
	if(_music_list_draft.length == 0){
		alert('music list empty');
		return;
	}

	var req_data = {
		country_code: _country_code,
		music_list:   _music_list_draft
	};

	$.ajax({
		url: '/__cms_api/top_rank/save_draft',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				// alert('success');
				CompleteSave();
			}else{
				alert(res.err);
			}
		}
	});
}

function Release(){
	if(_music_list_draft.length == 0){
		alert('music list empty');
		return;
	}

	var req_data = {
		country_code: _country_code,
		music_list:   _music_list_draft
	};

	$.ajax({
		url: '/__cms_api/top_rank/release_draft',
		type: 'POST',
		data: JSON.stringify(req_data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			if(res.ok){
				GetReleaseTime();
				alert('success');
			}else{
				alert(res.err);
			}
		}
	});
}

function NeedToSave(){
	$('#id_btn_save').removeClass('btn-primary');
	$('#id_btn_save').addClass('btn-danger');
}

function CompleteSave(){
	$('#id_btn_save').removeClass('btn-danger');
	$('#id_btn_save').addClass('btn-primary');
}