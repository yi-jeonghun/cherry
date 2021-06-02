function YoutubeSearchControl(){
	var self = this;
	this._api_key = 'AIzaSyAavEwSLYg0zl1fxk_5uAZdx3_4tzbmSyQ';
	this._youtube_video_list = [];
	this._cb_on_duration_updated = null;
	this._keyword = null;
	this._next_page_token = null;

	this.Search = function(keyword, is_next, cb_on_searched, cb_on_duration_updated){
		self._youtube_video_list = [];
		self._cb_on_duration_updated = cb_on_duration_updated;

		if(keyword == ''){
			return;
		}
		console.log('youtube search keyword : ' + keyword);
		//nextPageToken

		keyword = encodeURI(keyword);
		var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${keyword}&type=video&key=${self._api_key}`;
		if(is_next){
			url += `&pageToken=${self._next_page_token}`;
		}

		$.ajax({
			url: url,
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				// console.log(res);
				self._next_page_token = res.nextPageToken;
				for(var i=0 ; i<res.items.length ; i++){
					var item = res.items[i];
					var video = {
						video_id: item.id.videoId,
						title:    item.snippet.title,
						img_src:  `https://img.youtube.com/vi/${item.id.videoId}/0.jpg`,
						channel:  item.snippet.channelTitle,
						duration: ''
					};
					self._youtube_video_list.push(video);
				}
				self.FetchYoutubeVideosInfo();

				if(cb_on_searched){
					cb_on_searched(self._youtube_video_list);
				}
			}
		});	
	};

	this.FetchYoutubeVideosInfo = function(){
		var video_id_arr = [];
		for(var i=0 ; i<self._youtube_video_list.length ; i++){
			var video = self._youtube_video_list[i];
			if(i == 0){
				// console.log(' ' + JSON.stringify(item, null, '\t'));
			}
			video_id_arr.push(video.video_id);
		}
		var video_id_list_str = video_id_arr.join(',');
		// console.log('video_id_list_str ' + video_id_list_str);
		var url = `https://www.googleapis.com/youtube/v3/videos?id=${video_id_list_str}&part=snippet,contentDetails&fields=items(etag,id,snippet(publishedAt,title,thumbnails(default(url)),tags),contentDetails(duration))&key=${self._api_key}`;
		$.ajax({
			url: url,
			type: 'GET',
			data: null,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function (res) {
				for(var i=0 ; i<res.items.length ; i++){
					var item = res.items[i];

					for(var v=0 ; v<self._youtube_video_list.length ; v++){
						if(self._youtube_video_list[v].video_id == item.id){
							var dur = self.ConvertTimeformat(item.contentDetails.duration);
							self._youtube_video_list[v].duration = dur;
							break;;
						}
					}
				}
				if(self._cb_on_duration_updated){
					self._cb_on_duration_updated(self._youtube_video_list);
				}
			}
		});	
	};

	this.ConvertTimeformat = function(pt){
		console.log('pt ' + pt);
		var tmp = pt.replace('PT', '');
		var h = 0;
		var m = 0;
		var s = 0;
		if(tmp.includes('H')){
			h = tmp.split('H')[0];
			tmp = tmp.substr(tmp.indexOf('H')+1);
		}
		if(tmp.includes('M')){
			m = tmp.split('M')[0];
			tmp = tmp.substr(tmp.indexOf('M')+1);
		}
		if(tmp.includes('S')){
			s = tmp.split('S')[0];
		}

		var h_str = h >= 10 ? h : '0'+h;
		var m_str = m >= 10 ? m : '0'+m;
		var s_str = s >= 10 ? s : '0'+s;

		var str = '';
		if(h > 0){
			str = h_str + ':' + m_str + ':' + s_str;
		}else{
			str = m_str + ':' + s_str;
		}
		return str;
	};
}
