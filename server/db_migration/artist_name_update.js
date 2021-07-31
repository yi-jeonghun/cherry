const db_conn = require('../db_conn');

async function GetArtistList(){
	return new Promise(async function(resolve, reject){
		var conn = null;
		try{
			conn = await db_conn.GetConnection();
			var sql = `SELECT * FROM artist`;
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
			console.error(err);
			reject('FAIL GetArtistList #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function UpdateArtist(artist_uid, artist_name){
	return new Promise(async function(resolve, reject){
		var conn = null;
		try{
			conn = await db_conn.GetConnection();
			var sql = `UPDATE artist SET name=? WHERE artist_uid=?`;
			var val = [artist_name, artist_uid];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL UpdateArtist #0');
				}else{
					resolve(result);
				}
			});
		}catch(err){
			console.error(err);
			reject('FAIL UpdateArtist #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function Main(){
	var artist_list = await GetArtistList();
	console.log('artist_list len ' + artist_list.length);

	for(var i=0 ; i<artist_list.length ; i++){
		var a = artist_list[i];
		if(a.name.includes('(')){
			console.log('name ' + a.name);
			var new_name = a.name;

			var new_name = new_name.replace(/ \(/g, "(");
			console.log('new  ' + new_name);

			await UpdateArtist(a.artist_uid, new_name);
		}
	}

	process.exit();
}


Main();