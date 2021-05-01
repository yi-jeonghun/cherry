var express = require('express');
// var url = require('url');
var router = express.Router();
var cms_service = require('./cms_service');
var top_rank_parser = require('./top_rank_parser/top_rank_parser');

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

module.exports = router;