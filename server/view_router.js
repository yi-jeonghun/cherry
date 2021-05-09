var express = require('express');
var router = express.Router();
var fs = require('fs');
const permission_service = require('./permission_service');
var cherry_service = require('./cherry_service');

var _dev_mode = fs.existsSync('dev_mode');

//###################################################################################

router.get('/', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/**/top_rank.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/**/artist.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/**/search.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

//###################################################################################
//inline pages

router.get('/top_rank.vu', async function(req, res){
	var country_code = req.query.country_code;
	var data = {
		country_code:country_code,
		dev_mode: _dev_mode
	};
	res.render('top_rank', data);
});

router.get('/artist.vu', async function(req, res){
	var artist_name = req.query.a;

	var ret_data = await cherry_service.SearchArtist(artist_name);

	var data = {
		artist_name: artist_name,
		artist_id: ret_data.artist_id
	};
	res.render('artist', data);
});

router.get('/search.vu', async function(req, res){
	var country_code = req.query.country_code;
	var data = {
		country_code:country_code,
		dev_mode: _dev_mode
	};
	res.render('search', data);
});

//####################################################################################//
//CMS pages

router.get('/__cms/', async function(req, res){
	var is_admin = await permission_service.IsAdmin(req.session.user_info);
	if(is_admin == false){
		res.render('no_permission');
		return;
	}
	res.render('__cms/cms', null);
});

router.get('/__cms/artist.vu', async function(req, res){
	var is_admin = await permission_service.IsAdmin(req.session.user_info);
	if(is_admin == false){
		res.render('no_permission');
		return;
	}
	res.render('__cms/cms_artist', null);
});

router.get('/__cms/album.vu', async function(req, res){
	var is_admin = await permission_service.IsAdmin(req.session.user_info);
	if(is_admin == false){
		res.render('no_permission');
		return;
	}
	res.render('__cms/album', null);
});

router.get('/__cms/top_rank.vu', async function(req, res){
	var is_admin = await permission_service.IsAdmin(req.session.user_info);
	if(is_admin == false){
		res.render('no_permission');
		return;
	}
	res.render('__cms/cms_top_rank', null);
});

router.get('/__cms/music.vu', async function(req, res){
	var is_admin = await permission_service.IsAdmin(req.session.user_info);
	if(is_admin == false){
		res.render('no_permission');
		return;
	}
	res.render('__cms/music', null);
});

router.get('/__cms/playlist.vu', async function(req, res){
	var is_admin = await permission_service.IsAdmin(req.session.user_info);
	if(is_admin == false){
		res.render('no_permission');
		return;
	}
	res.render('__cms/cms_playlist', null);
});



module.exports = router;