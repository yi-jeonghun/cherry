const util = require('../util');

/**
title, artist를 차례대로 발견해야 함.

title은 
 	class="songs-list-row__song-name" 가 
 	발견되는 같은 줄에 > 문자열 다음 부터 < 까지 있음.
artist는 
 	class="songs-list-row__link" tabindex="-1" 가 발견되는 그 줄에 artist가 있음.

		case1) <a>가수</a>
		case2) 하나의 <a>가수1, 가수2 &amp; 가수3</a>
     <span><a href="https://music.apple.com/WebObjects/MZStore.woa/wa/viewCollaboration?cc=kr&amp;ids=1509202338-1483178706-1280943441-1478713949" class="songs-list-row__link" tabindex="-1">미란이, 먼치맨, 쿤디판다 &amp; 머쉬베놈</a></span>
		case3) <a>가수</a>,<a>가수</a>&amp;<a>가수</a>
     <span><a href="https://music.apple.com/us/artist/young-stoner-life/1545184404" class="songs-list-row__link" tabindex="-1" dir="auto">Young Stoner Life</a>, <a href="https://music.apple.com/us/artist/young-thug/81886939" class="songs-list-row__link" tabindex="-1" dir="auto">Young Thug</a>,   <a href="https://music.apple.com/us/artist/gunna/1236267297" class="songs-list-row__link" tabindex="-1" dir="auto">Gunna</a></span>


*/

function ParserApple1() {
	var self = this;
	this._music_list = [];
	this._title_key = 'class="songs-list-row__song-name"';
	this._artist_key1 = 'class="songs-list-row__link" tabindex="-1"';

	this.Parse = async function (data) {
		return new Promise(function (resolve, reject) {
			console.log('data ' + data.length);
			self._music_list = [];
			try {
				if(data == null){
					reject('data is null');
					return;
				}
				var arr = data.split('\n');

				console.log('arr len ' + arr.length);
				var title = null;
				var artist = null;

				for (var i = 0; i < arr.length; i++) {
					var line = arr[i];
					// console.log(line );

					if (title == null) {
						if (line.includes(self._title_key)) {
							line = line.replace('<!--%+b:27%-->', '').replace('<!--%-b:27%-->', '');
							title = self.ExtractTitle(line, self._title_key, '>', '<');
							// console.log('title ' + title);
							continue;
						}
					} else {
						if (line.includes(self._artist_key1)) {
							console.log('artist found');
							artist = self.ExtractArtist(line);
							artist = artist.replace(/&amp;/g, ',');
							artist = artist.replace(/ ,/g, ',');
							
							self._music_list.push({
								title: title,
								artist: artist
							});
							console.log('artist ' + artist + ' title ' + title);
							title = null;
							artist = null;
							continue;
						}
					}
				}

				console.log('self._music_list ' + self._music_list.length);
				resolve(self._music_list);
				console.log('resolved ' );
			} catch (err) {
				console.log(err);
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

	this.ExtractArtist = function(line){
		var artist_list = [];
		var a_arr = line.split('<a');
	
		for (let i = 0; i < a_arr.length; i++) {
			const a = a_arr[i];
			var end_a_idx = a.indexOf('</a>');
			if(end_a_idx != -1){
				var value = a.substr(a.indexOf('>')+1);
				value = value.split('</a')[0];

				value = value.replace('<!--%+b:36%-->', '');
				value = value.replace('<!--%-b:36%-->', '');

				artist_list.push(value);
			}
		}
	
		return artist_list.join(', ');
	}	
}

module.exports = new ParserApple1();