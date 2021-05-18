const db_conn = require('./db_conn');
var randomstring = require("randomstring");

async function UpdatePlaylistMusic(playlist_id, playlist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE playlist_music SET ? WHERE ?';
			var val = [
				{playlist_uid:playlist_uid},
				{playlist_id:playlist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdatePlaylistMusic #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdatePlaylistMusic #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function UpdateLikePlaylist(playlist_id, playlist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE like_playlist SET ? WHERE ?';
			var val = [
				{playlist_uid:playlist_uid},
				{playlist_id:playlist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdateLikePlaylist #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdateLikePlaylist #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function UpdatePlayst(playlist_id, playlist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE playlist SET ? WHERE ?';
			var val = [
				{playlist_uid:playlist_uid},
				{playlist_id:playlist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdatePlayst #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdatePlayst #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function GetPlaylistList(){
	return new Promise(async function(resolve, reject){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'SELECT * FROM playlist';
			var val = [];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL GetPlaylistList #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL GetPlaylistList #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function PlaylistMigration(){
	var playlist_list = await GetPlaylistList();
	console.log('total ' + playlist_list.length);

	for(var i=0 ; i<playlist_list.length ; i++){
		var p = playlist_list[i];
		var playlist_uid = randomstring.generate(10);
		console.log('playlist_uid ' + p.playlist_id + ' => ' + playlist_uid);
		await UpdatePlayst(p.playlist_id, playlist_uid);
		await UpdateLikePlaylist(p.playlist_id, playlist_uid);
		await UpdatePlaylistMusic(p.playlist_id, playlist_uid);
	}

	console.log('Finished');
	process.exit();
}

///////////////////////////////////////////////////////////////////////////////

async function UpdateMusic(artist_id, artist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE music SET ? WHERE ?';
			var val = [
				{artist_uid:artist_uid},
				{artist_id:artist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdateArtist #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdateArtist #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function UpdateLikeArtist(artist_id, artist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE like_artist SET ? WHERE ?';
			var val = [
				{artist_uid:artist_uid},
				{artist_id:artist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdateArtist #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdateArtist #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function UpdateVariousMbeberArtist(artist_id, artist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE artist_various SET ? WHERE ?';
			var val = [
				{member_artist_uid:artist_uid},
				{member_artist_id:artist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdateArtist #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdateArtist #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function UpdateVariousArtist(artist_id, artist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE artist_various SET ? WHERE ?';
			var val = [
				{artist_uid:artist_uid},
				{artist_id:artist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdateArtist #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdateArtist #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function UpdateArtist(artist_id, artist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE artist SET ? WHERE ?';
			var val = [
				{artist_uid:artist_uid},
				{artist_id:artist_id}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdateArtist #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL UpdateArtist #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function GetArtistList(){
	return new Promise(async function(resolve, reject){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'SELECT * FROM artist';
			var val = [];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL GetArtistList #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL GetArtistList #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function ArtistMigration(){
	var artist_list = await GetArtistList();
	console.log('artist_list len ' + artist_list.length);

	for (let i = 0; i < artist_list.length; i++) {
		const a = artist_list[i];
		var artist_uid = randomstring.generate(10);
		console.log('artist_id ' + a.artist_id + ' => ' + artist_uid);

		await UpdateArtist(a.artist_id, artist_uid);
		await UpdateVariousArtist(a.artist_id, artist_uid);
		await UpdateVariousMbeberArtist(a.artist_id, artist_uid);
		await UpdateLikeArtist(a.artist_id, artist_uid);
		await UpdateMusic(a.artist_id, artist_uid);
	}

	console.log('Finished');
	process.exit();
}

ArtistMigration();