var fs = require('fs');
// var db_conn = require('./db_conn');
// var beat_service = require('./beat_service');

// var conn = null;
var xml = '';

async function UpdateXML(){
	return new Promise(async function(resolve, reject){
		var path = __dirname + '/../public/sitemap.xml';
		console.log('path ' + path);
		await GetSitemapData();

		fs.writeFile(path, xml, function (err) {
			if (err){
				console.error(err);
				reject('FAIL SitemapService Update 1');
			}else{
				console.log('update sitemap');
				resolve();
			}
		});
	});
}

async function GetSitemapData(){
	console.log('GetSitemapData ');
	return new Promise(async function(resolve, reject){
		xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
		xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
		xml += '	<url>\n';
		xml += '		<loc>https://cherrymusic.io/</loc>\n';
		xml += '		<lastmod>' + new Date().toISOString() + '</lastmod>\n';
		xml += '		<priority>0.5</priority>\n';
		xml += '	</url>\n';

		// xml += await GetTop100List();

		xml += '	<url>\n';
		xml += '		<loc>https://cherrymusic.io/#GLO</loc>\n';
		xml += '		<lastmod>' + new Date().toISOString() + '</lastmod>\n';
		xml += '		<priority>0.8</priority>\n';
		xml += '	</url>\n';

		xml += '	<url>\n';
		xml += '		<loc>https://cherrymusic.io/#USA</loc>\n';
		xml += '		<lastmod>' + new Date().toISOString() + '</lastmod>\n';
		xml += '		<priority>0.8</priority>\n';
		xml += '	</url>\n';

		xml += '	<url>\n';
		xml += '		<loc>https://cherrymusic.io/#KOR</loc>\n';
		xml += '		<lastmod>' + new Date().toISOString() + '</lastmod>\n';
		xml += '		<priority>0.8</priority>\n';
		xml += '	</url>\n';

		xml += '</urlset>\n';
		resolve();
	});
};



async function Main(){
	console.log('Sitemap Update');

	// conn = await db_conn.GetConnection();

	await UpdateXML();


	// conn.release();


	console.log('Sitemap Update Finished');
	process.exit();
}

Main();
 