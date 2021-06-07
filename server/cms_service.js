const db_conn = require('./db_conn');
// const { triggerAsyncId } = require('async_hooks');

function CMS_Service(){
	var self = this;

	this.ClearTopRankDraftData = async function(country_code, source){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'DELETE FROM top_rank_list_draft WHERE country_code=? and source=?';
				var val = [country_code, source];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService ClearTopRankDraftData #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService ClearTopRankDraftData #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.ClearTopRankReleaseData = async function(country_code, source){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM top_rank_list WHERE country_code=? and source=?';
				var val = [country_code, source];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService ClearTopRankReleaseData #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService ClearTopRankReleaseData #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetTopRankDraftData = async function(country_code, source){
		return new Promise(async function(resolve, reject){
			var conn = null;

			var sql = `
				SELECT t.rank_num, t.music_uid, t.artist, t.artist_uid, a.is_various, t.title, t.video_id,
					IF(l.music_uid IS NULL, 'N', 'Y') as has_lyrics
				FROM top_rank_list_draft t
				LEFT JOIN music m ON t.music_uid=m.music_uid
				LEFT JOIN artist a ON a.artist_uid=m.artist_uid
				LEFT JOIN lyrics l ON t.music_uid=l.music_uid
				WHERE country_code=? and source=?
				ORDER BY t.rank_num ASC
			`;
			var val = [country_code, source];

			try{
				conn = await db_conn.GetConnection();
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMS_Service GetTopRankDraftData #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMS_Service GetTopRankDraftData #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetTopRankReleaseData = async function(country_code, source, user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = `
				SELECT t.rank_num, m.music_uid, m.title, a.name artist, a.artist_uid, 
					a.is_various, m.video_id, u.name user_name,
					concat('[',v.member_list_json,']') as member_list_json,
					IF(lm.user_id IS NULL, 'N', 'Y') as is_like,
					IF(l.music_uid IS NULL, 'N', 'Y') as has_lyrics
				FROM top_rank_list t
				JOIN music m ON t.music_uid=m.music_uid
				JOIN artist a ON a.artist_uid=m.artist_uid
				JOIN user as u ON m.user_id=u.user_id
				LEFT JOIN lyrics l ON t.music_uid=l.music_uid
				LEFT JOIN va_member_view as v ON a.artist_uid=v.artist_uid
				LEFT JOIN (
					SELECT * FROM like_music WHERE user_id=?
					) lm ON t.music_uid=lm.music_uid
				WHERE t.country_code = ? and source = ?
				ORDER BY t.rank_num ASC;
			`;
			var val = [user_id, country_code, source];
			try{
				conn = await db_conn.GetConnection();
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMS_Service GetTopRankReleaseData #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMS_Service GetTopRankReleaseData #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetTopRankReleaseTime = async function(){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = `SELECT country_code, release_time, source FROM top_rank_info`;
			var val = [];
			try{
				conn = await db_conn.GetConnection();
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMS_Service GetTopRankReleaseTime #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMS_Service GetTopRankReleaseTime #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};
	
	this.SaveTopRankDraft = async function(country_code, source, music_list){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_list.length ; i++){
					var m = music_list[i];
					await self.UpdateTopRankDraft_OneRecord(conn, country_code, source, m);
				}
				resolve();
			}catch(err){
				console.error(err);
				reject('FAIL CherryService SaveTopRankDraft #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateTopRankDraft_OneRecord = async function(conn, country_code, source, music){
		return new Promise(async function(resolve, reject){

			// console.log('rank_num ' + music.rank_num + ' music_uid ' + music.music_uid);
			var sql = `
			INSERT INTO top_rank_list_draft(country_code, rank_num, music_uid, artist, title, video_id, source, artist_uid) 
			VALUES(?, ?, ?, ?, ?, ?, ?, ?)
			`;
			var val = [country_code, music.rank_num, music.music_uid, music.artist, music.title, music.video_id, source, music.artist_uid];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService UpdateTopRankDraft_OneRecord #0');
				}else{
					resolve();
				}
			});	
		});
	};
		
	this.SaveTopRankRelease = async function(country_code, source, music_list){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_list.length ; i++){
					var m = music_list[i];
					if(m.music_uid != null){
						await self.UpdateTopRankRelease_OneRecord(conn, country_code, source, m);
					}
				}
				await self.UpdateTopRankReleaseTime(conn, country_code, source);
				resolve();
			}catch(err){
				console.error(err);
				reject('FAIL CherryService ClearKpopTop100 #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateTopRankRelease_OneRecord = async function(conn, country_code, source, music){
		return new Promise(async function(resolve, reject){
			var sql = `
			INSERT INTO top_rank_list(country_code, rank_num, music_uid, source) 
			VALUES(?, ?, ?, ?) 
			`;
			var val = [country_code, music.rank_num, music.music_uid, source];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService UpdateTopRankRelease_OneRecord #0');
				}else{
					resolve();
				}
			});	
		});
	};

	this.UpdateTopRankReleaseTime = async function(conn, country_code, source){
		return new Promise(async function(resolve, reject){
			var sql = `
			UPDATE top_rank_info SET release_time=CURRENT_TIMESTAMP()
			WHERE country_code=? and source=?
			`;
			var val = [country_code, source];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService UpdateTopRankReleaseTime #0');
				}else{
					if(result.affectedRows == 0){
						sql = `
						INSERT INTO top_rank_info (country_code, release_time, source)
						VALUES(?, CURRENT_TIMESTAMP(), ?)
						`;
						val = [country_code, source];
						conn.query(sql, val, function(err1, result1){
							if(err1){
								console.error(err);
								reject('FAIL CherryService UpdateTopRankReleaseTime #1');			
							}else{
								resolve();
							}
						});
					}else{
						resolve();
					}
				}
			});	
		});
	};

	this.AutoSearchArtistList = function(music_list){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_list.length ; i++){
					var m = music_list[i];
					var result = await self._GetArtistUID(conn, m.artist);
					if(result.ok){
						music_list[i].artist_uid = result.artist_uid;
					}
				}
				resolve(music_list);
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AutoSearchArtistList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this._GetArtistUID = async function(conn, artist_name){
		return new Promise(async function(resolve, reject){
			var sql = `
				SELECT IF(is_diff_name = 'Y', org_artist_uid, artist_uid) as artist_uid
				FROM artist
				WHERE NAME=?
				LIMIT 1
			`;
			var val = [artist_name];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService _GetArtistUID #0');
				}else{
					if(result.length > 0){
						resolve({
							ok:1,
							artist_uid:result[0].artist_uid
						});
					}else{
						resolve({ok:0});
					}
				}
			});	
		});
	};

	this.AutoSearchMusicList = async function(music_list){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_list.length ; i++){
					var m = music_list[i];
					if(m.artist_uid != null){
						var result = await self._GetMusicByArtistAndTitle(conn, m.artist_uid, m.title);
						if(result.ok){
							music_list[i].music_uid = result.music.music_uid;
							music_list[i].video_id = result.music.video_id;
						}
					}
				}
				resolve(music_list);
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AutoSearchMusicList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this._GetMusicByArtistAndTitle = async function(conn, artist_uid, title){
		return new Promise(async function(resolve, reject){
			var sql = `
				SELECT m.music_uid, m.video_id
				FROM music m
				WHERE m.title=?
				AND m.artist_uid=?
			`;
			var val = [title, artist_uid];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService _GetMusicByArtistAndTitle #0');
				}else{
					if(result.length > 0){
						resolve({
							ok:1,
							music:result[0]
						});
					}else{
						resolve({ok:0});
					}
				}
			});	
		});
	};

	this.GetDJList = async function(){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `SELECT * FROM user WHERE is_dj='Y'`;
				var val = [];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetDJList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetDJList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.CheckUserNameDuplicated_ForDJUser = async function(name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `SELECT count(*) cnt FROM user WHERE is_dj='Y' AND name=?`;
				var val = [name];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService CheckUserNameDuplicated_ForDJUser #0');
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
				reject('FAIL CherryService CheckUserNameDuplicated_ForDJUser #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.CheckUserIDDuplicated_ForDJUser = async function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `SELECT count(*) cnt FROM user WHERE is_dj='Y' AND user_id=?`;
				var val = [user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService CheckUserNameDuplicated_ForDJUser #0');
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
				reject('FAIL CherryService CheckUserNameDuplicated_ForDJUser #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.AddDJUser = async function(user_id, name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `INSERT INTO user (user_id, name, is_admin, is_dj) VALUES (?, ?, 'N', 'Y')`;
				var val = [user_id, name];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddDJUser #0');
					}else{
						resolve(true);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddDJUser #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.EditDJUser = async function(user_id, name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `UPDATE user SET ? WHERE user_id=?`;
				var val = [{name:name},user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService EditDJUser #0');
					}else{
						resolve(true);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService EditDJUser #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetUserList = async function(type){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `
				SELECT * FROM user
				`;
				var val = [];

				console.log('type' + type);
				if(type == 'user'){
					sql += `WHERE is_admin != 'Y' and is_dj != 'Y' `;
				}else if(type == 'dj'){
					sql += `WHERE is_dj='Y'`;
				}else if(type == 'admin'){
					sql += `WHERE is_admin='Y'`;
				}
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetUserList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetUserList #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateMusic = async function(music_uid, title, video_id, artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `UPDATE music SET ? WHERE ?`;
				var val = [
					{
						title:      title,
						video_id:   video_id,
						artist_uid: artist_uid
					},
					{
						music_uid:music_uid
					} 
				];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService UpdateMusic #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService UpdateMusic #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateMusicOfDiffNames = async function(music_uid, video_id, artist_uid){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `UPDATE music SET ? WHERE ?`;
				var val = [
					{
						video_id:   video_id,
						artist_uid: artist_uid
					},
					{
						org_music_uid:music_uid
					} 
				];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService UpdateMusicOfDiffNames #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService UpdateMusicOfDiffNames #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpgradeUserToAdmin = function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `UPDATE user SET ? WHERE ?`;
				var val = [
					{
						is_admin:'Y'
					},
					{
						user_id:user_id
					} 
				];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService UpgradeUserToAdmin #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService UpgradeUserToAdmin #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateArtistIsVarious = function(artist_uid, is_various){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = `UPDATE artist SET ? WHERE ?`;
				var val = [
					{
						is_various: is_various?'Y':'N'
					},
					{
						artist_uid:artist_uid
					} 
				];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CMSService UpdateArtistIsVarious #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CMSService UpdateArtistIsVarious #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicList_NoLyrics = function(page){
		return new Promise(async function(resolve, reject){
			try{
				var sql = `
					SELECT COUNT(*) cnt
					FROM (
						SELECT m.title, a.name, m.music_uid, l.music_uid as lyrics_music_uid
						FROM music m
						JOIN artist a ON m.artist_uid=a.artist_uid
						LEFT JOIN lyrics l ON m.music_uid=l.music_uid
						WHERE l.music_uid IS NULL
					) nm
				`;
				var msg = 'GetMusicList_NoLyrics count';
				var ret = await self.QuerySelect(sql, [], msg);
				var count = ret[0].cnt;
				console.log('count ' + count);
				var count_per_page = 20;
				var offset = (page - 1) * count_per_page;

				sql = `
					SELECT *
					FROM (
						SELECT m.title, a.name as artist, m.music_uid, l.music_uid as lyrics_music_uid, 'N' as has_lyrics
						FROM music m
						JOIN artist a ON m.artist_uid=a.artist_uid
						LEFT JOIN lyrics l ON m.music_uid=l.music_uid
						WHERE l.music_uid IS NULL
					) nm
					LIMIT ${count_per_page} OFFSET ${offset}
				`;
				msg = 'GetMusicList_NoLyrics list';
				var music_list = await self.QuerySelect(sql, [], msg);

				resolve({
					count: count,
					music_list: music_list
				});
			}catch{
				reject('FAIL ' + msg);
			}
		});
	};

	this.GetMusicList_Correction = function(page){
		return new Promise(async function(resolve, reject){
			try{
				var sql = `
					SELECT mc.*, m.title, m.artist_uid, a.name as artist, m.video_id
					FROM music_correct_request mc
					JOIN music m ON mc.music_uid=m.music_uid
					JOIN artist a ON m.artist_uid=a.artist_uid
				`;
				var msg = 'GetMusicList_Correction';
				var list = await self.QuerySelect(sql, [], msg);
				resolve(list);
			}catch{
				reject('FAIL ' + msg);
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

module.exports = new CMS_Service();