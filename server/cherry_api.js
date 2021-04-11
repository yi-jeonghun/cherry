var express = require('express');
var url = require('url');
var router = express.Router();
var cherry_service = require('./cherry_service');
// var permission_service = require('./permission_service');
// var sitemap_service = require('./sitemap_service');
var cms_service = require('./cms_service');

router.post('/add_artist', async function(req, res){
	try{
		var data = req.body;
		await cherry_service.AddArtist(data.artist_name);

		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to add artist'
		});
	}
});

router.get('/get_artist_list', async function(req, res){
	try{
		var artist_list = await cherry_service.GetArtistList();

		res.send({
			ok: 1,
			artist_list: artist_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_artist_list'
		});
	}
});

router.post('/search_artist', async function(req, res){
	try{
		var data = req.body;
		var ret_data = await cherry_service.SearchArtist(data.artist_name);
		res.send({
			ok: 1,
			data: ret_data
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to add artist'
		});
	}
});

router.post('/add_collection', async function(req, res){
	try{
		var data = req.body;
		await cherry_service.AddCollection(data.collection_name);

		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to add collection'
		});
	}
});

router.get('/get_collection_list', async function(req, res){
	try{
		var collection_list = await cherry_service.GetCollectionList();

		res.send({
			ok: 1,
			collection_list: collection_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_collection_list'
		});
	}
});

router.post('/add_music', async function(req, res){
	try{
		var music = req.body;
		var artist_id = '';

		//search artist
		var artist_found_res = await cherry_service.SearchArtist(music.artist);
		console.log('search result ' + artist_found_res.found);
		if(artist_found_res.found == false){
			artist_id = await cherry_service.AddArtist(music.artist);
			console.log('add result ' + artist_id);
		}else{
			artist_id = artist_found_res.artist_id;
			console.log('found id ' + artist_id);
		}

		var music_info_for_add = {
			artist_id: artist_id,
			title:     music.title,
			video_id:  music.video_id
		};

		var found = await cherry_service.FindSameMusic(music_info_for_add);
		if(found){
			res.send({
				ok: 0,
				err: '이미 등록됨'
			});
		}else{
			var music_id = await cherry_service.AddMusic(music_info_for_add);

			res.send({
				ok: 1,
				music_id: music_id
			});
		}
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to add Music'
		});
	}
});

router.post('/update_music', async function(req, res){
	try{
		var req_data = req.body;
		var music = req_data.music;
		var artist_id = '';

		//search artist
		var artist_found_res = await cherry_service.SearchArtist(music.artist);
		console.log('search result ' + artist_found_res.found);
		if(artist_found_res.found == false){
			artist_id = await cherry_service.AddArtist(music.artist);
			console.log('add result ' + artist_id);
		}else{
			artist_id = artist_found_res.artist_id;
			console.log('found id ' + artist_id);
		}

		var music_info = {
			music_id:  req_data.music_id,
			artist_id: artist_id,
			title:     music.title,
			video_id:  music.video_id
		};

		var found = await cherry_service.FindSameMusic(music_info);
		if(found){
			res.send({
				ok: 0,
				err: '이미 등록됨'
			});
		}else{
			await cherry_service.UpdateMusic(music_info);
			res.send({
				ok: 1
			});
		}
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to add Music'
		});
	}
});

router.post('/delete_music', async function(req, res){
	try{
		var req_data = req.body;
		var music_id = req_data.music_id;

		await cherry_service.DeleteMusic(music_id);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to delete Music'
		});
	}
});

router.get('/get_music_list', async function(req, res){
	try{
		var music_list = await cherry_service.GetMusicList();

		res.send({
			ok: 1,
			music_list: music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_music_list'
		});
	}
});

router.post('/search_music_by_artist', async function(req, res){
	try{
		var music_list = [];
		var keyword = req.body.keyword;
		var ret_data = await cherry_service.SearchArtist(keyword);
		if(ret_data.found){
			music_list = await cherry_service.GetMusicListByArtist(ret_data.artist_id);
		}
		res.send({
			ok: 1,
			music_list: music_list
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to search_music_by_artist'
		});
	}
});

router.post('/search_music_by_title', async function(req, res){
	try{
		var music_list = [];
		var keyword = req.body.keyword;
		music_list = await cherry_service.SearchMusicListByTitle(keyword);

		res.send({
			ok: 1,
			music_list: music_list
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to search_music_by_artist'
		});
	}
});

router.post('/search_music_smart', async function(req, res){
	try{
		var artist_name = req.body.artist_name;
		var title = req.body.title;
		var list1 = [];
		var list2 = [];

		if(artist_name != ''){
			list1 = await cherry_service.GetMusicListByArtistSearch(artist_name);
		}
		if(title != ''){
			list2 = await cherry_service.SearchMusicListByTitle(title);
		}

		res.send({
			ok: 1,
			list1: list1,
			list2: list2
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to search_music_by_artist'
		});
	}
});

router.get('/collection/get_top_100', async function(req, res){
	try{
		var type = req.query.type;
		console.log('type ' + type);
		var music_list = await cherry_service.GetTop100(type);
		res.send({
			ok: 1,
			music_list: music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_music_list'
		});
	}
});

router.post('/collection/save', async function(req, res){
	try{
		var type = req.query.type;
		var top_100 = req.body;
		await cherry_service.ClearTop100(type);
		await cherry_service.SaveTop100(type, top_100);
		res.send({
			ok: 1
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to collection/save'
		});
	}
});

router.post('/get_music_by_id', async function(req, res){
	try{
		var music_id = req.body.music_id;
		var music_list = await cherry_service.GetMusicById(music_id);
		res.send({
			ok: 1,
			music_list: music_list
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_music_by_id'
		});
	}
});

router.post('/top_rank/fetch_release_data', async function(req, res){
	try{
		var data = req.body;
		var music_list = await cms_service.GetTopRankReleaseData(data.country_code);
		res.send({
			ok: 1,
			music_list: music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /top_rank/fetch_release_data'
		});
	}
});

module.exports = router;