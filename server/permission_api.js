var express = require('express');
var url = require('url');
var router = express.Router();
var permission_service = require('./permission_service');

router.post('/register_manager', async function(req, res){
	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
		res.send({
			ok:0,
			err:'no permission'
		});
		return;
	}

	try{
		var data = req.body;
		await permission_service.RegisterManager(data.user_id);
		res.send({
			ok:1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'failed to register'
		});
	}
});

router.post('/delete_manager', async function(req, res){
	if(await permission_service.HasAdminPermission(req.session.user_info) == false){
		res.send({
			ok:0,
			err:'no permission'
		});
		return;
	}

	try{
		var data = req.body;
		await permission_service.DeleteManager(data.user_id);
		res.send({
			ok:1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'failed to delete'
		});
	}
});

module.exports = router;