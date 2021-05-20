const db_conn = require('./db_conn');

async function Update(artist_uid, member_list_json){
	return new Promise(async function(resolve, rejeect){
		try{
			var conn = await db_conn.GetConnection();
			var sql = 'UPDATE artist SET ? WHERE ?';
			var val = [
				{member_list_json:member_list_json},
				{artist_uid:artist_uid}
			];
			conn.query(sql, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL Updat #0');
				}else{
					resolve();
				}
			});
		}catch(err){
			console.log('err ' + err);
			reject('FAIL Updat #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function GetMemberUID(name){
	return new Promise(async function(resolve, reject){
		var conn = null;
		try{
			conn = await db_conn.GetConnection();
			var sql_register = 'SELECT artist_uid FROM artist WHERE name=?';
			var val = [name];
			conn.query(sql_register, val, function(err, result){
				if(err){
					console.error(err);
					reject('FAIL CherryService GetMemberUID #0');
				}else{
					resolve(result[0].artist_uid);
				}
			});
		}catch(err){
			console.error(err);
			reject('FAIL CherryService GetMemberUID #1');
		}finally{
			if(conn) conn.release();
		}
	});
}

async function GetArtistList(){
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
}

async function Main(){
	var artist_list = await GetArtistList();
	for(var i=0 ; i<artist_list.length ; i++){
		var a = artist_list[i];
		if(a.is_various == 'Y'){
			var member_list = [];
			var tmp_name_list = a.name.split(',');
			for(var t=0 ; t<tmp_name_list.length ; t++){
				var name = tmp_name_list[t].trim();
				var artist_uid = await GetMemberUID(name);
				member_list.push({
					name:name,
					artist_uid:artist_uid
				});
			}
			var member_list_json = JSON.stringify(member_list);
			console.log(a.name + '\n' + member_list_json);
			await Update(a.artist_uid, member_list_json);
		}
	}

	console.log('finish ');
	process.exit();
}

Main();