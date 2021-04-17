var express = require('express');
var router = express.Router();
var url = require('url');
// const kpop_service = require('./kpop_service');
// const permission_service = require('./permission_service');
// const sitemap_service = require('./sitemap_service');

//###################################################################################

router.get('/', async function(req, res){
	var params = url.parse(req.url, true).query;
	res.render('index', null);
});

//###################################################################################
//inline pages

router.get('/top_rank.vu', async function(req, res){
	var country_code = req.query.country_code;
	var data = {
		country_code:country_code
	}
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