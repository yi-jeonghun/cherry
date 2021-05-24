var express = require('express');
const cherry_service = require('./cherry_service');
var router = express.Router();
var cms_service = require('./cms_service');
var top_rank_parser = require('./top_rank_parser/top_rank_parser');
var permission_service = require('./permission_service');
var auth_service = require('./auth_service');
var randomstring = require("randomstring");

router.post('/fetch_content_from_url', async function(req, res){
	try{
		var country_code = req.body.country_code;
		var source = req.body.source;
		top_rank_parser.Init(country_code, source);
		var music_list = await top_rank_parser.GetTop100();
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
		var artist_uid = null;

		var artist_found_res = await cherry_service.SearchArtist(artist_name);
		console.log('search result ' + artist_found_res.found);
		if(artist_found_res.found == false){
			artist_uid = await cherry_service.AddArtist(artist_name, false, []);
			console.log('add result ' + artist_uid);
		}else{
			artist_uid = artist_found_res.artist_uid;
			console.log('found id ' + artist_uid);
		}

		res.send({
			ok: 1,
			artist_uid: artist_uid
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
		var member_artist_uid_list = [];
		var member_list = [];
		var artist_uid = null;

		// 개별 artist를 artist table에 입력.
		for (let i = 0; i < artist_name_list.length; i++) {
			const artist_name = artist_name_list[i];
			console.log('artist_name ' + artist_name);

			var artist_found_res = await cherry_service.SearchArtist(artist_name);
			if(artist_found_res.found){
				member_artist_uid_list[i] = artist_found_res.artist_uid;
				member_list.push({
					name:artist_name,
					artist_uid:artist_found_res.artist_uid
				});
				console.log('member ' + member_artist_uid_list[i]);
			}else{
				member_artist_uid_list[i] = await cherry_service.AddArtist(artist_name, false, []);
				member_list.push({
					name:artist_name,
					artist_uid:member_artist_uid_list[i]
				});
				console.log('member ' + member_artist_uid_list[i]);
			}
		}

		//artist_uid를 모아서 동일 멤버로 구성된 VA artist ID를 찾는다
		//만약에 없으면 신규로 추가한다.
		var search_result = await cherry_service.SearchVariousArtist(member_artist_uid_list);
		if(search_result.found == false){
			var sum_artist_name = artist_name_list.join(', ');

			artist_uid = await cherry_service.AddArtist(sum_artist_name, true, member_list);
			for(var i=0 ; i<member_artist_uid_list.length ; i++){
				await cherry_service.AddVariousArtist(artist_uid, member_artist_uid_list[i]);
			}
		}else{
			artist_uid = search_result.artist_uid;
		}

		res.send({
			ok: 1,
			artist_uid: artist_uid
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
		var country_code = req.body.country_code;
		var source = req.body.source;
		var music_list = await cms_service.GetTopRankDraftData(country_code, source);
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
		var country_code = req.body.country_code;
		var source = req.body.source;
		var music_list = await cms_service.GetTopRankReleaseData(country_code, source);
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
		var country_code = req.body.country_code;
		var source = req.body.source;
		var music_list = req.body.music_list;
		await cms_service.ClearTopRankDraftData(country_code, source);
		await cms_service.SaveTopRankDraft(country_code, source, music_list);
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
		var country_code = req.body.country_code;
		var source = req.body.source;
		var music_list = req.body.music_list;
		await cms_service.ClearTopRankReleaseData(country_code, source);
		await cms_service.SaveTopRankRelease(country_code, source, music_list);
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
		var is_admin = await permission_service.IsSuperAdmin(req.session.user_info);
		if(is_admin == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});	
			return;
		}

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
		var is_admin = await permission_service.IsAdmin(req.session.user_info);
		console.log('is_admin' + is_admin);
		if(is_admin == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});	
			return;
		}

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

router.post('/add_music', async function(req, res){
	try{
		var user_id = auth_service.GetLoginUserID(req);
		if(user_id == null){
			res.send({
				ok:0,
				err_code:-2,
				err_msg: 'Sign in required'
			});
			return;
		}

		var dj_user_id = req.body.dj_user_id;
		var music = req.body.music;
		
		var result = await cherry_service.FindSameMusic(music);
		if(result.t_cnt > 0){
			res.send({
				ok:0,
				err_code:-3,
				err_msg:'Same title exists'
			});
		}else if(result.v_cnt > 0){
			res.send({
				ok:0,
				err_code:-4,
				err_msg:'Same video exists'
			});
		}else{
			var music_uid = await cherry_service.AddMusic(music, dj_user_id);
			var music_info = await cherry_service.GetMusicInfo(music_uid);

			res.send({
				ok: 1,
				music_info: music_info
			});
		}
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err_code:-1,
			err_msg:'Failed to add Music'
		});
	}
});

router.post('/get_playlist_list', async function(req, res){
	try{
		var country_code = req.body.country_code;
		var mine_only = true;
		var open_only = false;
		var du_user_id = req.body.dj_user_id;

		if(du_user_id == null){
			res.send({
				ok:0,
				err_code:-1,
				err:'Fail get_playlist_list. No user ID.'
			});
			return;
		}

		var playlist_list = await cherry_service.GetPlaylistList(country_code, mine_only, open_only, du_user_id);
		res.send({
			ok: 1,
			playlist_list: playlist_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail get_playlist_list'
		});
	}
});

router.post('/add_playlist_and_music_list', async function(req, res){
	try{
		var dj_user_id = req.body.dj_user_id;
		var playlist = req.body.playlist;
		var playlist_uid = await cherry_service.AddPlaylist(playlist, dj_user_id);
		await cherry_service.UpdatePlaylistMusic(playlist_uid, playlist.music_uid_list);
		res.send({
			ok: 1,
			playlist_uid: playlist_uid
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail add_playlist_and_music_list'
		});
	}
});

router.post('/update_playlist_and_music_list', async function(req, res){
	try{
		var user_id = req.body.dj_user_id;
		var playlist = req.body.playlist;
		console.log('playlist id ' + playlist.playlist_uid);
		await cherry_service.UpdatePlaylist(playlist, user_id);
		await cherry_service.UpdatePlaylistMusic(playlist.playlist_uid, playlist.music_uid_list);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail update_playlist_and_music_list'
		});
	}
});

router.post('/get_user_list', async function(req, res){
	try{
		var type = req.body.type;
		var user_list = await cms_service.GetUserList(type);
		res.send({
			ok: 1,
			user_list: user_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail get_user_list'
		});
	}
});

router.post('/update_music', async function(req, res){
	try{
		var title = req.body.title;
		var music_uid = req.body.music_uid;
		var video_id = req.body.video_id;
		var artist_uid = req.body.artist_uid;
		await cms_service.UpdateMusic(music_uid, title, video_id, artist_uid);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail update_music'
		});
	}
});

router.post('/upgrade_user_to_admin', async function(req, res){
	try{
		if(permission_service.IsSuperAdmin(req.session.user_info) == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});	
			return;
		}
		var user_id = req.body.user_id;
		await cms_service.UpgradeUserToAdmin(user_id);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail update_music'
		});
	}
});

router.post('/add_artist_diff_name', async function(req, res){
	try{
		if(permission_service.IsAdmin(req.session.user_info) == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});
			return;
		}
		var org_artist_uid = req.body.org_artist_uid;
		var artist_diff_name = req.body.artist_diff_name;
		await cherry_service.AddArtistDiffName(org_artist_uid, artist_diff_name);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail add_artist_diff_name'
		});
	}
});

router.post('/update_artist_diff_name', async function(req, res){
	try{
		if(permission_service.IsAdmin(req.session.user_info) == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});
			return;
		}
		var artist_uid = req.body.artist_uid;
		var artist_diff_name = req.body.artist_diff_name;
		await cherry_service.UpdateArtistDiffName(artist_uid, artist_diff_name);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail update_artist_diff_name'
		});
	}
});

router.post('/delete_artist_diff_name', async function(req, res){
	try{
		if(permission_service.IsAdmin(req.session.user_info) == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});
			return;
		}
		var artist_uid = req.body.artist_uid;
		await cherry_service.DeleteArtistDiffName(artist_uid);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail delete_artist_diff_name'
		});
	}
});

router.post('/update_artist_info', async function(req, res){
	try{
		if(permission_service.IsAdmin(req.session.user_info) == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});
			return;
		}
		var artist_uid = req.body.artist_uid;
		var name = req.body.name;
		await cherry_service.UpdateArtistInfo(artist_uid, name);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail update_artist_info'
		});
	}
});

module.exports = router;