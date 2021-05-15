var express = require('express');
const cherry_service = require('./cherry_service');
var router = express.Router();
var cms_service = require('./cms_service');
var top_rank_parser = require('./top_rank_parser/top_rank_parser');
var permission_service = require('./permission_service');
var randomstring = require("randomstring");

router.post('/fetch_content_from_url', async function(req, res){
	try{
		var req_data = req.body;
		var country_code = req_data.country_code;
		top_rank_parser.Init(country_code);
		var music_list = await top_rank_parser.GetTop100(country_code);
		console.log('music_list len ' + music_list.length);
		res.send({
			ok: 1,
			music_list: music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'fail fetch_content #2'
		});
	}
});

router.post('/find_or_add_artist', async function(req, res){
	try{
		var artist_name = req.body.artist_name;
		var artist_id = null;

		var artist_found_res = await cherry_service.SearchArtist(artist_name);
		console.log('search result ' + artist_found_res.found);
		if(artist_found_res.found == false){
			artist_id = await cherry_service.AddArtist(artist_name, false);
			console.log('add result ' + artist_id);
		}else{
			artist_id = artist_found_res.artist_id;
			console.log('found id ' + artist_id);
		}

		res.send({
			ok: 1,
			artist_id: artist_id
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'fail find_or_add_artist'
		});
	}
});

router.post('/find_or_add_various_artist', async function(req, res){
	try{
		var artist_name_list = req.body.artist_name_list;
		var member_artist_id_list = [];
		var artist_id = null;

		for (let i = 0; i < artist_name_list.length; i++) {
			const artist_name = artist_name_list[i];
			console.log('artist_name ' + artist_name);

			var artist_found_res = await cherry_service.SearchArtist(artist_name);
			if(artist_found_res.found){
				member_artist_id_list[i] = artist_found_res.artist_id;
				console.log('member ' + member_artist_id_list[i]);
			}else{
				member_artist_id_list[i] = await cherry_service.AddArtist(artist_name, false);
				console.log('member ' + member_artist_id_list[i]);
			}
		}

		var search_result = await cherry_service.SearchVariousArtist(member_artist_id_list);
		if(search_result.found == false){
			var sum_artist_name = artist_name_list.join(', ');

			artist_id = await cherry_service.AddArtist(sum_artist_name, true);
			for(var i=0 ; i<member_artist_id_list.length ; i++){
				await cherry_service.AddVariousArtist(artist_id, member_artist_id_list[i]);
			}
		}else{
			artist_id = search_result.artist_id;
		}

		res.send({
			ok: 1,
			artist_id: artist_id
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'fail find_or_add_various_artist'
		});
	}
});

router.post('/top_rank/fetch_draft_data', async function(req, res){
	try{
		var data = req.body;
		var music_list = await cms_service.GetTopRankDraftData(data.country_code);
		res.send({
			ok: 1,
			music_list: music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /top_rank/fetch_draft_data'
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

router.post('/top_rank/save_draft', async function(req, res){
	try{
		var data = req.body;
		await cms_service.ClearTopRankDraftData(data.country_code);
		await cms_service.SaveTopRankDraft(data.country_code, data.music_list);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /top_rank/save_draft'
		});
	}
});

router.post('/top_rank/release_draft', async function(req, res){
	try{
		var data = req.body;
		await cms_service.ClearTopRankReleaseData(data.country_code);
		await cms_service.SaveTopRankRelease(data.country_code, data.music_list);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /top_rank/release_draft'
		});
	}
});

router.post('/top_rank/auto_search_music_list', async function(req, res){
	try{
		var music_list = req.body.music_list;
		var ret_music_list = await cms_service.AutoSearchMusicList(music_list);
		res.send({
			ok: 1,
			ret_music_list: ret_music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /top_rank/auto_search_music_list'
		});
	}
});

router.get('/dj/get_dj_list', async function(req, res){
	try{
		var dj_list = await cms_service.GetDJList();
		res.send({
			ok: 1,
			dj_list: dj_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /dj/get_dj_list'
		});
	}
});

router.post('/dj/add_dj', async function(req, res){
	try{
		var name = req.body.name;
		var name_duplicated = await cms_service.CheckUserNameDuplicated_ForDJUser(name);
		if(name_duplicated){
			res.send({
				ok:0,
				err:'name duplicated'
			});	
			return;
		}

		var user_id = randomstring.generate(30);
		var id_duplicated = await cms_service.CheckUserNameDuplicated_ForDJUser(user_id);
		if(id_duplicated){
			user_id = randomstring.generate(30);
			id_duplicated = await cms_service.CheckUserNameDuplicated_ForDJUser(user_id);
			if(id_duplicated){
				user_id = randomstring.generate(30);
				id_duplicated = await cms_service.CheckUserNameDuplicated_ForDJUser(user_id);
			}
			res.send({
				ok:0,
				err:'failed to generate user_id'
			});	
			return;
		}

		await cms_service.AddDJUser(user_id, name);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /dj/add_dj'
		});
	}
});

router.post('/dj/edit_dj', async function(req, res){
	try{
		var name = req.body.name;
		var user_id = req.body.user_id;
		var name_duplicated = await cms_service.CheckUserNameDuplicated_ForDJUser(name);
		if(name_duplicated){
			res.send({
				ok:0,
				err:'name duplicated'
			});	
			return;
		}

		await cms_service.EditDJUser(user_id, name);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /dj/add_dj'
		});
	}
});


module.exports = router;