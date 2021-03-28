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

	this.GetMusicList = async function(music){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT a.name AS artist, m.title, m.video_id ';
				sql += 'FROM music m ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id';
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
				sql += 'SELECT a.name AS artist, m.title, m.video_id, m.music_id ';
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

	this.GetKpopTop100 = async function(){
		return new Promise(async function(resolve, reject){
			var conn = null;
			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'SELECT k.ranking, k.music_id, m.title, m.artist_id, a.name as artist, m.video_id ';
				sql += 'FROM kpop_top_100 AS k ';
				sql += 'JOIN music m ';
				sql += 'ON m.music_id = k.music_id ';
				sql += 'JOIN artist a ';
				sql += 'ON m.artist_id = a.artist_id ';
				var val = [];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL CherryService GetKpopTop100 #0');
					}else{
						resolve(result);
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL CherryService GetKpopTop100 #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.ClearKpopTop100 = async function(){
		return new Promise(async function(resolve, reject){
			var conn = null;

			var sql = '';
			try{
				conn = await db_conn.GetConnection();
				sql += 'DELETE FROM kpop_top_100 ';
				var val = [];
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

	this.SaveKpopTop100 = async function(kpop_top_100){
		return new Promise(async function(resolve, reject){
			var conn = null;

			try{
				conn = await db_conn.GetConnection();
				for(var i=0 ; i<kpop_top_100.length ; i++){
					var k = kpop_top_100[i];
					await self.UpdateKpopTop100_OneRecord(conn, k.ranking, k.music_id);
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

	this.UpdateKpopTop100_OneRecord = async function(conn, ranking, music_id){
		return new Promise(async function(resolve, reject){
			sql = 'INSERT INTO kpop_top_100(ranking, music_id) VALUES(?, ?) ON DUPLICATE KEY UPDATE ranking=?, music_id=?';
			var val = [ranking, music_id, ranking, music_id];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService UpdateKpopTop100_OneRecord #0');
				}else{
					resolve();
				}
			});	
		});
	};
}

module.exports = new CherryService();