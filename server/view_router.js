var express = require('express');
var router = express.Router();
var url = require('url');
var fs = require('fs');
// const kpop_service = require('./kpop_service');
// const permission_service = require('./permission_service');
// const sitemap_service = require('./sitemap_service');

var _dev_mode = fs.existsSync('dev_mode');

//###################################################################################

router.get('/', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/top_rank.go', async function(req, res){
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

//####################################################################################//
//CMS pages

router.get('/__cms/', async function(req, res){
	res.render('__cms/cms', null);
});

router.get('/__cms/artist.vu', async function(req, res){
	res.render('__cms/artist', null);
});

router.get('/__cms/album.vu', async function(req, res){
	res.render('__cms/album', null);
});

router.get('/__cms/top_rank.vu', async function(req, res){
	res.render('__cms/top_rank', null);
});

router.get('/__cms/music.vu', async function(req, res){
	res.render('__cms/music', null);
});




module.exports = router;