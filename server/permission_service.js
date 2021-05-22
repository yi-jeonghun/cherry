const db_conn = require('./db_conn');

function PermissionService() {
	var self = this;

	this.GetUserID = async function(req){
		return new Promise(function(resolve, reject){
			if(req == null){
				console.log('req null');
				resolve(null);
				return;
			}
			if(req.session === undefined || req.session == null){
				console.log('no session');
				resolve(null);
				return;
			}
			if(req.session.user_info === undefined || req.session.user_info == null){
				console.log('no user_info');
				resolve(null);
				return;
			}
			resolve(req.session.user_info.user_id);
		});
	};

	this.IsSuperAdmin = async function(user_info){
		return new Promise(async function (resolve, reject) {
			if(user_info == 'undefined' || user_info == undefined || user_info == null){
				resolve(false);
				return;
			}

			var super_admin_list = [
				'111374135736029697427',//guitar man
			];

			var is_super_admin = super_admin_list.includes(user_info.user_id);
			resolve(is_super_admin);
		});
	};

	this.IsAdmin = async function (user_info) {
		return new Promise(async function (resolve, reject) {
			if(user_info == 'undefined' || user_info == undefined || user_info == null){
				resolve(false);
				return;
			}

			console.log('user_info.user_id ' + user_info.user_id);
			//FIXME DB화 할것.

			var admin_list = [
				'111374135736029697427',//guitar man
				'116546604536174133409'//aryun tv
			];

			var is_admin = admin_list.includes(user_info.user_id);
			resolve(is_admin);

			// if (user_info == null || user_info == undefined) {
			// 	resolve(false);
			// 	return;
			// }

			// var conn = null;
			// try {
			// 	conn = await db_conn.GetConnection();
			// 	var sql = 'SELECT count(*) as cnt FROM admin WHERE user_id=?';
			// 	var val = [user_info.user_id];
			// 	conn.query(sql, val, function (err, result) {
			// 		var has_permission = false;
			// 		if (err) {
			// 			console.error(err);
			// 			reject('FAIL HasAdminPermission #0');
			// 		} else {
			// 			if (result.length > 0) {
			// 				console.log('result[0].cnt ' + result[0].cnt);
			// 				if (result[0].cnt > 0) {
			// 					resolve(true);
			// 				} else {
			// 					resolve(false);
			// 				}
			// 			}
			// 		}
			// 	});
			// } catch (err) {
			// 	console.error(err);
			// 	reject('FAIL PermissionService HasAdminPermission #1');
			// } finally {
			// 	if (conn) conn.release();
			// }
		});
	};

	this.GetUserList = async function () {
		return new Promise(async function (resolve, reject) {
			var conn = null;
			try {
				conn = await db_conn.GetConnection();
				var sql = 'SELECT * from user';
				var val = [];
				conn.query(sql, val, function (err, result) {
					if (err) {
						console.error(err);
						reject('FAIL PermissionService.GetUserList #0');
					} else {
						console.log('result ' + result.length);
						resolve(result);
					}
				});
			} catch (err) {
				console.error(err);
				reject('FAIL PermissionService GetUserList #1');
			} finally {
				if (conn) conn.release();
			}
		});
	};

	this.GetAdminList = async function () {
		return new Promise(async function (resolve, reject) {
			var conn = null;
			try {
				conn = await db_conn.GetConnection();
				var sql = 'SELECT u.user_id, u.name, u.image_url, u.locale, u.email ';
				sql += 'FROM user AS u ';
				sql += 'INNER JOIN admin AS a ON a.user_id=u.user_id';
				var val = [];
				conn.query(sql, val, function (err, result) {
					if (err) {
						console.error(err);
						reject('FAIL PermissionService.GetAdminList #0');
					} else {
						console.log('result ' + result.length);
						resolve(result);
					}
				});
			} catch (err) {
				console.error(err);
				reject('FAIL PermissionService GetAdminList #1');
			} finally {
				if (conn) conn.release();
			}
		});
	};

	this.RegisterManager = async function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'INSERT INTO admin(user_id) VALUES(?) ';
				var val = [user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL PermissionService GetAdminList #0');
					}else{
						resolve();
					}
				});			
			}catch(err){
				console.error(err);
				reject('FAIL PermissionService GetAdminList #1');
			}finally{
				conn.release();
			}
		});
	};

	this.DeleteManager = async function(user_id){
		return new Promise(async function(resolve, reject){
			var conn = null;
			try{
				conn = await db_conn.GetConnection();
				var sql = 'DELETE FROM admin WHERE user_id=?';
				var val = [user_id];
				conn.query(sql, val, function(err, result){
					if(err){
						console.error(err);
						reject('FAIL PermissionService DeleteManager #0');
					}else{
						resolve();
					}
				});			
			}catch(err){
				console.error(err);
				reject('FAIL PermissionService DeleteManager #1');
			}finally{
				conn.release();
			}
		});
	};
}

module.exports = new PermissionService();