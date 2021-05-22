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

router.get('/**/my_playlist.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/**/my_playlist_detail.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/**/open_playlist.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/**/open_playlist_detail.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

router.get('/**/like.go', async function(req, res){
	res.render('index', {
		dev_mode: _dev_mode
	});
});

//###################################################################################

router.get('/playlist_embed.go', async function(req, res){
	var pid = req.query.pid;
	res.render('playlist_embed', {
		dev_mode: _dev_mode,
		playlist_uid: pid
	});
});

//###################################################################################
//inline pages
router.get('/top_rank.vu', async function(req, res){
	var data = {
		dev_mode: _dev_mode
	};
	res.render('top_rank', data);
});

router.get('/artist.vu', async function(req, res){
	var artist_name = req.query.a;
	var artist_uid = req.query.aid;

	var data = {
		artist_name: artist_name,
		artist_uid: artist_uid
	};
	res.render('artist', data);
});

router.get('/search.vu', async function(req, res){
	var data = {
		dev_mode: _dev_mode
	};
	res.render('search', data);
});

router.get('/my_playlist.vu', async function(req, res){
	var data = {
		dev_mode: _dev_mode
	};
	res.render('my_playlist', data);
});

router.get('/my_playlist_detail.vu', async function(req, res){
	var playlist_name = req.query.pn;
	var playlist_uid = req.query.pid;
	var data = {
		playlist_name  : playlist_name,
		playlist_uid    : playlist_uid,
		dev_mode       : _dev_mode
	};
	res.render('my_playlist_detail', data);
});

router.get('/open_playlist.vu', async function(req, res){
	var data = {
		dev_mode: _dev_mode
	};
	res.render('open_playlist', data);
});

router.get('/open_playlist_detail.vu', async function(req, res){
	var playlist_name = req.query.pn;
	var playlist_uid = req.query.pid;
	var data = {
		playlist_name  : playlist_name,
		playlist_uid    : playlist_uid,
		dev_mode       : _dev_mode
	};
	res.render('open_playlist_detail', data);
});

router.get('/like.vu', async function(req, res){
	var data = {
		dev_mode       : _dev_mode
	};
	res.render('like', data);
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

router.get('/__cms/user.vu', async function(req, res){
	var is_admin = await permission_service.IsAdmin(req.session.user_info);
	if(is_admin == false){
		res.render('no_permission');
		return;
	}
	res.render('__cms/cms_user', null);
});

module.exports = router;