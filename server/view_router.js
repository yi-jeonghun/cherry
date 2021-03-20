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

// router.get('/kpop.vu', async function(req, res){
// 	var params = url.parse(req.url, true).query;
// 	var kpop = null;
// 	try{
// 		kpop = await kpop_service.GetKpop(params.ID);
// 		console.log(kpop);
// //		ted_service.IncreaseHit(params.ID);
// 	}catch(err){
// 		console.error(err);
// 		console.error('FAIL kpop.vu #1');
// 	}
// 	res.render('kpop', kpop);
// });

// router.get('/kpop_editor.vu', async function(req, res){
// 	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
// 		res.render('no_permission');
// 		return;
// 	}
// 	res.render('kpop_editor', null);
// });

//####################################################################################//

// router.get('/__cms/', async function(req, res){
// 	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
// 		res.render('__cms/no_permission');
// 		return;
// 	}

// 	var params = url.parse(req.url, true).query;

// 	var type = '';
// 	if(params.t){
// 		type = params.t;
// 	}

// 	var keyword = '';
// 	if(params.k){
// 		keyword = params.k;
// 	}

// 	var page = 1;
// 	if(params.p){
// 		page = params.p;
// 	}

// 	var data = {
// 		total: 0,
// 		count_per_page: 20,
// 		page: page,
// 		list: [],
// 		type: type,
// 		keyword: keyword
// 	};

// 	try {
// 		data.total = await kpop_service.GetTotalForCMS(keyword, type);
// 		data.list = await kpop_service.GetListForCMS(page, data.count_per_page, keyword, type);
// 	} catch (error) {
// 		console.error(error);
// 		console.error('FAIL view_router /cms/');
// 	}
// 	res.render('__cms/cms_list', data);
// });

// router.get('/__cms/cms_user.vu', async function(req, res){
// 	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
// 		res.render('__cms/no_permission');
// 		return;
// 	}
	
// 	var data = {
// 		user_list:[]
// 	}
// 	try {
// 		data.user_list = await permission_service.GetUserList();
// 		console.log('data.user_list ' + data.user_list.length);
// 	} catch (error) {
// 		console.error(error);
// 		console.error('FAIL view_router /__cms/cms_user.vu');
// 	}
// 	res.render('__cms/cms_user', data);
// });

// router.get('/__cms/cms_admin.vu', async function(req, res){
// 	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
// 		res.render('__cms/no_permission');
// 		return;
// 	}
	
// 	var data = {
// 		user_list:[]
// 	}
// 	try {
// 		data.user_list = await permission_service.GetAdminList();
// 	} catch (error) {
// 		console.error(error);
// 		console.error('FAIL view_router /__cms/cms_admin.vu');
// 	}
// 	res.render('__cms/cms_admin', data);
// });

// router.get('/__cms/sitemap.vu', async function(req, res){
// 	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
// 		res.render('__cms/no_permission');
// 		return;
// 	}
	
// 	var data = {
// 		mtime: null
// 	};
// 	try {
// 		data = await sitemap_service.GetSitemapFileInfo();
// 	} catch (error) {
// 		console.error(error);
// 		console.error('FAIL view_router /__cms/sitemap.vu');
// 	}
// 	res.render('__cms/sitemap', data);
// });

// router.get('/__cms/backup.vu', async function(req, res){
// 	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
// 		res.render('__cms/no_permission');
// 		return;
// 	}
	
// 	res.render('__cms/backup', null);
// });

module.exports = router;