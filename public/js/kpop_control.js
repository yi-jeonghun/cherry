$('document').ready(function(){
	window._kpop_control = new KPopControl().Init();
});

function KPopControl(){
	var self = this;
	this._music_list = [];

	this.Init = function(){
		{
			$('#id_btn_listen_all').on('click', self.ListenAll);
		}
		self.GetMusicList();
		return self;
	};

	this.ListenAll = function(){
		console.log('listen all len ' + self._music_list.length);
		window._cherry_player.LoadMusicList(self._music_list);
	};

	this.GetMusicList = function(){
		$.ajax({
			url: '/cherry_api/collection/get_kpop_top_100',
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._music_list = res.music_list;
					// window._cherry_player.LoadMusicList(self._music_list);
					self.DisplayMusicList();
				}else{
					alert(res.err);
				}
			}
		});	
	};

	this.DisplayMusicList = function(){
		var htm = '';
		for(var i=0 ; i<self._music_list.length ; i++){
			var m = self._music_list[i];
			htm += '<div class="row">';
			htm += '<div class="col-4">' + m.artist + '</div>';
			htm += '<div class="col-8">' + m.title + '</div>';
			htm += '</div>';
		}

		$('#id_div_kpop_list').html(htm);
	};
}