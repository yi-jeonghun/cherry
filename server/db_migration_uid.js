const db_conn = require('./db_conn');
var randomstring = require("randomstring");

async function UpdatePlaylistMusic(playlist_uid, playlist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE playlist_music SET ? WHERE ?';
			var val = [
				{playlist_uid:playlist_uid},
				{playlist_uid:playlist_uid}
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

async function UpdateLikePlaylist(playlist_uid, playlist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE like_playlist SET ? WHERE ?';
			var val = [
				{playlist_uid:playlist_uid},
				{playlist_uid:playlist_uid}
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

async function UpdatePlayst(playlist_uid, playlist_uid){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE playlist SET ? WHERE ?';
			var val = [
				{playlist_uid:playlist_uid},
				{playlist_uid:playlist_uid}
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

async function Main(){
	var playlist_list = await GetPlaylistList();
	console.log('total ' + playlist_list.length);

	for(var i=0 ; i<playlist_list.length ; i++){
		var p = playlist_list[i];
		var playlist_uid = randomstring.generate(10);
		console.log('playlist_uid ' + p.playlist_uid + ' => ' + playlist_uid);
		await UpdatePlayst(p.playlist_uid, playlist_uid);
		await UpdateLikePlaylist(p.playlist_uid, playlist_uid);
		await UpdatePlaylistMusic(p.playlist_uid, playlist_uid);
	}

	console.log('Finished');
	process.exit();
}

Main();