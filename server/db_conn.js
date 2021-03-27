var pool = require('./db_pool').GetPool();

function DB_Conn(){
	this.GetConnection = async function(){
		return new Promise(function(resolve, reject){
			pool.getConnection(function(err, conn){
				if(err){
					console.error(err);
					reject('FAIL DB_Conn.GetConnection #1');
				}else{
					resolve(conn);
				}
			});
		});
	};
}

module.exports = new DB_Conn();