var express = require('express');
var url = require('url');
var router = express.Router();
var cherry_service = require('./cherry_service');
// var permission_service = require('./permission_service');
// var sitemap_service = require('./sitemap_service');

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
		await cherry_service.AddMusic(music);

		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to add Music'
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
		console.log('keyword ' + keyword);
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

router.get('/collection/get_kpop_top_100', async function(req, res){
	try{
		var music_list = await cherry_service.GetKpopTop100();
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
		var kpop_top_100 = req.body;
		await cherry_service.ClearKpopTop100();
		await cherry_service.SaveKpopTop100(kpop_top_100);
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

module.exports = router;