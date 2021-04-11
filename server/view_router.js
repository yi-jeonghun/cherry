var express = require('express');
var router = express.Router();
var url = require('url');
// const kpop_service = require('./kpop_service');
// const permission_service = require('./permission_service');
// const sitemap_service = require('./sitemap_service');

router.get('/', async function(req, res){
	var params = url.parse(req.url, true).query;
	var data = {
		list: []
	};

	try {
		// data.list = await kpop_service.GetList(1);
	} catch (error) {
		console.error(error);
		console.error('FAIL view_router /cms/');
	}

	res.render('index', data);
});

router.get('/kpop.vu', async function(req, res){
	res.render('kpop', null);
});

router.get('/pop.vu', async function(req, res){
	res.render('pop', null);
});


//####################################################################################//

router.get('/__cms/', async function(req, res){
	res.render('__cms/cms', null);
});

router.get('/__cms/artist.vu', async function(req, res){
	res.render('__cms/artist', null);
});

router.get('/__cms/album.vu', async function(req, res){
	res.render('__cms/album', null);
});

router.get('/__cms/collection.vu', async function(req, res){
	res.render('__cms/collection', null);
});

router.get('/__cms/top_rank.vu', async function(req, res){
	res.render('__cms/top_rank', null);
});

router.get('/__cms/music.vu', async function(req, res){
	res.render('__cms/music', null);
});




module.exports = router;