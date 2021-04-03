const db_conn = require('./db_conn');
// const { triggerAsyncId } = require('async_hooks');

function CherryService(){
	var self = this;

	this.AddArtist = async function(artist_name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INTO artist( name )' +
					' VALUES (?)';
				var val = [artist_name];
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

	this.AddCollection = async function(collection_name){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'INSERT INTO collection( name )' +
					' VALUES (?)';
				var val = [collection_name];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService AddCollection #0');
					}else{
						resolve(result.insertId);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService AddCollection #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.GetCollectionList = async function(){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql_register = 'SELECT * FROM collection';
				var val = [];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetCollectionList #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetCollectionList #1');
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

	this.SearchMusicListByTitle = async function(keyword){
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

	this.GetTop100 = async function(type){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			var type_enum = type;
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT k.ranking, k.music_id, m.title, m.artist_id, a.name as artist, m.video_id ';
				sql += 'FROM top_100 AS k ';
				sql += 'JOIN music m ';
				sql += 'ON m.music_id = k.music_id ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				sql += 'WHERE k.type = ?';

				console.log('type_enum ' + type_enum);
				console.log('sql ' + sql);
				var val = [type_enum];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetTop100 #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetTop100 #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.ClearTop100 = async function(type){
		return new Promise(async function(resolve, reject){
			var conn = null;

			var sql = '';
			var type_enum = type;

			try{
				conn = await db_conn.GetConnection();
				sql += 'DELETE FROM top_100 WHERE type=?';
				var val = [type_enum];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService ClearKpopTop100 #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService ClearKpopTop100 #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.SaveTop100 = async function(type, top_100){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var type_enum = type;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<top_100.length ; i++){
					var k = top_100[i];
					await self.UpdateTop100_OneRecord(conn, type_enum, k.ranking, k.music_id);
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

	this.UpdateTop100_OneRecord = async function(conn, type_enum, ranking, music_id){
		return new Promise(async function(resolve, reject){
			sql = 'INSERT INTO top_100(ranking, music_id, type) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE ranking=?, music_id=?, type=?';
			var val = [ranking, music_id, type_enum, ranking, music_id, type_enum];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService UpdateTop100_OneRecord #0');
				}else{
					resolve();
				}
			});	
		});
	};
}

module.exports = new CherryService();