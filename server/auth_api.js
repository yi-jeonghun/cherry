const express = require('express');
const pool = require('./db_pool').GetPool();
var url = require('url');
const client_id = '593936549032-rn82ptkqtjj5n3jfcf8g964k8metdnv2.apps.googleusercontent.com';
const {OAuth2Client} = require('google-auth-library');
const oauth_client = new OAuth2Client(client_id);
const auth_service = require('./auth_service');

const router = express.Router();

router.post('/login', function(req, res){
	var data = req.body;
	console.log('req.body ' + req.body);

	oauth_client.verifyIdToken({idToken:data.token, audience:client_id})
		.then(async function(ticket){
			const payload = ticket.getPayload();
			const user_id = payload['sub'];
			const email = payload['email'];
			const name = payload['name'];
			const image_url = payload['picture'];
			const locale = payload['locale'];
			var user_info = {
				user_id: user_id,
				name: name,
				image_url: image_url,
				locale: locale,
				email: email
			};

			req.session.user_info = user_info;

			try{
				var ret = await auth_service.GetUserInfo(user_id);
				if(ret.ok == 1){
					if(user_info.name != ret.user_info.name){
						await auth_service.UpdateUserInfo(user_info);
					}
				}else if(ret.ok == 0){
					await auth_service.CreateUserInfo(user_info);
				}
				res.send({
					ok:1,
					user_info: user_info
				});
			}catch(err){
				console.error(err);
			 	res.send({ok:0});
			}
		});
});

router.get('/get_user_info_session', function(req, res){
	if(req.session.user_info){
		res.send({
			ok:1,
			user_info:req.session.user_info
		});
	}else{
		res.send({ok:0});
	}
});

router.get('/logout', function(req, res){
	req.session.destroy();
	res.send({ok:1});
});

module.exports = router;