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
						};
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

	this.IsMyLikeArtiat = async function(user_id, artist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'SELECT count(*) cnt FROM like_artist WHERE user_id=? AND artist_id=?';
				var val = [user_id, artist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService IsMyLikeArtiat #0');
					}else{
						if(result[0].cnt > 0){
							resolve(true);
						}else{
							resolve(false);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService IsMyLikeArtiat #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.IsMyLikePlaylist = async function(user_id, playlist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			console.log('user_id ' + user_id);
			try{
				conn = await db_conn.GetConnection();
				var sql = 'SELECT count(*) cnt FROM like_playlist WHERE user_id=? AND playlist_id=?';
				var val = [user_id, playlist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService IsMyLikePlaylist #0');
					}else{
						if(result[0].cnt > 0){
							console.log('result[0].cnt	' + result[0].cnt);
							resolve(true);
						}else{
							resolve(false);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService IsMyLikePlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateArtistLike = async function(artist_id, user_id, is_like){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = '';
				if(is_like){
					sql = `
					INSERT INTO like_artist (user_id, artist_id) VALUES (?, ?)
					`;
				}else{
					sql = `
					DELETE FROM like_artist WHERE user_id=? and artist_id=?
					`;
				}
				var val = [user_id, artist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdateArtistLike #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdateArtistLike #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdatePlaylistLike = async function(playlist_id, user_id, is_like){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = '';
				if(is_like){
					sql = `
					INSERT INTO like_playlist (user_id, playlist_id) VALUES (?, ?)
					`;
				}else{
					sql = `
					DELETE FROM like_playlist WHERE user_id=? and playlist_id=?
					`;
				}
				var val = [user_id, playlist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdatePlaylistLike #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdatePlaylistLike #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateArtistLikeCount = async function(artist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				UPDATE artist SET like_count = (
					SELECT count(*) FROM like_artist WHERE artist_id=?
				)
				WHERE artist_id=?
				`;
				var val = [artist_id, artist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdateArtistLikeCount #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdateArtistLikeCount #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdatePlaylistLikeCount = async function(playlist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				UPDATE playlist SET like_count = (
					SELECT count(*) FROM like_playlist WHERE playlist_id=?
				)
				WHERE playlist_id=?
				`;
				var val = [playlist_id, playlist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdatePlaylistLikeCount #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdatePlaylistLikeCount #1');
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

	this.GetArtistList_I_Like = async function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT * FROM artist WHERE artist_id IN (
					SELECT artist_id FROM like_artist
					WHERE user_id=?
				) 
				`;
				var val = [user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchArtist #0');
					}else{
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

	this.GetPlaylistList_I_Like = async function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT * FROM playlist WHERE playlist_id IN (
					SELECT playlist_id FROM like_playlist WHERE user_id=?
				)
				`;
				var val = [user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetPlaylistList_I_Like #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetPlaylistList_I_Like #1');
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
				var sql = `
					SELECT t.cnt t_cnt, v.cnt v_cnt
					FROM (
						SELECT COUNT(*) cnt FROM music WHERE artist_id=? AND title=?
					) t,
					(
						SELECT COUNT(*) cnt FROM music WHERE artist_id=? AND video_id=?
					) v
				`;
				var val = [music.artist_id, music.title, music.artist_id, music.video_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService FindSameMusic #0');
					}else{
						resolve(result[0]);
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

	this.AddMusic = async function(music, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INTO music( artist_id, title, video_id, user_id )' +
					' VALUES (?, ?, ?, ?)';
				var val = [music.artist_id, music.title, music.video_id, user_id];
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
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_id, a.name AS artist, m.title, m.video_id, m.music_id, u.name user_name
					FROM music m 
					JOIN artist a ON m.artist_id = a.artist_id 
					JOIN user u ON m.user_id = u.user_id
					WHERE m.artist_id = ?
				`;
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

	this.GetMusicListByArtistNameLike = async function(artist_name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_id, m.artist_id, a.name AS artist, m.title, m.video_id, m.user_id
					FROM music m
					JOIN artist a ON m.artist_id=a.artist_id
					WHERE m.artist_id IN(
					SELECT aa.artist_id FROM artist aa WHERE LOWER(aa.name) LIKE ?
					)
					ORDER BY a.name
				`;
				var val = [artist_name + '%'];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetMusicListByArtistNameLike #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetMusicListByArtistNameLike #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicListByArtistSearch = async function(keyword){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_id, a.name AS artist, a.artist_id, a.is_various, m.title, m.video_id, m.music_id, u.name user_name
					FROM music m 
					JOIN artist a ON m.artist_id = a.artist_id 
					JOIN user u ON m.user_id = u.user_id
					WHERE m.artist_id IN ( 
						SELECT ia.artist_id FROM artist ia WHERE ia.name LIKE "%${keyword}%" 
					) 
				`;
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
					SELECT m.music_id, a.name AS artist, m.title, m.video_id, m.music_id, u.name user_name
					FROM music m
					JOIN artist a	ON m.artist_id = a.artist_id
					JOIN user u ON m.user_id = u.user_id
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
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_id, a.name AS artist, a.artist_id, a.is_various, m.title, m.video_id, m.music_id, u.name user_name
					FROM music m 
					JOIN artist a ON m.artist_id = a.artist_id 
					JOIN user u ON m.user_id = u.user_id
					WHERE m.title LIKE "%${keyword}%" 
				`;

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

	this.SearchMusicSmart = async function(){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_id, a.name AS artist, m.title, m.video_id, m.music_id, u.name user_name
					FROM music m 
					JOIN artist a ON m.artist_id = a.artist_id 
					JOIN user u ON m.user_id = u.user_id
					WHERE m.title LIKE "%${keyword}%" 
				`;

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

	this.CheckSamePlaylist = async function(playlist_title, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT count(*) cnt FROM playlist
				WHERE user_id=? and title=?
				`;
				var val = [user_id, playlist_title];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService CheckSamePlaylist #0');
					}else{
						if(result[0].cnt > 0){
							resolve(true);
						}else{
							resolve(false);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService CheckSamePlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.CheckMyPlaylist = async function(playlist_id, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT user_id FROM playlist WHERE playlist_id=?
				`;
				var val = [playlist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService CheckMyPlaylist #0');
					}else{
						if(result.length > 0){
							if(result[0].user_id == user_id){
								resolve(true);
							}else{
								resolve(false);
							}
						}else{
							resolve(false);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService CheckMyPlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddPlaylist = async function(playlist, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				INSERT INTO playlist(country_code, user_id, title, comment, like_count, is_open, timestamp_created,   timestamp_updated) 
				VALUES(              ?,            ?,        ?,    ?,       0,          ?,       CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP() )
				`;
				var is_open = playlist.is_open == true ? 'Y' : 'N';
				var val = [playlist.country_code, user_id, playlist.title, playlist.title, is_open];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddPlaylist #0');
					}else{
						resolve(result.insertId);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddPlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdatePlaylist = async function(playlist, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'UPDATE playlist SET ?, timestamp_updated=CURRENT_TIMESTAMP() WHERE ?';
				var val = [
					{
						country_code: playlist.country_code,
						user_id: user_id,
						title: playlist.title,
						comment: playlist.comment,
						is_open: playlist.is_open == true ? 'Y':'N',
					},
					{
						playlist_id: playlist.playlist_id
					}
				];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdatePlaylist #0');
					}else{
						resolve(result.insertId);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdatePlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};


	this.GetPlaylistInfo = async function(playlist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT p.playlist_id, p.country_code, p.user_id, u.name as user_name, p.title, p.comment, p.like_count, p.is_open, p.timestamp_created, p.timestamp_updated
				FROM playlist p
				JOIN user u ON u.user_id = p.user_id
				WHERE p.playlist_id=?
				`;
				var val = [playlist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetPlaylistInfo #0');
					}else{
						if(result.length > 0){
							resolve(result[0]);
						}else{
							reject('FAIL CherryService No Playlist of playlist_id ' + playlist_id);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetPlaylistInfo #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetPlaylistList = async function(country_code, mine_only, open_only, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT p.playlist_id, p.country_code, p.user_id, u.name as user_name, p.title, p.comment, p.like_count, p.is_open, p.timestamp_created, p.timestamp_updated
				FROM playlist p
				JOIN user u ON u.user_id = p.user_id
				WHERE p.country_code=?
				`;

				if(mine_only){
					sql += 'AND p.user_id=?';
				}
				if(open_only){
					sql += 'AND is_open="Y"';
				}

				var val = [country_code];
				if(mine_only){
					val.push(user_id);
				}

				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetPlaylistList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetPlaylistList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdatePlaylistMusic = async function(playlist_id, music_id_list){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				await self.DeletePlaylistMusics(conn, playlist_id);
				for(var i=0 ; i<music_id_list.length ; i++){
					var sort = (i+1);
					await self.AddPlaylistMusic(conn, playlist_id, music_id_list[i], sort);
				}
				resolve();
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetPlaylistList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddMusicListToPlaylist = async function(playlist_id, music_id_list, begin_order){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_id_list.length ; i++){
					var sort = i + begin_order;
					await self.AddPlaylistMusic(conn, playlist_id, music_id_list[i], sort);
				}
				resolve();
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddMusicListToPlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeletePlaylistMusics = async function(conn, playlist_id){
		return new Promise(function(resolve, reject){
			try{
				var sql = `DELETE FROM playlist_music WHERE playlist_id=?`;
				var val = [playlist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeletePlaylistMusics #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeletePlaylistMusics #1');
			}
		});
	};

	this.AddPlaylistMusic = async function(conn, playlist_id, music_id, sort){
		return new Promise(function(resolve, reject){
			try{
				var sql = `
				INSERT INTO playlist_music (playlist_id, music_id, sort)
				VALUES (?, ?, ?)
				`;
				var val = [playlist_id, music_id, sort];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddPlaylistMusic #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddPlaylistMusic #1');
			}
		});
	};

	this.GetPlaylistMusicList = async function(playlist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT m.music_id, a.name AS artist, a.artist_id, a.is_various, m.title, m.video_id, m.music_id, u.name user_name
				FROM music m 
				JOIN artist a ON m.artist_id = a.artist_id 
				JOIN user u ON m.user_id = u.user_id
				WHERE m.music_id IN(
					SELECT pm.music_id FROM playlist_music pm WHERE playlist_id=?
				)
				`;
				var val = [playlist_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetPlaylistMusicList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetPlaylistMusicList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeletePlaylist = async function(playlist_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				DELETE FROM playlist WHERE playlist_id=?
				`;
				var val = [playlist_id];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeletePlaylist #0');
					}else{
						await self.DeletePlaylistMusics(conn, playlist_id);
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeletePlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteMusicFromPlaylist = async function(playlist_id, music_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				DELETE FROM playlist_music WHERE playlist_id=? and music_id=?
				`;
				var val = [playlist_id, music_id];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteMusicFromPlaylist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteMusicFromPlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.SearchPlaylistByTitleLike = async function(keyword, country_code){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT * FROM playlist  
					WHERE is_open='Y' AND country_code=? AND title LIKE ?
					ORDER BY like_count desc
				`;
				var val = [country_code, "%"+keyword+"%"];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchPlaylistByTitleLike #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SearchPlaylistByTitleLike #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};
}

module.exports = new CherryService();