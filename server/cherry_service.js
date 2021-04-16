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
				sql += 'SELECT m.music_id, a.name AS artist, m.title, m.video_id, m.music_id ';
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