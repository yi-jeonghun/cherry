var fs = require('fs');
var top_rank_const = require('../public/js/top_rank_const');
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
		var date_str = new Date().toISOString();
		xml += `
			<?xml version="1.0" encoding="UTF-8"?>
			<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
				<url>
					<loc>https://cherrymusic.io/</loc>
					<lastmod> ${date_str} </lastmod>
					<priority>0.5</priority>
				</url>
		`;

		for(var i=0 ; i<top_rank_const._top_rank_country_list.length ; i++){
			var country = top_rank_const._top_rank_country_list[i];
			xml += `
				<url>
					<loc>https://cherrymusic.io${country.path}</loc>
					<lastmod>${date_str}</lastmod>
					<priority>0.8</priority>
				</url>
			`;
		}

		xml += '</urlset>';
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
 