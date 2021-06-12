$('document').ready(function(){
	window._music_control = new MusicControl().Init();
});

function MusicControl(){
	var self = this;
	this._total_count = 0;
	this._music_list = [];
	this._correction_music_list = [];
	this._page = 1;
	this._working_music_idx = -1;

	this.Init = function(){
		self.InitHandle();
		return this;
	};

	this.InitHandle = function(){
		$('#id_btn_cms_music_lyrics_ok').on('click', self.OnClick_LyricsOK);
	};

	//--------------------------------------------------------

	this.GetMusicList_NoLyrics = function(is_next){
		if(is_next == false){
			self._page = 1;
			self._music_list = [];
		}else{
			self._page ++;
		}
		$.get('/__cms_api/get_music_list_no_lyrics?p='+self._page, (res)=>{
			if(res.ok){
				console.log('res.count ' + res.count);
				self._total_count = res.count;
				res.music_list.forEach(m => {
					self._music_list.push(m);
				})
				self.DISP_MusicList();
			}else{
				alert(ret.err);
			}
		});
	};

	this.GetMusicList_Correction = function(){
		$.get('/__cms_api/get_music_list_correction', (res)=>{
			if(res.ok){
				self._correction_music_list = res.correction_music_list;
				self.DISP_CorrectionMusicList();
			}else{
				alert(ret.err);
			}
		});		
	};

	var command_key_pressing = false;
	this.OpenLyricsEdit = function(idx){
		self._working_music_idx = idx;
		console.log('idx ' + idx);
		var m = self._music_list[idx];
		$('#id_modal_cms_music_lyrics_artist').html(m.artist);
		$('#id_modal_cms_music_lyrics_title').html(m.title);
		$('#id_input_cms_music_lyrics').val('');
		$('#id_input_cms_music_lyrics').focus();
		$('#id_modal_cms_music_lyrics').modal('show');

		$('#id_input_cms_music_lyrics').on('keydown', function(e){
			console.log('e.keyCode ' + e.keyCode);
			if(e.keyCode == 91){//mac left command
				command_key_pressing = true;
			}
			if(e.keyCode == 93){//right command
				if(command_key_pressing){
					console.log('lyrics ok ');
					self.OnClick_LyricsOK();
				}
			}

		});
		$('#id_input_cms_music_lyrics').on('keyup', function(e){
			if(e.keyCode == 91){//mac command key
				command_key_pressing = false;
			}
		})
	};

	this._lyrics_ok_ing = false;
	this.OnClick_LyricsOK = function(){
		if(self._lyrics_ok_ing){
			return;
		}
		self._lyrics_ok_ing = true;
		var music_uid = self._music_list[self._working_music_idx].music_uid;
		var has_lyrics = 'N';
		var text = $('#id_input_cms_music_lyrics').val();

		var req = {
			has_lyrics:has_lyrics,
			dj_user_id: window._dj_selector.API_Get_Choosed_DJs_UserID(),
			music_uid: music_uid,
			text: text
		};

		POST('/cherry_api/update_lyrics', req, (res)=>{
			self._lyrics_ok_ing = false;
			if(res.ok){
				$('#id_modal_cms_music_lyrics').modal('hide');
				self._music_list[self._working_music_idx].has_lyrics = 'Y';
				$('#id_lebel_music_has_lyrics-'+self._working_music_idx).html('Y');
				$('#id_lebel_music_has_lyrics-'+self._working_music_idx).removeClass('badge-danger');
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_CopyTitle = function(idx){
		var title = self._music_list[idx].title;
		$('#id_text_for_copy_text').val(title);
		$('#id_text_for_copy_text').select();
		document.execCommand("copy");		
	};

	this.OnClick_SearchGoogle = function(idx){
		var title = self._music_list[idx].title;
		var artist = self._music_list[idx].artist;
		var query = `search?q=lyrics+${title}+${artist}`;
		query += '&igu=1';
		var url = 'https://google.com/' + query;
		$('#id_iframe_music_google_search').attr('src', url);
	};

	//---------------------------------------------------------

	this.DISP_MusicList = function(){
		$('#id_label_cms_music_total').html(self._total_count);

		var h = `
		<table class="table table-sm table-stripped">
		<tr>
			<th>Artist</th>
			<th>Title</th>
			<th>D</th>
			<th>L</th>
			<th>G</th>
		</tr>
		`;

		var i = 0;
		self._music_list.forEach(m => {
			var on_click_lyrics = `window._music_control.OpenLyricsEdit(${i})`;
			var on_click_copy_title = `window,_music_control.OnClick_CopyTitle(${i})`;
			var on_click_google = `window,_music_control.OnClick_SearchGoogle(${i})`;
			h += `
			<tr>
				<td>${m.artist}</td>
				<td class="pointer" onClick="${on_click_copy_title}">${m.title}</td>
				<td>${m.is_diff_name}</td>
				<td>
					<i class="badge badge-sm badge-danger pointer" onClick="${on_click_lyrics}" id="id_lebel_music_has_lyrics-${i}">
						N
					</i>
				</td>
				<td>
					<span class="badge badge-sm border pointer" onClick="${on_click_google}">G</span>
				</td>
			</tr>
			`;
			i++
		});

		var on_click_more = `window._music_control.GetMusicList_NoLyrics(true)`;

		h += `
		<tr><td class="bg-primary text-white text-center pointer" colspan="2" onClick="${on_click_more}">More</td></tr>
		</table>`;
		
		$('#id_div_cms_music_list').html(h);
	};

	this.DISP_CorrectionMusicList = function(){
		$('#id_label_cms_music_total').html('');

		var h = `
		<table class="table table-sm table-stripped">
		<tr>
			<th>Artist</th>
			<th>Title</th>
			<th>Lyrics</th>
			<th>Video</th>
			<th>Ads</th>
		</tr>
		`;

		for(var i=0 ; i<self._correction_music_list.length; i++){
			var m = self._correction_music_list[i];
			h += `
			<tr>
				<td>${m.artist}</td>
				<td>${m.title}</td>
				<td>${m.lyrics}</td>
				<td>${m.video}</td>
				<td>${m.ads}</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_cms_music_list').html(h);
	};
}