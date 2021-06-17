var fs = require('fs');
var CONST = require('../public/js/const/country_code');
var top_100_source = require('../public/js/const/top_100_source');
var cherry_service = require('./cherry_service');
const cms_service = require('./cms_service');

var _xml_path_list = [];

async function UpdateXML(){
	return new Promise(async function(resolve, reject){
		await MakeTopRankXML();
		await MakeArtistXML();
		await MakePlaylistXML();
		await MakeMusicXML();
		await MakeSitemapIndex();
		resolve();
	});
}

async function MakeSitemapIndex(){
	return new Promise(async function(resolve, reject){
		var path = __dirname + '/../public/sitemap.xml';
		var xml = `
			<?xml version="1.0" encoding="UTF-8"?>
			<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
		`;

		for(var i=0 ; i<_xml_path_list.length ; i++){
			xml += `
			  <sitemap>
			    <loc>https://cherrymusic.io/${_xml_path_list[i]}</loc>
			  </sitemap>
			`;
		}

		xml += '</sitemapindex>';
		await WriteXML(path, xml);
		resolve();
	});
}

async function MakeTopRankXML(){
	return new Promise(async function(resolve, reject){
		console.log('MakeTopRankXML');
		var date_str = new Date().toISOString();
		var xml = `
		<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			<url>
				<loc>https://cherrymusic.io/</loc>
				<lastmod> ${date_str} </lastmod>
				<priority>0.5</priority>
			</url>
		`;

		for(var i=0 ; i<CONST.__COUNTRY_CODE_LIST.length ; i++){
			var country_code = CONST.__COUNTRY_CODE_LIST[i];
			var source_list = top_100_source.list[country_code];

			for(var s=0 ; s<source_list.length ; s++){
				var source = source_list[s].source;
				xml += `
					<url>
						<loc>https://cherrymusic.io/${country_code}/top_rank.go?s=${source}</loc>
						<lastmod>${date_str}</lastmod>
						<priority>0.8</priority>
					</url>
				`;
			}
		}

		xml += '</urlset>';
		var path = __dirname + '/../public/sitemap_top_rank.xml';
		await WriteXML(path, xml);
		_xml_path_list.push('sitemap_top_rank.xml');
		resolve();
	});
}

async function MakeArtistXML(){
	return new Promise(async function(resolve, reject){
		console.log('MakeArtistXML');
		var xml_list = [];
		var artist_list = await cherry_service.GetArtistList();

		for(var i=0 ; i<CONST.__COUNTRY_CODE_LIST.length ; i++){
			var country_code = CONST.__COUNTRY_CODE_LIST[i];
			xml_list.push(await MakeArtistXMLByCountry(country_code, artist_list));
		}
		resolve(xml_list);
	});
}

async function MakeArtistXMLByCountry(country_code, artist_list){
	return new Promise(async function(resolve, reject){
		var date_str = new Date().toISOString();
		var xml = `
		<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
		`;

		for(var a=0 ; a<artist_list.length ; a++){
			var artist = artist_list[a];
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

		xml += '</urlset>';
		var path = __dirname + '/../public/sitemap_artist_' + country_code + '.xml';
		await WriteXML(path, xml);
		_xml_path_list.push('sitemap_artist_' + country_code + '.xml');
		resolve();
	});
}

async function MakePlaylistXML(){
	return new Promise(async function(resolve, reject){
		console.log('MakePlaylistXML');

		for(var i=0 ; i<CONST.__COUNTRY_CODE_LIST.length ; i++){
			var country_code = CONST.__COUNTRY_CODE_LIST[i];
			var mine_only = false;
			var open_only = true;
			var user_id = '';

			var playlist_list = await cherry_service.GetPlaylistList(country_code, mine_only, open_only, user_id);
			await MakePlaylistXMLByCountry(country_code, playlist_list);
		}
		resolve();
	});
}

async function MakePlaylistXMLByCountry(country_code, playlist_list){
	return new Promise(async function(resolve, reject){
		var date_str = new Date().toISOString();
		var xml = `
		<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
		`;

		for(var k=0 ; k<playlist_list.length ; k++){
			var p = playlist_list[k];
			var encode_title = encodeURI(p.title);

			xml += `
			<url>
				<loc>https://cherrymusic.io/${country_code}/my_playlist_detail.go?pn=${encode_title}&pid=${p.playlist_uid}</loc>
				<lastmod>${date_str}</lastmod>
				<priority>0.8</priority>
			</url>
			`;
		}

		xml += '</urlset>';
		var path = __dirname + '/../public/sitemap_playlist_' + country_code + '.xml';
		await WriteXML(path, xml);
		_xml_path_list.push('sitemap_playlist_' + country_code + '.xml');
		resolve();
	});
}

async function MakeMusicXML(){
	return new Promise(async function(resolve, reject){
		console.log('MakeMusicXML');
		var page = 1;
		var cpp = 100;//count per page
		var pages_per_file = 10;
		var temp_page_count = 0;
		var file_count = 1;

		while(true){
			console.log('page ' + page);
			var music_list = await cms_service.GetMusicListForSitemap(page, cpp);
			console.log('music list len ' + music_list.length);

			var is_first = false;
			var is_last = false;
			if(temp_page_count == 0){
				is_first = true;
			}
			
			console.log('temp_page_count ' + temp_page_count + ' pages_per_file ' + pages_per_file);
			if(temp_page_count == (pages_per_file-1)){
				is_last = true;
			}

			if(music_list.length == 0){
				is_last = true;
			}

			await MakeMusicXMLByCountry(music_list, file_count, is_first, is_last);

			if(music_list.length == 0){
				console.log('break ' );
				break;
			}

			temp_page_count++;
			page++;

			if(temp_page_count == pages_per_file){
				temp_page_count = 0;
				file_count++;
			}
		}

		console.log('resolve music ');
		resolve();
	});
}

async function MakeMusicXMLByCountry(music_list, file_count, is_first, is_last){
	return new Promise(async function(resolve, reject){
		var date_str = new Date().toISOString();

		console.log('is_first ' + is_first + ' is_last ' + is_last);

		for(var i=0 ; i<CONST.__COUNTRY_CODE_LIST.length ; i++){
			var country_code = CONST.__COUNTRY_CODE_LIST[i];
			
			var xml = '';
			if(is_first){
				xml += `
				<?xml version="1.0" encoding="UTF-8"?>
				<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
				`;
			}

			for(var m=0 ; m<music_list.length ; m++){
				var music_uid = music_list[m].music_uid;
				var title = encodeURI(music_list[m].title);
				var artist = encodeURI(music_list[m].artist);
				xml += `
				<url>
					<loc>https://cherrymusic.io/${country_code}/music.go?mid=${music_uid}&t=${title}&a=${artist}</loc>
					<lastmod>${date_str}</lastmod>
					<priority>0.8</priority>
				</url>
				`;	
			}

			if(is_last){
				xml += '</urlset>';
			}

			var path = __dirname + '/../public/sitemap_music_' + country_code + '_' + file_count +'.xml';
			console.log('path ' + path);
			if(is_first){
				_xml_path_list.push('sitemap_music_' + country_code + '_' + file_count +'.xml');
				await WriteXML(path, xml);
			}else{
				await AppendXML(path, xml);
			}
		}

		resolve();
	});
}

async function WriteXML(path, xml){
	return new Promise(function(resolve, reject){
		fs.writeFile(path, xml, function (err) {
			if (err){
				console.error(err);
				reject('FAIL WriteXML');
			}else{
				resolve();
			}
		});
	});
}

async function AppendXML(path, xml){
	return new Promise(function(resolve, reject){
		fs.appendFile(path, xml, function(err){
			if(err){
				console.error(err);
				reject('FAIL AddpenXML');
			}else{
				resolve();
			}
		});
	});
}

async function Main(){
	console.log('Sitemap Update');

	await UpdateXML();

	console.log('Sitemap Update Finished');
	process.exit();
}

Main();
 