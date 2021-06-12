var fs = require('fs');
var https = require('https');

function LyricsParser(){
	var self = this;
	this._html = null;

	this.GetLyrics = async function(url){
		return new Promise(async function(resolve, reject){
			console.log('url ' + url);
			self._html = await self.FetchContentFromURL(url);
			console.log('self._html ' + self._html.length);
			var lyrics = await self.Pasrse();
			resolve(lyrics);
		});
	};

	this.WriteHtml = async function(data){
		return new Promise(function(resolve, reject){
			fs.writeFile('google.html', self._html, function (err) {
				if (err) {
					reject(err);
				}
				console.log('file write success');
				resolve();
			});
		});
	};

	this.FetchContentFromURL = async function(url){
		return new Promise(function(resolve, reject){
			console.log('fetch url ' + url);
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

	this.LoadHtmlFile = async function(){
		return new Promise(function(resolve, reject){
			var file_name = `google_sample.html`;
			fs.readFile(file_name, 'utf8', function(err, data){		
				if(err){
					console.log(err);
					reject(err.message);
				}
				self._html = data;
				resolve();
			});
		});
	};

	this.Pasrse = async function(){
		return new Promise(async function(resolve, reject){
			var begin_key = '<div class="hwc"><div class="BNeawe tAd8D AP7Wnd"><div><div class="BNeawe tAd8D AP7Wnd">';
			var begin_idx = self._html.indexOf(begin_key);
			var lyrics = null;
			if(begin_idx != -1){
				lyrics = await self.GetDiv(begin_idx + begin_key.length);
			}
			resolve(lyrics);
		});
	};

	this.GetDiv = async function(begin_idx){
		return new Promise(function(resolve, reject){
			var end_idx = self._html.indexOf('</div>', begin_idx);
			var line = self._html.substr(begin_idx, end_idx - begin_idx);
			resolve(line);
		});
	}
}

module.exports = new LyricsParser();