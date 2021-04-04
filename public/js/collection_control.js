
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
		$.ajax({
			url: '/cherry_api/collection/get_top_100?type=' + self._collection_type,
			type: 'GET',
			data: null,
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
		var h = '<table class="table table-sm table-striped">';
		h += '<tr>';
		h += '	<th>No.</th>';
		h += '	<th>Artist</th>';
		h += '	<th>Title</th>';
		h += '	<th></th>';
		h += '</tr>';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			h += '<tr>';
			h += '	<td>' + new Number(i+1) + '</td>';
			h += '	<td>' + m.artist + '</td>';
			h += '	<td>' + m.title + '</td>';
			h += '	<td>';
			h += '		<i onclick="ListenMusic(' + self._collection_type + ', ' + i + ')" style="cursor:pointer" class="fas fa-play"></i>';
			h += '	</td>';
			h += '</tr>';
		}
		h += '</table>';

		var div_id = '';
		if(self._collection_type == COLLECTION_TYPE.KPOP){
			div_id = 'id_div_kpop_list';
		}else if(self._collection_type == COLLECTION_TYPE.BILLBOARD){
			div_id = 'id_div_billboard_list';
		}

		$('#'+div_id).html(h);
	};
}