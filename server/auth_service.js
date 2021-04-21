const db_conn = require('./db_conn');

function AuthService(){
	this.GetUserInfo = async function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();

				var sql = 'SELECT * FROM user WHERE user_id=?';
				var val = [user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL AuthService GetUserInfo #0');
					}else{
						if(result.length > 0){
							resolve({
								ok:1, 
								user_info: result[0]
							});
						}else{
							resolve({
								ok: 0
							});
						}
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL AuthService GetUserInfo #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.UpdateUserInfo = async function(user_info){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();

				var sql_update = 'UPDATE user SET ? WHERE ?';
				var val = [{
					name: user_info.name,
					image_url: user_info.image_url,
					locale: user_info.locale,
					email: user_info.email
				},
					{user_id: user_info.user_id}
				];
	
				conn.query(sql_update, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL AuthService UpdateOrCreateUser #0');
					}else{
						resolv();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL AuthService UpdateOrCreateUser #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};

	this.CreateUserInfo = async function(user_info){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();

				var sql_register = "INSERT INTO user(user_id, name, image_url, locale, email) VALUES (?, ?, ?, ?, ?)";
				var val = [user_info.user_id, user_info.name, user_info.image_url, user_info.locale, user_info.email];
				conn.query(sql_register, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL AuthService CreateUserInfo #0');
					}else{
						resolve();
					}
				});
			}catch(err){
				console.error(err);
				reject('FAIL AuthService CreateUserInfo #1');
			}finally{
				if(conn) conn.release();
			}
		});
	};
}

module.exports = new AuthService();