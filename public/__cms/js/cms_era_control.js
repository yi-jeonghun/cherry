$('document').ready(function(){
	console.log('ready ' );
	window._era_control = new EraControl().Init();
});

const EDIT_TYPE = {
	MELON_DRAFT : 0,
	GINIE_DRAFT : 1,
	RELEASE : 2
};

function EraControl(){
	var self = this;
	this._year_list = [];
	this._year = null;
	this._edit_type = null;
	this._music_list_draft = [];

	this.Init = function(){
		console.log('init ');
		self.InitHandle();
		self.LoadYearList();
		return this;
	};

	this.InitHandle = function(){
	};

	this.LoadYearList = function(){
		var req = {
			country_code: window._country_selector.GetCountryCode()
		};
		POST('/cherry_api/era/get_year_list', req, res=>{
			if(res.ok){
				self._year_list = res.year_list;
				self.DISP_YearList();
			}else{
				alert(res.err);
			}
		});
	};

	//-------------------------------------------------------

	this.OnClick_AddYear = function(){
		var year = $('#id_input_cms_era_year').val().trim();
		if(year == ''){
			alert('input year');
			return;
		}
		for(var i=0 ; i<self._year_list.length ; i++){
			if(year == self._year_list[i].year){
				alert('same year is already registered.');
				return;
			}
		}

		var req = {
			country_code: window._country_selector.GetCountryCode(),
			year: year
		};
		POST('/cherry_api/era/add_year', req, res=>{
			if(res.ok){
				self.LoadYearList();
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_SelectYear = function(idx){
		self._year = self._year_list[idx].year;
		$('#id_label_cms_era_selected_year').html(self._year);
	};

	this.OnClick_EditType = function(type){
		self._edit_type = type;
		self.HighlightEditType();
	};

	this.OnClick_Auto = function(){
		if(self._year == null){
			alert('choose year');
			return;
		}
		if(self._edit_type == EDIT_TYPE.RELEASE){
			return;
		}

		var site = '';
		if(self._edit_type == EDIT_TYPE.MELON_DRAFT){
			site = 'melon';
		}else if(self._edit_type == EDIT_TYPE.GINIE_DRAFT){
			site = 'ginie';
		}
		var req = {
			site:site,
			year:self._year
		};
		POST('/__cms_api/era/get_auto_era_chart', req, res=>{
			if(res.ok){
				self._music_list_draft = res.auto_music_list;
				self.DISP_AutoMusicList();
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_Save = function(){
		if(self._year == null){
			alert('choose year');
			return;
		}
		if(self._edit_type == EDIT_TYPE.RELEASE){
			return;
		}


	};

	//-------------------------------------------------------

	this.HighlightEditType = function(){
		$('#id_btn_cms_era_melon').removeClass('btn-primary');
		$('#id_btn_cms_era_ginie').removeClass('btn-primary');
		$('#id_btn_cms_era_release').removeClass('btn-primary');
		if(self._edit_type == EDIT_TYPE.MELON_DRAFT){
			$('#id_btn_cms_era_melon').addClass('btn-primary');
		}else if(self._edit_type == EDIT_TYPE.GINIE_DRAFT){
			$('#id_btn_cms_era_ginie').addClass('btn-primary');
		}else if(self._edit_type == EDIT_TYPE.RELEASE){
			$('#id_btn_cms_era_release').addClass('btn-primary');
		}
	};

	this.AutoSearchArtistAndMusic = function(){
		console.log('start auto search ' );
		var req_data = {
			music_list: self._music_list_draft
		};

		$.ajax({
			url: '/__cms_api/top_rank/auto_search_artist_and_music_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					var ret_music_list = res.ret_music_list;

					for(var i=0 ; i<ret_music_list.length ; i++){
						var m = ret_music_list[i];
						self._music_list_draft[i].artist_uid = m.artist_uid;
						self._music_list_draft[i].video_id = m.video_id;
						self._music_list_draft[i].music_uid = m.music_uid;
						$('#id_label_artist_uid_'+i).html(m.artist_uid);
						$('#id_label_music_uid_'+i).html(m.music_uid);
						$('#id_text_video_id_'+i).val(m.video_id);
						self.DISP_VideoImage(i);
					}
					// self.DISP_DraftStatus();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DISP_VideoImage = function(idx){
		var video_id = self._music_list_draft[idx].video_id;
		var img_url = '';
		if(video_id != null && video_id != ''){
			img_url = `https://img.youtube.com/vi/${video_id}/0.jpg`;
		}
		
		$('#id_img_'+idx).attr('src', img_url);
	};


	//-------------------------------------------------------

	this.DISP_YearList = function(){
		var h = '';
		for(var i=0 ; i<self._year_list.length ; i++){
			var onclick = `window._era_control.OnClick_SelectYear(${i})`;
			h += `
			<div class="pointer" onClick="${onclick}">
				${self._year_list[i].year}
			</div>
			`;
		}
		$('#id_cms_era_year_list').html(h);
	};

	this.DISP_AutoMusicList = function(){
		var h = `<table class="table table-sm table-striped small">
		<tr>
		<th></th>
		<th>Artist</th>
		<th>AID</th>
		<th>Title</th>
		<th>MID</th>
		<th>VID</th>
		</tr>
		`;

		for(var i=0 ; i<self._music_list_draft.length ; i++){
			var m = self._music_list_draft[i];
			var video_id = m.video_id;
			var img_src =  `https://img.youtube.com/vi/${video_id}/0.jpg`;

			h += `
			<tr>
			<td>
				<image style="height: 50px; width: 50px;" id="id_img_${i}" src="${img_src}">
			</td>
			<td>${m.artist}</td>
			<td>${m.artist_uid}</td>
			<td>${m.title}</td>
			<td>${m.music_uid}</td>
			<td>${m.video_id}</td>
			</tr>
			`;
		}
		h += '</table>';

		$('#id_div_cms_era_music_list').html(h);
	};
}