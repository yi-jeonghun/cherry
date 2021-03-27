var mysql = require('mysql');
var pool = null;
module.exports = {
	GetPool: function () {
		if (pool) return pool;

		console.log('create pool');
		pool = mysql.createPool({
			host:'localhost',
			user:'_cherry_',
			password:'CherryMaster',
			database:'cherry',
			connectionLimit : 50
		});
		return pool;
	}
};