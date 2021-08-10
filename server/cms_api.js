var express = require('express');
const cherry_service = require('./cherry_service');
var router = express.Router();
var cms_service = require('./cms_service');
var top_rank_parser = require('./top_rank_parser/top_rank_parser');
var lyrics_parser = require('./lyrics_parser/lyrics_parser');
var radio_parser = require('./radio_parser/radio_parser');
var era_parser = require('./era_parser/era_parser');
var permission_service = require('./permission_service');
var auth_service = require('./auth_service');
var randomstring = require("randomstring");
const util = require('./util');

//===================================================
// TOP RANK
//---------------------------------------------------
{
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
	router.post('/top_rank/auto_search_artist_and_music_list', async function(req, res){
		try{
			var music_list = req.body.music_list;
			music_list = await cms_service.AutoSearchArtistList(music_list);
			var ret_music_list = await cms_service.AutoSearchMusicList(music_list);
			res.send({
				ok: 1,
				ret_music_list: ret_music_list
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail /top_rank/auto_search_artist_and_music_list'
			});
		}
	});
}
//===================================================
// LYRICS
//---------------------------------------------------
{
	router.post('/extract_lyrics_from_url', async function(req, res){
		try{
			var url = req.body.url;
			console.log('url ' + url);
			var lyrics = await lyrics_parser.GetLyrics(url);
			res.send({
				ok: 1,
				lyrics: lyrics
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'fail extract_lyrics_from_url #1'
			});
		}
	});	
}
//===================================================
// PLAYLIST
//---------------------------------------------------
{
	router.post('/get_playlist_list', async function(req, res){
		try{
			var country_code = req.body.country_code;	
			var playlist_list = await cherry_service.GetPlaylistList_Official(country_code);
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
	router.post('/add_playlist', async function(req, res){
		try{
			var dj_user_id = req.body.dj_user_id;
			var playlist = req.body.playlist;
			var hash_list = req.body.hash_list;
			var is_official = 'Y';
			var playlist_uid = await cherry_service.AddPlaylist(playlist, dj_user_id, is_official);
			// await cherry_service.UpdatePlaylistMusic(playlist_uid, playlist.music_uid_list);
			await cherry_service.UpdatePlaylistHashList(playlist_uid, hash_list);
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
	router.post('/update_playlist', async function(req, res){
		try{
			var user_id = req.body.dj_user_id;
			var playlist = req.body.playlist;
			var hash_list = req.body.hash_list;
			console.log('playlist id ' + playlist.playlist_uid);
			var is_official = 'Y';
			await cherry_service.UpdatePlaylist(playlist, user_id, is_official);
			// await cherry_service.UpdatePlaylistMusic(playlist.playlist_uid, playlist.music_uid_list);
			await cherry_service.UpdatePlaylistHashList(playlist.playlist_uid, hash_list);
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
	router.post('/update_playlist_music_list', async function(req, res){
		try{
			var playlist_uid = req.body.playlist_uid;
			var music_uid_list = req.body.music_uid_list;
			var video_id_list = req.body.video_id_list;
			await cherry_service.UpdatePlaylistMusic(playlist_uid, music_uid_list);
			
			var video_id_list_str = '';
			for(var i=0 ; i<video_id_list.length ; i++){
				video_id_list_str += video_id_list[i] + ',';
				if(i >= 3) break;
			}
			console.log('video_id_list_str ' + video_id_list_str);
			await cherry_service.UpdatePlaylistViddoIdList(playlist_uid, video_id_list_str);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail update_playlist_music_list'
			});
		}
	});

}
//===================================================
// ARTIST
//---------------------------------------------------
{
	router.post('/find_or_add_artist', async function(req, res){
		try{
			var artist_name = req.body.artist_name;
			var artist_uid = null;
	
			var artist_found_res = await cherry_service.SearchArtist(artist_name);
			console.log('search result ' + artist_found_res.found);
			if(artist_found_res.found == false){
				artist_uid = await cherry_service.AddArtist(artist_name, false);
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
	router.post('/update_artist_is_various', async function(req, res){
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
	
			var artist_uid = req.body.artist_uid;
			var is_various = req.body.is_various;
			await cms_service.UpdateArtistIsVarious(artist_uid, is_various);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail update_artist_is_various'
			});
		}
	});
	router.post('/add_various_artist', async function(req, res){
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
	
			var artist_uid = req.body.artist_uid;
			var member_artist_uid = req.body.member_artist_uid;
			await cherry_service.AddVariousArtist(artist_uid, member_artist_uid);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail add_various_artist'
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
}
//===================================================
// USER
//---------------------------------------------------
{
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
}
//===================================================
// MUSIC
//---------------------------------------------------
{
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
				await cherry_service.UpdateArtistTimestamp(music.artist_uid);
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
			var title = req.body.title;
			var music_uid = req.body.music_uid;
			var video_id = req.body.video_id;
			var artist_uid = req.body.artist_uid;
			await cms_service.UpdateMusic(music_uid, title, video_id, artist_uid);
			await cms_service.UpdateMusicOfDiffNames(music_uid, video_id, artist_uid);
			
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
	router.post('/get_music_diff_name_list', async function(req, res){
		try{
			var music_uid = req.body.music_uid;
			var music_diff_name_list = await cherry_service.GetMusicDiffNameList(music_uid);
			res.send({
				ok: 1,
				music_diff_name_list: music_diff_name_list
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail get_music_diff_name_list'
			});
		}
	});
	router.post('/add_music_diff_name', async function(req, res){
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
	
			var user_id = req.session.user_info.user_id;
			var org_music_uid = req.body.org_music_uid;
			var diff_name = req.body.diff_name;
			var artist_uid = req.body.artist_uid;
			var video_id = req.body.video_id;
			await cherry_service.AddMusicDiffName(org_music_uid, diff_name, artist_uid, user_id, video_id);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail add_music_diff_name'
			});
		}
	});
	router.post('/delete_music_diff_name', async function(req, res){
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
	
			var music_uid = req.body.music_uid;
			await cherry_service.DeleteMusicDiffName(music_uid);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail delete_music_diff_name'
			});
		}
	});
	router.get('/get_music_list_no_lyrics', async function(req, res){
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
	
			var page = req.query.p;
	
			var ret = await cms_service.GetMusicList_NoLyrics(page);
			res.send({
				ok: 1,
				count: ret.count,
				music_list: ret.music_list
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail get_music_list_no_lyrics'
			});
		}
	});
	router.get('/get_music_list_correction', async function(req, res){
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
	
			var ret = await cms_service.GetMusicList_Correction();
			res.send({
				ok: 1,
				correction_music_list: ret
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail get_music_list_no_lyrics'
			});
		}
	});
	router.post('/change_video_id', async function(req, res){
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
	
			var music_uid = req.body.music_uid;
			var video_id = req.body.video_id;
			var ret = await cms_service.ChangeVideoID(music_uid, video_id);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail change_video_id'
			});
		}
	});
	router.post('/delete_music_correct_request', async function(req, res){
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
	
			var music_uid = req.body.music_uid;
			var video_id = req.body.video_id;
			var ret = await cms_service.DeleteMusicCorrectionRequest(music_uid, video_id);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail change_video_id'
			});
		}
	});
}
//===================================================
// RADIO
//---------------------------------------------------
{
	router.post('/auto_radio_playlist', async function(req, res){
		try{
			var date = req.body.date;
			var parser_type = req.body.parser_type;
			var parser_info = req.body.parser_info;
			// console.log('url ' + url);
			var playlist = await radio_parser.GetPlaylist(parser_type, parser_info, date);
			res.send({
				ok: 1,
				playlist: playlist
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'fail auto_playlist #1'
			});
		}
	});
	router.post('/add_radio_network', async function(req, res){
		try{
			var is_admin = await permission_service.IsAdmin(req.session.user_info);
			if(is_admin == false){
				res.send({
					ok:0,
					err:'Fail No Permission'
				});	
				return;
			}
	
			var name = req.body.name;
			var country_code = req.body.country_code;
			await cms_service.AddRadioNetwork(country_code, name);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail add_radio_network'
			});
		}
	});
	router.post('/update_radio_network', async function(req, res){
		try{
			var is_admin = await permission_service.IsAdmin(req.session.user_info);
			if(is_admin == false){
				res.send({
					ok:0,
					err:'Fail No Permission'
				});	
				return;
			}
	
			var name = req.body.name;
			var network_uid = req.body.network_uid;
			await cms_service.UpdateRadioNetwork(network_uid, name);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail update_radio_network'
			});
		}
	});
	router.post('/add_radio_program', async function(req, res){
		try{
			var is_admin = await permission_service.IsAdmin(req.session.user_info);
			if(is_admin == false){
				res.send({
					ok:0,
					err:'Fail No Permission'
				});	
				return;
			}
	
			var network_uid = req.body.network_uid;
			var name = req.body.name;
			var parser_type = req.body.parser_type;
			var parser_info = req.body.parser_info;
			var is_open = req.body.is_open;
			await cms_service.AddRadioProgram(network_uid, name, parser_type, parser_info, is_open);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail add_radio_program'
			});
		}
	});
	router.post('/update_radio_program', async function(req, res){
		try{
			var is_admin = await permission_service.IsAdmin(req.session.user_info);
			if(is_admin == false){
				res.send({
					ok:0,
					err:'Fail No Permission'
				});	
				return;
			}
	
			var name = req.body.name;
			var program_uid = req.body.program_uid;
			var parser_type = req.body.parser_type;
			var parser_info = req.body.parser_info;
			var is_open = req.body.is_open;
			await cms_service.UpdateRadioProgram(program_uid, name, parser_type, parser_info, is_open);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail update_radio_program'
			});
		}
	});
	router.post('/release_radio_program_music', async function(req, res){
		try{
			var is_admin = await permission_service.IsAdmin(req.session.user_info);
			if(is_admin == false){
				res.send({
					ok:0,
					err:'Fail No Permission'
				});	
				return;
			}
	
			var program_uid = req.body.program_uid;
			var date = req.body.date;
			var music_list = req.body.music_list;
			await cms_service.ReleaseRadioProgramMusic(program_uid, date, music_list);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'Fail release_radio_program_music'
			});
		}
	});
}
//===================================================
// ERA
//---------------------------------------------------
{
	router.post('/era/get_auto_era_chart', async function(req, res){
		try{
			var year = req.body.year;
			var site = req.body.site;
			var region = req.body.region;
			var auto_music_list = await era_parser.get_auto_chart(site, year, region);
			res.send({
				ok: 1,
				auto_music_list: auto_music_list
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'fail /era/get_auto_era_chart #1'
			});
		}
	});
	router.post('/era/update_draft', async function(req, res){
		try{
			var era_uid = req.body.era_uid;
			var source = req.body.source;
			var music_list = req.body.music_list;
			await cms_service.ERA_UpdateDraft(era_uid, source, music_list);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'fail /era/update_draft #1'
			});
		}
	});
	router.post('/era/get_draft', async function(req, res){
		try{
			var era_uid = req.body.era_uid;
			var source = req.body.source;
			var music_list = await cms_service.ERA_GetDraft(era_uid, source);
			res.send({
				ok: 1,
				music_list:music_list
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'fail /era/get_draft #1'
			});
		}
	});
	router.post('/era/release', async function(req, res){
		try{
			var era_uid = req.body.era_uid;
			console.log('era_uid ' + era_uid);
			var music_list = req.body.music_list;
			await cms_service.ERA_Release(era_uid, music_list);
			res.send({
				ok: 1
			});
		}catch(err){
			console.error(err);
			res.send({
				ok:0,
				err:'fail /era/release #1'
			});
		}
	});
}
module.exports = router;