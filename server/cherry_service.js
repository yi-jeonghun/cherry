const db_conn = require('./db_conn');
// const { triggerAsyncId } = require('async_hooks');

function CherryService(){
	var self = this;

	this.AddArtist = async function(artist_name, is_various){
		return new Promise(async function(resolve, reject){
			var conn = null;
			artist_name = artist_name.trim();
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INTO artist( name, is_various )' +
					' VALUES (?, ?)';
				
				var val_various = is_various == true ? 'Y' : 'N';
				var val = [artist_name, val_various];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddArtist #0');
					}else{
						resolve(result.insertId);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddVariousArtist = async function(artist_id, member_artist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INFO artist_various(artist_id, member_artist_id) VALUES(?, ?)';
				var val = [artist_id, member_artist_id];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddVariousArtist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddVariousArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateIsVarious = async function (artist_id){
		return new Promise(async function(resolve, reject){
			console.log('UpdateIsVarious ' + artist_id);
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'UPDATE artist SET ? WHERE ?';
				var val = [
					{is_various: 'y'},
					{artist_id: artist_id}
				];
	
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL UpdateIsVarious #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL UpdateIsVarious #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.SearchVariousArtist = function(member_artist_id_list){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT artist_id, GROUP_CONCAT(member_artist_id) member_arr
					FROM artist_various av
					WHERE av.artist_id IN (
						SELECT av_sub.artist_id
						FROM artist_various av_sub
						WHERE av_sub.member_artist_id IN (?)
						GROUP BY artist_id
					)
					GROUP BY artist_id
				`;
				var str_list = member_artist_id_list.join(',');
				console.log('str_list ' + str_list);
				var val = [str_list];
	
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL UpdateIsVarious #0');
					}else{
						console.log('result count ' + result.length);
						if(result.length == 0){
							resolve({
								found:false
							});
						}else{
							var artist_id = self.FindSameVariousArtistID(member_artist_id_list, result);
							if(artist_id == -1){
								resolve({
									found:false
								});
							}else{
								resolve({
									found:true,
									artist_id: artist_id
								});
							}
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL UpdateIsVarious #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.FindSameVariousArtistID = function(member_artist_id_list, result){
		console.log('FindSameVariousArtistID ' );
		for (var i=0; i<result.length; i++) {
			console.log('artist_id ' + result[i].artist_id + ' members ' + result[i].member_arr);
		}		

		for (var i=0; i<result.length; i++) {
			var mem_arr = result[i].member_arr.split(',');
			for(var m=0 ; m<mem_arr.length ; m++){
				console.log('mem_arr ' + mem_arr[m]);
			}

			console.log('member_artist_id_list.length ' + member_artist_id_list.length + ' mem_arr.length ' + mem_arr.length);
			if(member_artist_id_list.length != mem_arr.length){
				continue;
			}

			var contain_cnt = 0;
			for(var a=0 ; a<member_artist_id_list.length ; a++){
				var id1 = member_artist_id_list[a];
				console.log('include id1 ' + id1);

				for(var m=0 ; m<mem_arr.length ; m++){
					var id2 = mem_arr[m];
					console.log('id2 ' + id2);
					if(id1 == id2){
						contain_cnt++;
						console.log('contain_cnt ' + contain_cnt);
						continue;
					}
				}
			}

			if(contain_cnt == member_artist_id_list.length){
				console.log('found result[i].artist_id ' + result[i].artist_id);
				return result[i].artist_id;
			}
		}
		return -1;
	};

	this.GetArtistList = async function(){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'SELECT * FROM artist';
				var val = [];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetArtistList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetArtistList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.SearchArtist = async function(artist_name){
		return new Promise(async function(resolve, reject){
			console.log('SearchArtist ' + artist_name);
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'SELECT artist_id FROM artist WHERE name=?';
				var val = [artist_name];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchArtist #0');
					}else{
						var ret_data = {
							found:false,
							artist_id:-1
						}
						if(result.length > 0){
							ret_data.found = true;
							ret_data.artist_id = result[0].artist_id;
							resolve(ret_data)
						}else{
							resolve(ret_data);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SearchArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.SearchArtistLike = async function(artist_name){
		return new Promise(async function(resolve, reject){
			console.log('SearchArtist ' + artist_name);
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'SELECT * FROM artist WHERE LOWER(name) LIKE ?';
				var val = [artist_name + '%'];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchArtist #0');
					}else{
						console.log('result len ' + result.length);
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SearchArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddVariousArtist = async function(artist_id, member_artist_id){
		return new Promise(async function(resolve, reject){
			console.log('AddVariousArtist ' + artist_id + ' member ' + member_artist_id);
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'INSERT INTO artist_various( artist_id, member_artist_id ) VALUES (?, ?)';
				var val = [artist_id, member_artist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddVariousArtist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SearchArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.FindSameMusic = async function(music){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'SELECT count(*) cnt FROM music WHERE artist_id=? and title=? and video_id=?';
				var val = [music.artist_id, music.title, music.video_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService FindSameMusic #0');
					}else{
						if(result.length > 0){
							if(result[0].cnt > 0){
								resolve(true);
							}else{
								resolve(false);
							}
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService FindSameMusic #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddMusic = async function(music){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INTO music( artist_id, title, video_id )' +
					' VALUES (?, ?, ?)';
				var val = [music.artist_id, music.title, music.video_id];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddMusic #0');
					}else{
						resolve(result.insertId);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddMusic #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateMusic = async function(music){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'UPDATE music SET ? WHERE ?';
				var val = [
					{
						artist_id: music.artist_id,
						title:     music.title,
						video_id:  music.video_id,
					},
					{
						music_id: music.music_id
					}
				];

				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddMusic #0');
					}else{
						resolve(result.insertId);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddMusic #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicInfo = function(music_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT m.music_id, m.artist_id, a.is_various, m.title, m.video_id
				FROM music m
				JOIN artist a
				ON m.artist_id=a.artist_id
				WHERE music_id=?				
				`;
				var val = [music_id];

				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetMusicInfo #0');
					}else{
						resolve(result[0]);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetMusicInfo #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteMusic = async function(music_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM music WHERE music_id=?';
				var val = [music_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteMusic #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteMusic #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicList = async function(music){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT m.music_id, a.name AS artist, m.title, m.video_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				sql += 'ORDER BY m.music_id DESC ';
				sql += 'LIMIT 10 ';
				var val = [];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetMusicList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetMusicList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicById = async function(music_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT m.music_id, a.name AS artist, m.title, m.video_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				sql += 'WHERE m.music_id = ? ';
				var val = [music_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetMusicById #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetMusicById #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};
	
	this.GetMusicListByArtist = async function(artist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT m.music_id, a.name AS artist, m.title, m.video_id, m.music_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				sql += 'WHERE m.artist_id = ?';
				var val = [artist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchMusicByKeyword #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SearchMusicByKeyword #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicListByArtistSearch = async function(keyword){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT m.music_id, a.name AS artist, a.artist_id, a.is_various, m.title, m.video_id, m.music_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				sql += 'WHERE m.artist_id IN ( ';
				sql += '	SELECT ia.artist_id FROM artist ia WHERE ia.name LIKE "%' + keyword + '%" ';
				sql += ') ';

				var val = [];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetMusicListByArtistSearch #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetMusicListByArtistSearch #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicListByVariousArtist = async function(member_artist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_id, a.name AS artist, m.title, m.video_id, m.music_id
					FROM music m
					JOIN artist a
					ON m.artist_id = a.artist_id
					WHERE m.artist_id IN (
						SELECT VA.artist_id FROM artist_various VA WHERE VA.member_artist_id=?
					)
				`;

				var val = [member_artist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetMusicListByVariousArtist #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetMusicListByVariousArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.SearchMusicListByTitle = async function(keyword){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT m.music_id, a.name AS artist, a.artist_id, a.is_various, m.title, m.video_id, m.music_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				sql += 'WHERE m.title LIKE "%' + keyword + '%" ';

				var val = [];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchMusicListByTitle #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SearchMusicListByTitle #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.SearchMusicSmart = async function(keyword){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT m.music_id, a.name AS artist, m.title, m.video_id, m.music_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				sql += 'WHERE m.title LIKE "%' + keyword + '%" ';

				var val = [];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchMusicListByTitle #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SearchMusicListByTitle #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};
}

module.exports = new CherryService();