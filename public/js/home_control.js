$('document').ready(function(){
	window._home_control = new HomeControl().Init();
});

function HomeControl(){
	var self = this;
	this._playlist_list = [];

	this.Init = function(){
		self.GetHomeContents();
		return this;
	};

	this.GetHomeContents = function(){
		var req = {
			country_code: window._country_code
		};
		POST(`/cherry_api/home/get_home_contents`, req, res=>{
			if(res.ok){
				self._playlist_list = res.playlist_list;
				self.DISP_PlaylistList();
			}else{
				alert('Fail to get home contents');
			}
		})
	};

	this.ListenPlaylist = function(playlist_uid){
		var req = {
			playlist_uid: playlist_uid
		};
		POST('/cherry_api/get_playlist_info', req, res=>{
			if(res.ok){
				window._cherry_player.LoadMusicList(res.music_list);
			}else{
				alert(res.err);
			}
		});
	};

	//------------------------------------------------------

	this.DISP_PlaylistList = function(){
		var h = '';

		for(var i=0 ; i<self._playlist_list.length ; i++){
			var p = self._playlist_list[i];
			var on_click_title = `window._router.Go('/${window._country_code}/open_playlist_detail.go?pid=${p.playlist_uid}')`;
			var on_click_play = `window._home_control.ListenPlaylist('${p.playlist_uid}')`;

			var video_id_0 = '';
			var video_id_1 = '';
			var video_id_2 = '';
			var video_id_3 = '';
			{
				if(p.video_id_list != null){
					var tmp_list = p.video_id_list.split(',');
					console.log('video_id_list.len ' + tmp_list.length);
					for(var j=0 ; j<tmp_list.length ; j++){
						if(j==0) video_id_0 = tmp_list[0];
						if(j==1) video_id_1 = tmp_list[1];
						if(j==2) video_id_2 = tmp_list[2];
						if(j==3) video_id_3 = tmp_list[3];
						if(j >= 3) break;
					}
				}
			}

			h += `
				<div class="row border" style="margin-bottom:2px;">
					<div class="d-flex " style="width:calc( 100% - 75px);">
						<div style="width:100px: height:100px">
							<div class="d-flex">
								<div>
									<image style="height: 25px; width: 25px; padding: 0px; margin: 0px" src="https://img.youtube.com/vi/${video_id_0}/0.jpg">
								</div>
								<div>
									<image style="height: 25px; width: 25px; padding: 0px; margin: 0px" src="https://img.youtube.com/vi/${video_id_1}/0.jpg">
								</div>
							</div>
							<div class="d-flex">
								<div>
									<image style="height: 25px; width: 25px; padding: 0px; margin: 0px" src="https://img.youtube.com/vi/${video_id_2}/0.jpg">
								</div>
								<div>
									<image style="height: 25px; width: 25px; padding: 0px; margin: 0px" src="https://img.youtube.com/vi/${video_id_3}/0.jpg">
								</div>
							</div>
						</div>
						<div class="pl-1">
							<div class="text-dark">
								<span class="pointer border-bottom" onClick="${on_click_title}">${p.title}</span>
							</div>
							<div class="text-secondary" style="font-size:0.8em">
								<span class="border-bottom" style="margin-right: 5px">${p.user_name}</span>
							</div>
						</div>
					</div>
					<div class="text-right d-flex " style="padding-top:5px;">
						<div>
							<span class="badge pointer" style="width:33px; height:33px; padding-top:10px;" >
								<i class="fas fa-heart"></i>
							</span>
							<div class="text-center" style="font-size:0.5em"></div>
						</div>
						<div>
							<span class="badge pointer" style="width:33px; height:33px; padding-top:10px;" onClick="${on_click_play}">
								<i class="fas fa-play"></i>
							</span>
						</div>
					</div>
				</div>
			`;
		}

		$('#id_div_home_playlist_list').html(h);
	};
}
