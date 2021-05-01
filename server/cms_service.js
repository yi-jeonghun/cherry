const db_conn = require('./db_conn');
// const { triggerAsyncId } = require('async_hooks');

function CMS_Service(){
	var self = this;

	this.ClearTopRankDraftData = async function(country_type){
		return new Promise(async function(resolve, reject){
			var conn = null;

			var sql = '';

			try{
				conn = await db_conn.GetConnection();
				sql += 'DELETE FROM top_rank_list_draft WHERE country_code=?';
				var val = [country_type];
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

	this.ClearTopRankReleaseData = async function(country_type){
		return new Promise(async function(resolve, reject){
			var conn = null;

			var sql = '';

			try{
				conn = await db_conn.GetConnection();
				sql += 'DELETE FROM top_rank_list WHERE country_code=?';
				var val = [country_type];
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

	this.GetTopRankDraftData = async function(country_code){
		return new Promise(async function(resolve, reject){
			var conn = null;

			var sql = `
				SELECT t.rank_num, t.music_id, t.artist, a.artist_id, a.is_various, t.title, t.video_id
				FROM top_rank_list_draft t
				LEFT JOIN music m ON t.music_id=m.music_id
				LEFT JOIN artist a ON a.artist_id=m.artist_id
				WHERE country_code=?
			`;
			var val = [country_code];

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

	this.GetTopRankReleaseData = async function(country_code){
		return new Promise(async function(resolve, reject){
			var conn = null;

			console.log('country_code ' + country_code);

			var sql = `
				SELECT t.rank_num, m.music_id, m.title, a.name artist, a.artist_id, a.is_various, m.video_id
				FROM top_rank_list t
				JOIN music m ON t.music_id=m.music_id
				JOIN artist a ON a.artist_id=m.artist_id
				WHERE t.country_code = ?
			`;
			var val = [country_code];

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

			var sql = `SELECT country_code, release_time FROM top_rank_info`;
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
	
	this.SaveTopRankDraft = async function(country_code, music_list){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_list.length ; i++){
					var m = music_list[i];
					await self.UpdateTopRankDraft_OneRecord(conn, country_code, m);
				}
				resolve();
			}catch(err){
				console.error(err);
				reject('FAIL CherryService ClearKpopTop100 #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateTopRankDraft_OneRecord = async function(conn, country_code, music){
		return new Promise(async function(resolve, reject){

			// console.log('rank_num ' + music.rank_num + ' music_id ' + music.music_id);
			var sql = `
			INSERT INTO top_rank_list_draft(country_code, rank_num, music_id, artist, title, video_id) 
			VALUES(?, ?, ?, ?, ?, ?) 
			ON DUPLICATE KEY UPDATE country_code=?, rank_num=?
			`;
			var val = [country_code, music.rank_num, music.music_id, music.artist, music.title, music.video_id, 
				country_code, music.rank_num];
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

		
	this.SaveTopRankRelease = async function(country_code, music_list){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_list.length ; i++){
					var m = music_list[i];
					if(m.music_id != null){
						await self.UpdateTopRankRelease_OneRecord(conn, country_code, m);
					}
				}
				await self.UpdateTopRankReleaseTime(conn, country_code);
				resolve();
			}catch(err){
				console.error(err);
				reject('FAIL CherryService ClearKpopTop100 #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateTopRankRelease_OneRecord = async function(conn, country_code, music){
		return new Promise(async function(resolve, reject){
			var sql = `
			INSERT INTO top_rank_list(country_code, rank_num, music_id) 
			VALUES(?, ?, ?) 
			ON DUPLICATE KEY UPDATE country_code=?, rank_num=?
			`;
			var val = [country_code, music.rank_num, music.music_id,  
				country_code, music.rank_num];
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

	this.UpdateTopRankReleaseTime = async function(conn, country_code){
		return new Promise(async function(resolve, reject){
			var sql = `
			UPDATE top_rank_info SET release_time=CURRENT_TIMESTAMP()
			WHERE country_code=?
			`;
			var val = [country_code];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService UpdateTopRankReleaseTime #0');
				}else{
					if(result.affectedRows == 0){
						sql = `
						INSERT INTO top_rank_info (country_code, release_time)
						VALUES(?, CURRENT_TIMESTAMP())
						`;
						val = [country_code];
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

	this.AutoSearchMusicList = async function(music_list){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<music_list.length ; i++){
					var m = music_list[i];
					var result = await self.GetMusicByArtistAndTitle(conn, m.artist, m.title);
					if(result.ok){
						music_list[i].music_id = result.music.music_id;
						music_list[i].video_id = result.music.video_id;
					}
				}
				resolve(music_list);
			}catch(err){
				console.error(err);
				reject('FAIL CherryService ClearKpopTop100 #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetMusicByArtistAndTitle = async function(conn, artist, title){
		return new Promise(async function(resolve, reject){
			var sql = `
				SELECT m.music_id, m.video_id
				FROM music m
				WHERE m.title=?
				AND m.artist_id=(
					SELECT artist_id 
					FROM artist
					WHERE NAME=?
					LIMIT 1
			)`;
			var val = [title, artist];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService UpdateTopRank_OneRecord #0');
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
}

module.exports = new CMS_Service();