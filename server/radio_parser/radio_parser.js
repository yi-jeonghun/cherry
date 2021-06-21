var https = require('https');

function RadioParser(){
	var self = this;

	this.GetPlaylist = async function(parser_type, parser_info, date){
		return new Promise(async function(resolve, reject){
			try{
				var date_str = date.replace(/-/g, '');
				console.log('date_str ' + date_str);

				var url = '';
				if(parser_type == 'kbs'){
					url = `https://kong2017.kbs.co.kr/api/mobile/select_song_list?program_code=${parser_info}&request_date=${date_str}&page=1&page_size=7`;					
				}

				var data = await self.FetchContentFromURL(url);
				// console.log('data ' + data);
				var playlist = [];
				var response = JSON.parse(data);
				if(response.result == 'OK'){
					playlist = response.items;
					for(var i=0 ; i<playlist.length ; i++){
						playlist[i].title = playlist[i].song_title.replace(/\u03a8/g, ' & ');
						// console.log('artist ' + playlist[i].artist);
						playlist[i].artist = playlist[i].artist.replace(/\u03a8/g, ' & ');
						// console.log('artist ' + playlist[i].artist);
					}
				}
				resolve(playlist);		
			}catch(err){
				reject(err);
			}
		});
	};

	this.FetchContentFromURL = async function(url){
		return new Promise(function(resolve, reject){
			// console.log('fetch url ' + url);
			var request = https.request(url, function (response) {
				var data = '';
				response.on('data', function (chunk) {
					// console.log('chunk ' + chunk);
					data += chunk;
				});
				response.on('end', async function () {
					// console.log('on end ' );
					resolve(data);
				});
			});

			request.on('error', function (e) {
				console.log(e.message);
				reject(e);
			});
		
			request.end();
		});
	};

}

module.exports = new RadioParser();