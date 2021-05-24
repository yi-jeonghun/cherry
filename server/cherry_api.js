var express = require('express');
var url = require('url');
var router = express.Router();
var cherry_service = require('./cherry_service');
var permission_service = require('./permission_service');
// var sitemap_service = require('./sitemap_service');
var cms_service = require('./cms_service');
var auth_service = require('./auth_service');

router.get('/get_artist_list', async function(req, res){
	try{
		var artist_list = await cherry_service.GetArtistList();

		res.send({
			ok: 1,
			artist_list: artist_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_artist_list'
		});
	}
});

router.post('/search_artist', async function(req, res){
	try{
		var data = req.body;
		var ret_data = await cherry_service.SearchArtist(data.artist_name);
		res.send({
			ok: 1,
			data: ret_data
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to search_artist'
		});
	}
});

router.post('/is_my_like_artist', async function(req, res){
	try{
		var artist_uid = req.body.artist_uid;
		var user_id = auth_service.GetLoginUserID(req);
		if(user_id == null){
			res.send({
				ok: 1,
				is_like_artist: false
			});
			return;
		}

		var ret = await cherry_service.IsMyLikeArtiat(user_id, artist_uid);
		res.send({
			ok: 1,
			is_like_artist : ret
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed is_my_like_artist'
		});
	}
});

router.post('/update_artist_like', async function(req, res){
	try{
		var artist_uid = req.body.artist_uid;
		var is_my_like_artist = req.body.is_my_like_artist;
		var user_id = auth_service.GetLoginUserID(req);
		if(user_id == null){
			res.send({
				ok: 0,
				err_code:-1,
				err:'Sign in requied'
			});
			return;
		}

		await cherry_service.UpdateArtistLike(artist_uid, user_id, is_my_like_artist);
		await cherry_service.UpdateArtistLikeCount(artist_uid);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to update_artist_like'
		});
	}
});

router.post('/update_playlist_like', async function(req, res){
	try{
		var playlist_uid = req.body.playlist_uid;
		var is_like = req.body.is_my_like_playlist;
		var user_id = auth_service.GetLoginUserID(req);
		if(user_id == null){
			res.send({
				ok: 0,
				err_code:-1,
				err:'Sign in requied'
			});
			return;
		}

		await cherry_service.UpdatePlaylistLike(playlist_uid, user_id, is_like);
		await cherry_service.UpdatePlaylistLikeCount(playlist_uid);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to update_playlist_like'
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

		var music = req.body;
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
			var music_uid = await cherry_service.AddMusic(music, user_id);
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

router.post('/update_music', async function(req, res){
	try{
		var req_data = req.body;
		var music = req_data.music;
		var artist_uid = '';

		//search artist
		var artist_found_res = await cherry_service.SearchArtist(music.artist);
		console.log('search result ' + artist_found_res.found);
		if(artist_found_res.found == false){
			artist_uid = await cherry_service.AddArtist(music.artist);
			console.log('add result ' + artist_uid);
		}else{
			artist_uid = artist_found_res.artist_uid;
			console.log('found id ' + artist_uid);
		}

		var music_info = {
			music_uid:  req_data.music_uid,
			artist_uid: artist_uid,
			title:     music.title,
			video_id:  music.video_id
		};

		var found = await cherry_service.FindSameMusic(music_info);
		if(found){
			res.send({
				ok: 0,
				err: '이미 등록됨'
			});
		}else{
			await cherry_service.UpdateMusic(music_info);
			res.send({
				ok: 1
			});
		}
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to add Music'
		});
	}
});

router.post('/delete_music', async function(req, res){
	try{
		if(permission_service.IsAdmin(req.session.user_info) == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});
			return;
		}

		var music_uid = req.body.music_uid;

		//playlist_music
		await cherry_service.DeleteMusicInPlaylistMusic(music_uid);
		//top_rank_list
		await cherry_service.DeleteMusicInTopRankList(music_uid);
		//top_rank_list_draft
		await cherry_service.DeleteMusicInTopRankListDraft(music_uid);
		//music
		await cherry_service.DeleteMusic(music_uid);

		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to delete Music'
		});
	}
});

router.post('/delete_artist', async function(req, res){
	try{
		if(permission_service.IsAdmin(req.session.user_info) == false){
			res.send({
				ok:0,
				err:'Fail No Permission'
			});
			return;
		}

		var artist_uid = req.body.artist_uid;

		await cherry_service.DeleteLikeArtist(artist_uid);
		await cherry_service.DeleteVariousArtistMember(artist_uid);
		//artist 자체가 Various Artist인 경우가 있기 때문에 artist_various에서도 삭제되어야 한다.
		await cherry_service.DeleteVariousArtist(artist_uid);
		await cherry_service.DeleteArtistOfOrgArtistUID(artist_uid);
		await cherry_service.DeleteArtist(artist_uid);

		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to delete Artist'
		});
	}
});

router.get('/get_music_list', async function(req, res){
	try{
		var music_list = await cherry_service.GetMusicList();

		res.send({
			ok: 1,
			music_list: music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_music_list'
		});
	}
});

router.post('/fetch_music_list_by_artist_uid', async function(req, res){
	try{
		var artist_uid = req.body.artist_uid;
		console.log('artist_uid ' + artist_uid);
		var music_list = await cherry_service.GetMusicListByArtist(artist_uid);
		
		res.send({
			ok: 1,
			music_list: music_list
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to fetch_music_list_by_artist_uid'
		});
	}
});

router.post('/fetch_VA_music_list_by_artist_uid', async function(req, res){
	try{
		var artist_uid = req.body.artist_uid;
		var music_list = await cherry_service.GetMusicListByVariousArtist(artist_uid);
		
		res.send({
			ok: 1,
			music_list: music_list
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to fetch_VA_music_list_by_artist_uid'
		});
	}
});

router.post('/search_music_by_title', async function(req, res){
	try{
		var music_list = [];
		var keyword = req.body.keyword;
		music_list = await cherry_service.SearchMusicListByTitle(keyword);

		res.send({
			ok: 1,
			music_list: music_list
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to search_music_by_title'
		});
	}
});

router.post('/search_music_smart', async function(req, res){
	try{
		var artist_name = req.body.artist_name;
		var title = req.body.title;
		var list1 = [];
		var list2 = [];

		if(artist_name != ''){
			list1 = await cherry_service.GetMusicListByArtistSearch(artist_name);
		}
		if(title != ''){
			list2 = await cherry_service.SearchMusicListByTitle(title);
		}

		res.send({
			ok: 1,
			list1: list1,
			list2: list2
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to search_music_smart'
		});
	}
});

router.post('/get_music_by_id', async function(req, res){
	try{
		var music_uid = req.body.music_uid;
		var music_list = await cherry_service.GetMusicById(music_uid);
		res.send({
			ok: 1,
			music_list: music_list
		});	
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Failed to get_music_by_id'
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

router.get('/top_rank/get_release_time', async function(req, res){
	try{
		var release_time_list = await cms_service.GetTopRankReleaseTime();
		res.send({
			ok: 1,
			release_time_list: release_time_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail /top_rank/get_release_time'
		});
	}
});

router.post('/get_artist_info_by_artist_uid', async function(req, res){
	try{
		var artist_uid = req.body.artist_uid;
		var artist_info = await cherry_service.GetArtistInfo(artist_uid);
		var artist_diff_name_list = await cherry_service.GetArtistDiffNameList(artist_uid);
		res.send({
			ok: 1,
			artist_info:           artist_info,
			artist_diff_name_list: artist_diff_name_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail get_artist_info_by_artist_uid'
		});
	}
});

router.post('/get_artist_diff_name_list', async function(req, res){
	try{
		var artist_uid = req.body.artist_uid;
		var artist_diff_name_list = await cherry_service.GetArtistDiffNameList(artist_uid);
		res.send({
			ok: 1,
			artist_diff_name_list: artist_diff_name_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail get_artist_diff_name_list'
		});
	}
});

router.post('/search_artist_music_like', async function(req, res){
	try{
		var keyword = req.body.keyword;
		var country_code = req.body.country_code;
		var artist_list = await cherry_service.SearchArtistLike(keyword);
		var music_list = await cherry_service.SearchMusicListByTitle(keyword);
		var playlist_list = await cherry_service.SearchPlaylistByTitleLike(keyword, country_code);
		res.send({
			ok: 1,
			artist_list:   artist_list,
			music_list:    music_list,
			playlist_list: playlist_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail search_artist_music_like'
		});
	}
});

router.post('/get_like_artist_playlist', async function(req, res){
	try{
		var user_id = await permission_service.GetUserID(req);
		var artist_list = [];
		var playlist_list = [];

		if(user_id == null){
			res.send({
				ok: 1,
				artist_list:   artist_list,
				playlist_list: playlist_list
			});
			return;
		}

		artist_list = await cherry_service.GetArtistList_I_Like(user_id);
		playlist_list = await cherry_service.GetPlaylistList_I_Like(user_id);
		res.send({
			ok: 1,
			artist_list:   artist_list,
			playlist_list: playlist_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail get_like_artist_playlist'
		});
	}
});

router.post('/search_music_list_by_artist_name_like', async function(req, res){
	try{
		var keyword = req.body.keyword;
		var music_list = await cherry_service.GetMusicListByArtistNameLike(keyword);
		res.send({
			ok: 1,
			music_list: music_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail search_music_list_by_artist_name_like'
		});
	}
});

router.post('/search_artist_like', async function(req, res){
	try{
		var keyword = req.body.keyword;
		var artist_list = await cherry_service.SearchArtistLike(keyword);
		res.send({
			ok: 1,
			artist_list: artist_list
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail search_artist_like'
		});
	}
});

router.post('/add_playlist', async function(req, res){
	try{
		var user_id = await permission_service.GetUserID(req);
		if(user_id == null){
			res.send({
				ok:0,
				err:'Fail add_playlist, sign in required.'
			});	
			return;
		}
		var playlist = req.body;

		var same_title_exists = await cherry_service.CheckSamePlaylist(playlist.title, user_id);
		if(same_title_exists){
			res.send({
				ok:0,
				err:'Same title.'
			});	
			return;
		}

		var playlist_uid = await cherry_service.AddPlaylist(playlist, user_id);
		res.send({
			ok: 1,
			playlist_uid: playlist_uid
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail add_playlist'
		});
	}
});

router.post('/update_playlist', async function(req, res){
	try{
		var user_id = await permission_service.GetUserID(req);
		if(user_id == null){
			res.send({
				ok:0,
				err_code:-1,
				err:'Fail add_playlist, sign in required.'
			});	
			return;
		}
		var playlist = req.body;

		var same_title_exists = await cherry_service.CheckSamePlaylist(playlist.title, user_id);
		if(same_title_exists){
			res.send({
				ok:0,
				err_code:-2,
				err:'Same title.'
			});	
			return;
		}

		await cherry_service.UpdatePlaylist(playlist, user_id);
		res.send({
			ok: 1
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err_code:0,
			err:'Fail add_playlist'
		});
	}
});

router.post('/add_music_list_to_playlist', async function(req, res){
	try{
		var is_allowed = false;
		if(await permission_service.IsAdmin(req.session.user_info)){
			is_allowed = true;
		}

		var playlist_uid = req.body.playlist_uid;
		var music_uid_list = req.body.music_uid_list;
		var begin_order = req.body.begin_order;

		if(is_allowed == false){
			var user_id = await permission_service.GetUserID(req);
			if(cherry_service.CheckMyPlaylist(playlist_uid, user_id)){
				is_allowed = true;
			}
		}

		if(is_allowed){
			await cherry_service.AddMusicListToPlaylist(playlist_uid, music_uid_list, begin_order);
			res.send({
				ok: 1
			});	
		}else{
			res.send({
				ok:0,
				err:'Fail add_music_list_to_playlist, no permission.'
			});	
		}
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail add_music_list_to_playlist'
		});
	}
});

router.post('/get_playlist_info', async function(req, res){
	try{
		var playlist_uid = req.body.playlist_uid;
		var playlist_info = await cherry_service.GetPlaylistInfo(playlist_uid);
		var music_list = await cherry_service.GetPlaylistMusicList(playlist_uid);
		var is_my_like_playlist = false;
		var user_id = await permission_service.GetUserID(req);
		console.log('user_id ' + user_id);
		if(user_id != null){
			is_my_like_playlist = await cherry_service.IsMyLikePlaylist(user_id, playlist_uid);
		}
		res.send({
			ok: 1,
			playlist_info: playlist_info,
			music_list: music_list,
			is_my_like_playlist: is_my_like_playlist
		});
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail get_playlist_info'
		});
	}
});

router.post('/get_playlist_list', async function(req, res){
	try{
		var country_code = req.body.country_code;
		var mine_only = req.body.mine_only;
		var open_only = req.body.open_only;
		var user_id = await permission_service.GetUserID(req);

		if(mine_only && user_id == null){
			res.send({
				ok:0,
				err_code:-1,
				err:'Fail get_playlist_list. No user ID.'
			});
			return;
		}

		var playlist_list = await cherry_service.GetPlaylistList(country_code, mine_only, open_only, user_id);
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

router.post('/delete_playlist', async function(req, res){
	try{
		var is_allowed = false;
		if(await permission_service.IsAdmin(req.session.user_info)){
			is_allowed = true;
		}

		var playlist_uid = req.body.playlist_uid;
		if(is_allowed == false){
			var user_id = await permission_service.GetUserID(req);
			if(cherry_service.CheckMyPlaylist(playlist_uid, user_id)){
				is_allowed = true;
			}
		}

		if(is_allowed){
			await cherry_service.DeletePlaylist(playlist_uid);
			await cherry_service.DeleteAllMusicFromPlaylist(playlist_uid);
			res.send({
				ok: 1
			});	
		}else{
			res.send({
				ok:0,
				err:'Fail delete_playlist, no permission.'
			});	
		}
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail delete_playlist'
		});
	}
});

router.post('/delete_music_from_playlist', async function(req, res){
	try{
		var is_allowed = false;
		if(await permission_service.IsAdmin(req.session.user_info)){
			is_allowed = true;
		}

		var playlist_uid = req.body.playlist_uid;
		var music_uid = req.body.music_uid;
		if(is_allowed == false){
			var user_id = await permission_service.GetUserID(req);
			if(cherry_service.CheckMyPlaylist(playlist_uid, user_id)){
				is_allowed = true;
			}
		}

		if(is_allowed){
			await cherry_service.DeleteOneMusicFromPlaylist(playlist_uid, music_uid);
			res.send({
				ok: 1
			});	
		}else{
			res.send({
				ok:0,
				err:'Fail delete_music_from_playlist, no permission.'
			});	
		}
	}catch(err){
		console.error(err);
		res.send({
			ok:0,
			err:'Fail delete_music_from_playlist'
		});
	}
});


module.exports = router;