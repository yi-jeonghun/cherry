function ParserMelon() {
  var self = this;
  this._music_list = [];

  this.Parse = async function (data) {
    return new Promise(function (resolve, reject) {
      self._music_list = [];
      var title_key = '<a href="javascript:melon.play.playSong';
      var artist_key = '<a href="javascript:melon.link.goArtistDetail';
      try {
				// console.log('data ' + data);

        if (data == null) {
          reject('data is null');
          return;
        }

        var arr = data.split('\n');
        console.log('arr ' + arr.length);
        var title = null;
        var artist = null;

        for (var i = 0; i < arr.length; i++) {
          var line = arr[i];
          if (title == null) {
            if (line.includes(title_key)) {
              title = self.ExtractTitle(line, title_key, '>', '<');
              continue;
            }
          } else {
            if (line.includes(artist_key)) {
              artist = self.ExtractArtist(line);
              self._music_list.push({
                title: title,
                artist: artist
              });
              title = null;
              artist = null;
              continue;
            }
          }
        }

        resolve(self._music_list);
      } catch (err) {
        console.log('FAIL ' + err);
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
    return tmp;
  };

  //melon의 경우 한 줄에 항상 같은 이름이 두번씩 나오기 때문에
  //중복된 이름은 추가하지 않도록 처리해야 함.
  this.ExtractArtist = function(line){
		var artist_list = [];
		var a_arr = line.split('<a');
	
		for (let i = 0; i < a_arr.length; i++) {
			const a = a_arr[i];
			var end_a_idx = a.indexOf('</a>');
			if(end_a_idx != -1){
				var value = a.substr(a.indexOf('>')+1);
				value = value.split('</a')[0];

        if(artist_list.includes(value)){
          continue;
        }else{
          artist_list.push(value);
        }
			}
		}
	
		return artist_list.join(', ');
	}	


}

module.exports = new ParserMelon();