$('document').ready(function(){
	window._open_playlist_control = new OpenPlaylistControl().Init();
});

function OpenPlaylistControl(){
	var self = this;
	this._playlist_list = [];

	this.Init = function(){
		self.InitHandle();
		self.LoadPlaylist();
		return self;
	};

	this.InitHandle = function(){
	};

	this.LoadPlaylist = function(){
		var req_data = {
			country_code: window._country_code,
			mine_only: false,
			open_only: true
		};

		$.ajax({
			url: '/cherry_api/get_playlist_list',
			type: 'POST',
			data: JSON.stringify(req_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				if(res.ok){
					self._playlist_list = res.playlist_list;
					self.DISP_playlist_list();
				}else{
					console.log('res.err_code ' + res.err_code);
					if(res.err_code == -1){
						//login required
					}else{
						alert(res.err);
					}
				}
			}
		});
	};

	/////////////////////////////////////////////////////////////

	this.DISP_playlist_list = function(){
		var h = `
			<table class="table table-sm table-striped" style="margin: 0px">
			<tr>
				<th>Title</th>
				<th>Like</th>
				<th>User</th>
			</tr>
		`;

		for(var i=0 ; i<self._playlist_list.length ; i++){
			var p = self._playlist_list[i];
			var title_encoded = encodeURI(p.title);
			var on_click_title = `window._router.Go('/${window._country_code}/open_playlist_detail.go?pid=${p.playlist_uid}')`;

			h += `
			<tr>
				<td style="cursor:pointer" onClick="${on_click_title}">${p.title}</td>
				<td style="cursor:pointer" onClick="${on_click_title}">${p.like_count}</td>
				<td style="cursor:pointer" onClick="${on_click_title}">${p.user_name}</td>
			</tr>
			`;
		}

		h += '</table>';

		$('#id_div_open_playlist_list').html(h);
	};
}