var https = require('https');
const util = require('../util');

function EraParser(){
	var self = this;

	this.get_auto_chart = function(site, year){
		return new Promise(async function(resolve, reject){
			var url = '';
			var music_list = [];
			if(site == 'melon'){
				url = `https://www.melon.com/chart/age/list.htm?idx=2&chartType=YE&chartGenre=KPOP&chartDate=${year}&moved=Y`;
				console.log('url ' + url);
				var html = await self.FetchContentFromURL(url);	
				music_list = await self.MelonParse(html);
				// console.log('music_list len ' + music_list.length);
			}
	
			resolve(music_list);
		});
	};

	this.FetchContentFromURL = async function(url){
		return new Promise(function(resolve, reject){
			var request = https.request(url, function (response) {
				var data = '';
				response.on('data', function (chunk) {
					data += chunk;
				});
				response.on('end', async function () {
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

	this.MelonParse = function(html){
		return new Promise(function(resolve, reject){
			try{
				var title_key = '<a href="javascript:melon.play.playSong(';
				var artist_key = '<a href="javascript:melon.link.goArtistDetail(';

				var lines = html.split('\n');
				console.log('lines ' + lines.length);
	
				var music_list = [];
				var title = null;
				var artist = null;
				for(var i=0 ; i<lines.length ; i++){
					var line = lines[i];
					// console.log(lines[i]);
					if (title == null) {
						if (line.includes(title_key)) {
							title = self.ExtractTitle(line, title_key, '>', '<');
							continue;
						}
					}else{
						if(line.includes(artist_key)){
							artist = self.ExtractTitle(line, artist_key, '>', '<');
							music_list.push({
								title: title,
								artist: artist
							});
							// console.log('artist ' + artist + ' title ' + title);
							title = null;
							artist = null;
							continue;
						}
					}
				}
				resolve(music_list);	
			}catch(err){
				reject(err);
			}
		});
	};

	this.ExtractTitle = function (line, key, begin, end) {
		var idx = line.indexOf(key);
		var tmp = line.substr(idx + key.length);
		idx = tmp.indexOf(begin);
		tmp = tmp.substr(idx + 1);
		idx = tmp.indexOf(end);
		tmp = tmp.substr(0, tmp.length - (tmp.length - idx));
		tmp = util.UnEscapeHTML(tmp);
		return tmp;
	};

}

module.exports = new EraParser();