$('document').ready(function(){
	window._playlist_control = new PlaylistControl().Init();
});

function PlaylistControl(){
	var self = this;
	this._playlist_list = [];

	this.Init = function(){
		self.LoadPlaylist();
		return self;
	};

	this.LoadPlaylist = function(){
		var req_data = {
			country_code: window._country_code,
			mine_only: true,
			open_only: false
		};

		$.ajax({
			url: '/cherry_api/get_playlist_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					console.log('res.playlist_list ' + res.playlist_list.length);
					self._playlist_list = res.playlist_list;
					self.DISP_playlist_list();
				}else{
					alert(res.err);
				}
			}
		});
	};

	/////////////////////////////////////////////////////////////

	this.DISP_playlist_list = function(){
		var h = `
			<table class="table table-sm table-striped" style="margin: 0px">
			<tr>
			<th>Title</td>
			<th>Like</td>
			<th>Open</td>
			</tr>
		`;

		for(var i=0 ; i<self._playlist_list.length ; i++){
			var p = self._playlist_list[i];
			var title_encoded = encodeURI(p.title);
			var on_click = `window._router.Go('/${window._country_code}/my_playlist_detail.go?pn=${title_encoded}&pid=${p.playlist_id}')`;

			h += `
			<tr>
				<td onClick="${on_click}">${p.title}</td>
				<td>${p.like_count}</td>
				<td>${p.is_open}</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_playlist_list').html(h);
	};
}