var fs = require('fs');
var CONST = require('../public/js/const/country_code');
var cherry_service = require('./cherry_service');

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
	return new Promise(async function(resolve, reject){
		console.log('GetSitemapData ');
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

		await GetTopRank();
		await GetArtistList();
		await GetPlaylist();

		xml += '</urlset>';
		resolve();
	});
}

async function GetTopRank(){
	return new Promise(async function(resolve, reject){
		var date_str = new Date().toISOString();

		console.log('GetTopRank ');

		for(var i=0 ; i<CONST.__COUNTRY_CODE_LIST.length ; i++){
			var country_code = CONST.__COUNTRY_CODE_LIST[i];

			xml += `
				<url>
					<loc>https://cherrymusic.io/${country_code}/top_rank.go</loc>
					<lastmod>${date_str}</lastmod>
					<priority>0.8</priority>
				</url>
			`;
		}
		resolve();
	});
}

async function GetArtistList(){
	return new Promise(async function(resolve, reject){
		var date_str = new Date().toISOString();

		console.log('GetArtistList ');

		var artist_list = await cherry_service.GetArtistList();

		for(var i=0 ; i<CONST.__COUNTRY_CODE_LIST.length ; i++){
			var country_code = CONST.__COUNTRY_CODE_LIST[i];

			for(var a=0 ; a<artist_list.length ; a++){
				var artist = artist_list[a];
				if(artist.is_various == 'Y'){
					{
						var encoded_name = encodeURI(artist.name);
						var artist_uid = artist.artist_uid;
						xml += `
						<url>
							<loc>https://cherrymusic.io/${country_code}/artist.go?a=${encoded_name}&aid=${artist_uid}</loc>
							<lastmod>${date_str}</lastmod>
							<priority>0.8</priority>
						</url>
						`;		
					}

					{
						var member_list = await cherry_service.GetVAMemberList(artist.artist_uid);
						for(var m=0 ; m<member_list.length ; m++){
							var encoded_name = member_list[m].name;
							var artist_uid = member_list[m].artist_uid;
							xml += `
							<url>
								<loc>https://cherrymusic.io/${country_code}/artist.go?a=${encoded_name}&aid=${artist_uid}</loc>
								<lastmod>${date_str}</lastmod>
								<priority>0.8</priority>
							</url>
							`;		
						}
					}
				}else{
					var encoded_name = encodeURI(artist.name);
					var artist_uid = artist.artist_uid;
					if(artist.is_diff_name == 'Y'){
						artist_uid = artist.org_artist_uid;	
					}

					xml += `
					<url>
						<loc>https://cherrymusic.io/${country_code}/artist.go?a=${encoded_name}&aid=${artist_uid}</loc>
						<lastmod>${date_str}</lastmod>
						<priority>0.8</priority>
					</url>
					`;	
				}
			}
		}
		resolve();
	});
}

async function GetPlaylist(){
	return new Promise(async function(resolve, reject){
		var date_str = new Date().toISOString();

		console.log('GetPlaylist ');

		for(var i=0 ; i<CONST.__COUNTRY_CODE_LIST.length ; i++){
			var country_code = CONST.__COUNTRY_CODE_LIST[i];
			var mine_only = false;
			var open_only = true;
			var user_id = '';

			var playlist_list = await cherry_service.GetPlaylistList(country_code, mine_only, open_only, user_id);
			for(var k=0 ; k<playlist_list.length ; k++){
				var p = playlist_list[k];
				var encode_title = encodeURI(p.title);

				xml += `
				<url>
					<loc>https://cherrymusic.io/${country_code}/my_playlist_detail.go?pn=${encode_title}&pid=${p.playlist_uid}</loc>
				</url>
				`;
			}
		}
		resolve();
	});
}

async function Main(){
	console.log('Sitemap Update');

	// conn = await db_conn.GetConnection();

	await UpdateXML();

	// conn.release();

	console.log('Sitemap Update Finished');
	process.exit();
}

Main();
 