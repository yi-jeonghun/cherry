const db_conn = require('./db_conn');
var randomstring = require("randomstring");

function CherryService(){
	var self = this;

	this.AddArtist = async function(artist_name, is_various){
		return new Promise(async function(resolve, reject){
			var conn = null;
			artist_name = artist_name.trim();
			try{
				var artist_uid = await self.GetArtistUID();
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INTO artist( name, is_various, artist_uid )' +
					' VALUES (?, ?, ?)';
				
				var val_various = is_various == true ? 'Y' : 'N';
				var val = [artist_name, val_various, artist_uid];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddArtist #0');
					}else{
						resolve(artist_uid);
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

	this.AddArtistDiffName = function(org_artist_uid, artist_diff_name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			artist_diff_name = artist_diff_name.trim();
			try{
				var artist_uid = await self.GetArtistUID();
				conn = await db_conn.GetConnection();
				var sql = `
					INSERT INTO artist( name, is_various, artist_uid, is_diff_name, org_artist_uid )
					VALUES            ( ?,    'N',        ?,          'Y',          ?              )
				`;
				
				var val = [artist_diff_name, artist_uid, org_artist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddArtistDiffName #0');
					}else{
						resolve(artist_uid);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddArtistDiffName #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateArtistDiffName = function(artist_uid, artist_diff_name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			artist_diff_name = artist_diff_name.trim();
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					UPDATE artist SET name=? WHERE artist_uid=?
				`;
				
				var val = [artist_diff_name, artist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdateArtistDiffName #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdateArtistDiffName #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateArtistInfo = function(artist_uid, name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			name = name.trim();
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					UPDATE artist SET name=? WHERE artist_uid=?
				`;
				
				var val = [name, artist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdateArtistInfo #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdateArtistInfo #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	/**
	 * artist table에서 diff_name으로 사용되는 레코드를 삭제한다.
	 * @param {} artist_uid 
	 * @returns 
	 */
	this.DeleteArtistDiffName = function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `DELETE FROM artist WHERE artist_uid=? AND is_diff_name='Y'`;				
				var val = [artist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteArtistDiffName #0');
					}else{
						resolve(artist_uid);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteArtistDiffName #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetArtistUID = async function(){
		return new Promise(async function(resolve, reject){
			try{
				var artist_uid = await self.__GetArtistUID__();
				if(artist_uid != null){
					resolve(artist_uid);
					return;
				}

				artist_uid = await self.__GetArtistUID__();
				if(artist_uid != null){
					resolve(artist_uid);
					return;
				}

				artist_uid = await self.__GetArtistUID__();
				if(artist_uid != null){
					resolve(artist_uid);
					return;
				}

				reject('FAIL GetArtistUID #1');
			}catch(err){
				reject('FAIL GetArtistUID #2');
			}
		});
	};

	this.__GetArtistUID__ = async function(){
		return new Promise(async function(resolve, reject){
			try{
				conn = await db_conn.GetConnection();
				var artist_uid = randomstring.generate(10);

				var sql = 'SELECT count(*) cnt FROM artist WHERE artist_uid=?';
				var val = [artist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService __GetArtistUID__ #0');
					}else{
						if(result[0].cnt > 0){
							resolve(null);
						}else{
							resolve(artist_uid);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService __GetArtistUID__ #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddVariousArtist = async function(artist_uid, member_artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INFO artist_various(artist_uid, member_artist_uid) VALUES(?, ?)';
				var val = [artist_uid, member_artist_uid];
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

	this.UpdateIsVarious = async function (artist_uid){
		return new Promise(async function(resolve, reject){
			console.log('UpdateIsVarious ' + artist_uid);
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'UPDATE artist SET ? WHERE ?';
				var val = [
					{is_various: 'y'},
					{artist_uid: artist_uid}
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

	this.SearchVariousArtist = function(member_artist_uid_list){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT artist_uid, GROUP_CONCAT(member_artist_uid) member_arr
					FROM artist_various av
					WHERE av.artist_uid IN (
						SELECT av_sub.artist_uid
						FROM artist_various av_sub
						WHERE av_sub.member_artist_uid IN (?)
						GROUP BY artist_uid
					)
					GROUP BY artist_uid
				`;
				var str_list = member_artist_uid_list.join(',');
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
							var artist_uid = self.FindSameVariousArtistID(member_artist_uid_list, result);
							if(artist_uid == -1){
								resolve({
									found:false
								});
							}else{
								resolve({
									found:true,
									artist_uid: artist_uid
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

	this.FindSameVariousArtistID = function(member_artist_uid_list, result){
		console.log('FindSameVariousArtistID ' );
		for (var i=0; i<result.length; i++) {
			console.log('artist_uid ' + result[i].artist_uid + ' members ' + result[i].member_arr);
		}		

		for (var i=0; i<result.length; i++) {
			var mem_arr = result[i].member_arr.split(',');
			for(var m=0 ; m<mem_arr.length ; m++){
				console.log('mem_arr ' + mem_arr[m]);
			}

			console.log('member_artist_uid_list.length ' + member_artist_uid_list.length + ' mem_arr.length ' + mem_arr.length);
			if(member_artist_uid_list.length != mem_arr.length){
				continue;
			}

			var contain_cnt = 0;
			for(var a=0 ; a<member_artist_uid_list.length ; a++){
				var id1 = member_artist_uid_list[a];
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

			if(contain_cnt == member_artist_uid_list.length){
				console.log('found result[i].artist_uid ' + result[i].artist_uid);
				return result[i].artist_uid;
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
				var sql_register = `SELECT IF(is_diff_name = 'Y', org_artist_uid, artist_uid) as artist_uid FROM artist WHERE name=?`;
				var val = [artist_name];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService SearchArtist #0');
					}else{
						var ret_data = {
							found:false,
							artist_uid:-1
						};
						if(result.length > 0){
							ret_data.found = true;
							ret_data.artist_uid = result[0].artist_uid;
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

	this.IsMyLikeArtiat = async function(user_id, artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'SELECT count(*) cnt FROM like_artist WHERE user_id=? AND artist_uid=?';
				var val = [user_id, artist_uid];
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

	this.IsMyLikePlaylist = async function(user_id, playlist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			console.log('user_id ' + user_id);
			try{
				conn = await db_conn.GetConnection();
				var sql = 'SELECT count(*) cnt FROM like_playlist WHERE user_id=? AND playlist_uid=?';
				var val = [user_id, playlist_uid];
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

	this.UpdateArtistLike = async function(artist_uid, user_id, is_like){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = '';
				if(is_like){
					sql = `
					INSERT INTO like_artist (user_id, artist_uid) VALUES (?, ?)
					`;
				}else{
					sql = `
					DELETE FROM like_artist WHERE user_id=? and artist_uid=?
					`;
				}
				var val = [user_id, artist_uid];
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

	this.UpdatePlaylistLike = async function(playlist_uid, user_id, is_like){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = '';
				if(is_like){
					sql = `
					INSERT INTO like_playlist (user_id, playlist_uid) VALUES (?, ?)
					`;
				}else{
					sql = `
					DELETE FROM like_playlist WHERE user_id=? and playlist_uid=?
					`;
				}
				var val = [user_id, playlist_uid];
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

	this.UpdateArtistLikeCount = async function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				UPDATE artist SET like_count = (
					SELECT count(*) FROM like_artist WHERE artist_uid=?
				)
				WHERE artist_uid=?
				`;
				var val = [artist_uid, artist_uid];
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

	this.UpdatePlaylistLikeCount = async function(playlist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				UPDATE playlist SET like_count = (
					SELECT count(*) FROM like_playlist WHERE playlist_uid=?
				)
				WHERE playlist_uid=?
				`;
				var val = [playlist_uid, playlist_uid];
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

	this.GetArtistInfo = async function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'SELECT * FROM artist WHERE artist_uid=?';
				var val = [artist_uid];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetArtistInfo #0');
					}else{
						if(result.length == 0){
							reject('FAIL CherryService GetArtistInfo #2');
						}else{
							resolve(result[0]);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetArtistInfo #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetArtistDiffNameList = function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'SELECT * FROM artist WHERE org_artist_uid=?';
				var val = [artist_uid];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetArtistDiffNames #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetArtistDiffNames #1');
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
				SELECT * FROM artist WHERE artist_uid IN (
					SELECT artist_uid FROM like_artist
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
				SELECT * FROM playlist WHERE playlist_uid IN (
					SELECT playlist_uid FROM like_playlist WHERE user_id=?
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

	this.GetMusicList_I_Like = async function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT m.music_uid, m.title, m.artist_uid, a.name artist, m.video_id, a.is_various, u.name user_name,
					concat('[',v.member_list_json,']') as member_list_json, 'Y' is_like
				FROM music m
				JOIN artist a ON m.artist_uid=a.artist_uid
				JOIN user as u ON m.user_id=u.user_id
				LEFT JOIN va_member_view as v ON a.artist_uid=v.artist_uid
				WHERE m.music_uid IN(
					SELECT lm.music_uid
					FROM like_music lm
					WHERE lm.user_id=?
				)
				`;
				var val = [user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetMusicList_I_Like #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetMusicList_I_Like #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddVariousArtist = async function(artist_uid, member_artist_uid){
		return new Promise(async function(resolve, reject){
			console.log('AddVariousArtist ' + artist_uid + ' member ' + member_artist_uid);
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'INSERT INTO artist_various( artist_uid, member_artist_uid ) VALUES (?, ?)';
				var val = [artist_uid, member_artist_uid];
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
						SELECT COUNT(*) cnt FROM music WHERE artist_uid=? AND title=?
					) t,
					(
						SELECT COUNT(*) cnt FROM music WHERE artist_uid=? AND video_id=?
					) v
				`;
				var val = [music.artist_uid, music.title, music.artist_uid, music.video_id];
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

	this.GetMusicUID = async function(){
		return new Promise(async function(resolve, reject){
			try{
				var music_uid = await self.__GetMusicUID__();
				if(music_uid != null){
					resolve(music_uid);
					return;
				}

				music_uid = await self.__GetMusicUID__();
				if(music_uid != null){
					resolve(music_uid);
					return;
				}

				music_uid = await self.__GetMusicUID__();
				if(music_uid != null){
					resolve(music_uid);
					return;
				}

				reject('FAIL GetMusicUID #1');
			}catch(err){
				reject('FAIL GetMusicUID #2');
			}
		});
	}

	this.__GetMusicUID__ = async function(){
		return new Promise(async function(resolve, reject){
			try{
				conn = await db_conn.GetConnection();
				var music_uid = randomstring.generate(10);

				var sql = 'SELECT count(*) cnt FROM music WHERE music_uid=?';
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService __GetMusicUID__ #0');
					}else{
						if(result[0].cnt > 0){
							resolve(null);
						}else{
							resolve(music_uid);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService __GetMusicUID__ #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddMusic = async function(music, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				var music_uid = await self.GetMusicUID();
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INTO music(music_uid, artist_uid, title, video_id, user_id )' +
					' VALUES (?, ?, ?, ?, ?)';
				var val = [music_uid, music.artist_uid, music.title, music.video_id, user_id];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddMusic #0');
					}else{
						resolve(music_uid);
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
						artist_uid: music.artist_uid,
						title:     music.title,
						video_id:  music.video_id,
					},
					{
						music_uid: music.music_uid
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

	this.GetMusicInfo = function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT m.music_uid, m.artist_uid, a.is_various, m.title, m.video_id
				FROM music m
				JOIN artist a
				ON m.artist_uid=a.artist_uid
				WHERE music_uid=?
				`;
				var val = [music_uid];

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

	this.DeleteMusic = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM music WHERE music_uid=?';
				var val = [music_uid];
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

	this.DeleteMusicInPlaylistMusic = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM playlist_music WHERE music_uid=?';
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteMusicInPlaylistMusic #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteMusicInPlaylistMusic #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteMusicInTopRankList = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM top_rank_list WHERE music_uid=?';
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteMusicInTopRankList #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteMusicInTopRankList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteMusicInTopRankListDraft = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM top_rank_list_draft WHERE music_uid=?';
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteMusicInTopRankListDraft #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteMusicInTopRankListDraft #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteLyrics = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM lyrics WHERE music_uid=?';
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteLyrics #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteLyrics #1');
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
				sql += 'SELECT m.music_uid, a.name AS artist, m.title, m.video_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_uid = a.artist_uid ';
				sql += 'ORDER BY m.music_uid DESC ';
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

	this.GetMusicById = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT m.music_uid, a.name AS artist, m.title, m.video_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_uid = a.artist_uid ';
				sql += 'WHERE m.music_uid = ? ';
				var val = [music_uid];
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
	
	this.GetMusicListByArtist = async function(user_id, artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				console.log('artist_uid ' + artist_uid);
				var sql = `
					SELECT m.artist_uid, m.music_uid, a.name AS artist, a.is_various, m.title, m.video_id, u.name user_name, m.is_diff_name, m.org_music_uid,
						concat('[',v.member_list_json,']') as member_list_json,
						IF(lm.user_id IS NULL, 'N', 'Y') as is_like,
						IF(l.music_uid IS NULL, 'N', 'Y') as has_lyrics
					FROM music m 
					JOIN artist a ON m.artist_uid = a.artist_uid 
					LEFT JOIN lyrics l ON m.music_uid=l.music_uid
					JOIN user u ON m.user_id = u.user_id
					LEFT JOIN va_member_view as v ON a.artist_uid=v.artist_uid
					LEFT JOIN (
						SELECT * FROM like_music WHERE user_id=?
						) lm ON m.music_uid=lm.music_uid
					WHERE m.artist_uid = ?
				`;

				var val = [user_id, artist_uid];
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
					SELECT m.music_uid, m.artist_uid, a.name AS artist, m.title, m.video_id, m.user_id
					FROM music m
					JOIN artist a ON m.artist_uid=a.artist_uid
					WHERE m.artist_uid IN(
					SELECT aa.artist_uid FROM artist aa WHERE LOWER(aa.name) LIKE ?
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
					SELECT m.music_uid, a.name AS artist, a.artist_uid, a.is_various, m.title, m.video_id, m.music_uid, u.name user_name, m.is_diff_name, m.org_music_uid
					FROM music m 
					JOIN artist a ON m.artist_uid = a.artist_uid 
					JOIN user u ON m.user_id = u.user_id
					WHERE m.artist_uid IN ( 
						SELECT ia.artist_uid FROM artist ia WHERE ia.name LIKE "%${keyword}%" 
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

	this.GetMusicListByVariousArtist = async function(user_id, member_artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_uid, a.name AS artist, a.is_various, m.title, m.video_id, m.music_uid, u.name user_name,
						concat('[',v.member_list_json,']') as member_list_json,
						IF(lm.user_id IS NULL, 'N', 'Y') as is_like
					FROM music m
					JOIN artist a	ON m.artist_uid = a.artist_uid
					JOIN user u ON m.user_id = u.user_id
					LEFT JOIN va_member_view as v ON a.artist_uid=v.artist_uid
					LEFT JOIN (
						SELECT * FROM like_music WHERE user_id=?
						) lm ON m.music_uid=lm.music_uid
					WHERE m.artist_uid IN (
						SELECT VA.artist_uid FROM artist_various VA WHERE VA.member_artist_uid=?
					)
				`;

				var val = [user_id, member_artist_uid];
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

	this.SearchMusicListByTitle = async function(keyword, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT m.music_uid, 
						a.name AS artist, a.artist_uid, a.is_various, 
						m.title, m.video_id, m.music_uid, u.name user_name,
						m.is_diff_name, m.org_music_uid,
						concat('[',v.member_list_json,']') as member_list_json,
						IF(lm.user_id IS NULL, 'N', 'Y') as is_like
					FROM music m 
					JOIN artist a ON m.artist_uid = a.artist_uid 
					JOIN user u ON m.user_id = u.user_id
					LEFT JOIN va_member_view as v ON a.artist_uid=v.artist_uid
					LEFT JOIN (
						SELECT * FROM like_music WHERE user_id=?
						) lm ON m.music_uid=lm.music_uid
						WHERE m.title LIKE ? 
				`;

				var val = [user_id, "%"+keyword+"%"];
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
					SELECT m.music_uid, a.name AS artist, m.title, m.video_id, m.music_uid, u.name user_name
					FROM music m 
					JOIN artist a ON m.artist_uid = a.artist_uid 
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

	this.CheckMyPlaylist = async function(playlist_uid, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT user_id FROM playlist WHERE playlist_uid=?
				`;
				var val = [playlist_uid];
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

	this.GetPlaylistUID = async function(){
		return new Promise(async function(resolve, reject){
			try{
				var playlist_uid = await self.__GetPlaylistUID__();
				if(playlist_uid != null){
					resolve(playlist_uid);
					return;
				}

				playlist_uid = await self.__GetPlaylistUID__();
				if(playlist_uid != null){
					resolve(playlist_uid);
					return;
				}

				playlist_uid = await self.__GetPlaylistUID__();
				if(playlist_uid != null){
					resolve(playlist_uid);
					return;
				}

				reject('FAIL GetPlaylistUID #1');
			}catch(err){
				reject('FAIL GetPlaylistUID #2');
			}
		});
	}

	this.__GetPlaylistUID__ = async function(){
		return new Promise(async function(resolve, reject){
			try{
				conn = await db_conn.GetConnection();
				var playlist_uid = randomstring.generate(10);

				var sql = 'SELECT count(*) cnt FROM playlist WHERE playlist_uid=?';
				var val = [playlist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService __GetPlaylistUID__ #0');
					}else{
						if(result[0].cnt > 0){
							resolve(null);
						}else{
							resolve(playlist_uid);
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService __GetPlaylistUID__ #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddPlaylist = async function(playlist, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				var playlist_uid = await self.GetPlaylistUID();
				conn = await db_conn.GetConnection();
				var sql = `
				INSERT INTO playlist(playlist_uid, country_code, user_id, title, comment, like_count, is_open, timestamp_created,   timestamp_updated) 
				VALUES(              ?,            ?,            ?,        ?,    ?,       0,          ?,       CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP() )
				`;
				var is_open = playlist.is_open == true ? 'Y' : 'N';
				var val = [playlist_uid, playlist.country_code, user_id, playlist.title, playlist.title, is_open];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddPlaylist #0');
					}else{
						resolve(playlist_uid);
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
						playlist_uid: playlist.playlist_uid
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


	this.GetPlaylistInfo = async function(playlist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT p.playlist_uid, p.country_code, p.user_id, u.name as user_name, p.title, p.comment, p.like_count, p.is_open, p.timestamp_created, p.timestamp_updated
				FROM playlist p
				JOIN user u ON u.user_id = p.user_id
				WHERE p.playlist_uid=?
				`;
				var val = [playlist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetPlaylistInfo #0');
					}else{
						if(result.length > 0){
							resolve(result[0]);
						}else{
							reject('FAIL CherryService No Playlist of playlist_uid ' + playlist_uid);
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
				SELECT p.playlist_uid, p.country_code, p.user_id, u.name as user_name, p.title, p.comment, p.like_count, p.is_open, p.timestamp_created, p.timestamp_updated
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

	this.UpdatePlaylistMusic = async function(playlist_uid, music_uid_list){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				await self.DeletePlaylistMusics(conn, playlist_uid);
				for(var i=0 ; i<music_uid_list.length ; i++){
					var sort = (i+1);
					await self.AddPlaylistMusic(conn, playlist_uid, music_uid_list[i], sort);
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

	this.AddMusicListToPlaylist = async function(playlist_uid, music_uid_list, begin_order){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_uid_list.length ; i++){
					var sort = i + begin_order;
					await self.AddPlaylistMusic(conn, playlist_uid, music_uid_list[i], sort);
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

	this.DeletePlaylistMusics = async function(conn, playlist_uid){
		return new Promise(function(resolve, reject){
			try{
				var sql = `DELETE FROM playlist_music WHERE playlist_uid=?`;
				var val = [playlist_uid];
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

	this.AddPlaylistMusic = async function(conn, playlist_uid, music_uid, sort){
		return new Promise(function(resolve, reject){
			try{
				var sql = `
				INSERT INTO playlist_music (playlist_uid, music_uid, sort)
				VALUES (?, ?, ?)
				`;
				var val = [playlist_uid, music_uid, sort];
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

	this.GetPlaylistMusicList = async function(playlist_uid, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT m.music_uid, a.name AS artist, a.artist_uid, a.is_various, m.title, m.video_id, m.music_uid, u.name user_name,
					concat('[',v.member_list_json,']') as member_list_json,
					IF(lm.user_id IS NULL, 'N', 'Y') as is_like
				FROM music m 
				JOIN artist a ON m.artist_uid = a.artist_uid 
				JOIN user u ON m.user_id = u.user_id
				LEFT JOIN va_member_view as v ON a.artist_uid=v.artist_uid
				LEFT JOIN (
					SELECT * FROM like_music WHERE user_id=?
					) lm ON m.music_uid=lm.music_uid
				WHERE m.music_uid IN(
					SELECT pm.music_uid FROM playlist_music pm WHERE playlist_uid=?
				)
				`;

				var val = [user_id, playlist_uid];
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

	this.GetPlaylistHashList = async function(playlist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `SELECT hash FROM playlist_hash WHERE playlist_uid = ?`;
				var val = [playlist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetPlaylistHashList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetPlaylistHashList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdatePlaylistHashList = async function(playlist_uid, hash_list){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				await self.UpdatePlaylistHashList_DeleteAllHash(conn, playlist_uid);
				for(var i=0 ; i<hash_list.length ; i++){
					var hash = hash_list[i].hash;
					await self.UpdatePlaylistHashList_InsertHash(conn, playlist_uid, hash);
				}
				resolve();
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdatePlaylistHashList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdatePlaylistHashList_DeleteAllHash = async function(conn, playlist_uid){
		return new Promise(async function(resolve, reject){
			try{
				var sql = `DELETE FROM playlist_hash WHERE playlist_uid=?`;
				var val = [playlist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL UpdatePlaylistHashList_DeleteAllHash #1');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL UpdatePlaylistHashList_DeleteAllHash #2');
			}
		});
	};

	this.UpdatePlaylistHashList_InsertHash = async function(conn, playlist_uid, hash){
		return new Promise(async function(resolve, reject){
			try{
				var sql = `INSERT INTO playlist_hash(playlist_uid, hash) VALUES(?, ?)`;
				var val = [playlist_uid, hash];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL UpdatePlaylistHashList_InsertHash #1');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL UpdatePlaylistHashList_InsertHash #2');
			}
		});
	};

	this.DeletePlaylist = async function(playlist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();

				await self.UpdatePlaylistHashList_DeleteAllHash(conn, playlist_uid);

				var sql = `
				DELETE FROM playlist WHERE playlist_uid=?
				`;
				var val = [playlist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeletePlaylist #0');
					}else{
						await self.DeletePlaylistMusics(conn, playlist_uid);
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

	this.DeleteAllMusicFromPlaylist = async function(playlist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				DELETE FROM playlist_music WHERE playlist_uid=?
				`;
				var val = [playlist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteAllMusicFromPlaylist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteAllMusicFromPlaylist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteOneMusicFromPlaylist = async function(playlist_uid, music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				DELETE FROM playlist_music WHERE playlist_uid=? and music_uid=?
				`;
				var val = [playlist_uid, music_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteOneMusicFromPlaylist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteOneMusicFromPlaylist #1');
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

	this.SearchPlaylistByHash = async function(hash_list, country_code){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
					SELECT * 
					FROM playlist p  
					WHERE 
						p.is_open='Y' AND 
						p.country_code=? AND 
							p.playlist_uid IN (
							SELECT DISTINCT(ph.playlist_uid) 
									FROM playlist_hash ph
							WHERE ph.hash IN (?)
						)
					ORDER BY p.like_count DESC
				`;
				var val = [country_code, hash_list];
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

	this.DeleteLikeArtist = async function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `DELETE FROM like_artist WHERE artist_uid=?`;
				var val = [artist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteLikeArtist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteLikeArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteVariousArtistMemberAll = async function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `DELETE FROM artist_various WHERE member_artist_uid=?`;
				var val = [artist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteVariousArtistMember #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteVariousArtistMember #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteVariousArtistMemberOne = async function(artist_uid, member_artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `DELETE FROM artist_various WHERE artist_uid=? and member_artist_uid=?`;
				var val = [artist_uid, member_artist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteVariousArtistMember #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteVariousArtistMember #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteVariousArtist = async function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `DELETE FROM artist_various WHERE artist_uid=?`;
				var val = [artist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteVariousArtist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteVariousArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteArtistOfOrgArtistUID = async function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `DELETE FROM artist WHERE org_artist_uid=?`;
				var val = [artist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteArtistOfOrgArtistUID #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteArtistOfOrgArtistUID #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteArtist = async function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `DELETE FROM artist WHERE artist_uid=?`;
				var val = [artist_uid];
				conn.query(sql, val, async function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService DeleteArtist #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService DeleteArtist #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicDiffNameList = function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `SELECT * FROM music WHERE org_music_uid=?`;
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService GetMusicDiffNameList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService GetMusicDiffNameList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddMusicDiffName = function(org_music_uid, diff_name,  artist_uid, user_id, video_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				var music_uid = await self.GetMusicUID();

				conn = await db_conn.GetConnection();
				var sql = `
				INSERT INTO music (music_uid, title, is_diff_name, org_music_uid, artist_uid, user_id, video_id)
				VALUES            (?,         ?,     'Y',          ?,             ?,          ?,       ?)
				`;
				var val = [music_uid, diff_name, org_music_uid, artist_uid, user_id, video_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService GetMusicDiffNameList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService GetMusicDiffNameList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.DeleteMusicDiffName = function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				DELETE FROM music WHERE music_uid=?
				`;
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService DeleteMusicDiffName #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService DeleteMusicDiffName #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetVAMemberList = function(artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT a.name, av.member_artist_uid as artist_uid
				FROM artist_various av 
				JOIN artist a ON av.member_artist_uid=a.artist_uid
				where av.artist_uid=?
				`;
				var val = [artist_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService GetVAMemberList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService GetVAMemberList #1');
			}finally{
				if(conn) conn.release();
			}
		});		
	};

	this.UpdateMusicLike = async function(music_uid, user_id, is_like){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = '';
				if(is_like){
					sql = `INSERT INTO like_music (user_id, music_uid) VALUES (?, ?)`;
				}else{
					sql = `DELETE FROM like_music WHERE user_id=? and music_uid=?`;
				}
				var val = [user_id, music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdateMusicLike #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdateMusicLike #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateMusicLikeCount = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				UPDATE music SET like_count = (
					SELECT count(*) FROM like_music WHERE music_uid=?
				)
				WHERE music_uid=?
				`;
				var val = [music_uid, music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdateMusicLikeCount #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdateMusicLikeCount #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMyLikeMusicList = function(user_id, music_uid_list){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				console.log('user_id ' + user_id);

				conn = await db_conn.GetConnection();
				var sql = `SELECT music_uid FROM like_music WHERE user_id=? AND music_uid IN (?)`;
				var val = [user_id, music_uid_list];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService GetMyLikeMusicList #0');
					}else{
						console.log('result ' + result.length);
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService GetMyLikeMusicList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetLyrics = async function(music_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `SELECT text FROM lyrics WHERE music_uid=?`;
				var val = [music_uid];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetLyrics #0');
					}else{
						if(result.length > 0){
							resolve({
								registered:true,
								text:result[0].text
							});
						}else{
							resolve({
								registered:false
							});
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetLyrics #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateLyrics = async function(has_lyrics, music_uid, text){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = '';
				var val = [];
				if(has_lyrics == 'Y'){
					sql = `UPDATE lyrics set text=? WHERE music_uid=?`;
					val = [text, music_uid];
				}else{
					sql = `INSERT INTO lyrics (music_uid, text) VALUES (?, ?)`;
					val = [music_uid, text];
				}
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService UpdateLyrics #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService UpdateLyrics #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicDetailInfo = function(music_uid, user_id){
		return new Promise(async function(resolve, reject){
			try{
				var sql = `
				SELECT m.title, m.video_id, m.artist_uid, a.name as artist, m.like_count, 
					l.text as lyrics,
					IF(llm.music_uid IS NULL, 'N', 'Y') as is_like
				FROM music m
				JOIN artist a ON m.artist_uid=a.artist_uid
				LEFT JOIN lyrics l ON m.music_uid=l.music_uid
				LEFT JOIN (SELECT lm.music_uid FROM like_music lm WHERE lm.user_id=?) llm ON m.music_uid=llm.music_uid
				WHERE m.music_uid=?
				`;
				var val = [user_id, music_uid];
				var msg = 'GetMusicDetailInfo';
				var ret = self.QuerySelect(sql, val, msg);
				resolve(ret);
			}catch(err){
				reject('FAIL ' + msg)
			}
		});
	};

	this.QuerySelect = function(sql, val, msg){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject(`FAIL CMSService ${msg} #0`);
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject(`FAIL CMSService ${msg} #1`);
			}finally{
				if(conn) conn.release();
			}
		});
	};

}

module.exports = new CherryService();