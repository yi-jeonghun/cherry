
function CollectionControl(collection_type){
	var self = this;
	this._collection_type = collection_type;
	this._music_list = [];

	this.Init = function(){
		self.GetMusicList();
		return self;
	};

	this.ListenAll = function(){
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.GetMusicList = function(){
		var url = '';
		var req_data = null;
		var http_method = 'GET';
		if(self._collection_type == COLLECTION_TYPE.KPOP){
			http_method = 'GET';
			url = '/cherry_api/collection/get_top_100?type=' + self._collection_type;
		}else{
			http_method = 'POST';
			req_data = {
				country_code: 'GLO'
			}
			url = '/cherry_api/top_rank/fetch_release_data';
		}

		$.ajax({
			url: url,
			type: http_method,
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list = res.music_list;
					self.DisplayMusicList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplayMusicList = function(){
		var h = '';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			var num = (i*1) + 1;

			h += '<div class="row my-2 border">';
			h += '	<div class="col-1">' + num + '</div>';
			h += '	<div class="col-9 col-sm-10 d-flex">';
			h += '		<image style="height: 50px; width: 50px;" src="https://img.youtube.com/vi/'+m.video_id+'/0.jpg">';
			h += '		<div class="pl-1">';
			h += '			<div class="text-dark">' + m.title + '</div>';
			h += '			<div class="text-secondary" style="font-size:0.8em">' + m.artist + '</div>';
			h += '		</div>';
			h += '	</div>';
			h += '	<div class="col-1">';
			h += '		<button class="btn" type="button" onclick="ListenMusic(' + self._collection_type + ', ' + i + ')">';
			h += '			<i class="fas fa-play"></i>';
			h += '		</button>';
			h += '	</div>';
			h += '</div>';
		}

		var div_id = '';
		if(self._collection_type == COLLECTION_TYPE.KPOP){
			div_id = 'id_div_kpop_list';
		}else if(self._collection_type == COLLECTION_TYPE.BILLBOARD){
			div_id = 'id_div_billboard_list';
		}

		$('#'+div_id).html(h);
	};
}