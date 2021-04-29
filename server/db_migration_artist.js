var cherry_service = require('./cherry_service');

async function ProcVarious(artist_id, artist_names){
	return new Promise(async function(resolve, reject){
		try{
			var artist_name_list = ParseVarious(artist_names);
			for(var i=0 ; i<artist_name_list.length ; i++){
				var artist_name = artist_name_list[i];
				var member_artist_id = null;
				var find_result = await cherry_service.SearchArtist(artist_name);
				if(find_result.found){
					member_artist_id = find_result.artist_id;
					console.log('Found artist ID ' + member_artist_id);
				}else{
					member_artist_id = await cherry_service.AddArtist(artist_name);
					console.log('New Added artist ID ' + member_artist_id);
				}

				await cherry_service.AddVariousArtist(artist_id, member_artist_id);
			}
			resolve();
		}catch(err){
			reject('FAIL Various #1');
		}finally{
		}
	});
}

function ParseVarious(artist_names){
	var arr = artist_names.split(',');
	var list = [];
	for(var i=0 ; i<arr.length ; i++){
		var name = arr[i];
		name = name.trim();
		list.push(name);
	}
	return list;
}

async function Main(){
	var artist_list = await cherry_service.GetArtistList();
	console.log('artist_list len ' + artist_list.length);
	var various_count = 0;
	for(var i=0 ; i<artist_list.length ; i++){
		var artist_info = artist_list[i];
		console.log('========');
		console.log('artist ' + artist_info.name + ' ID ' + artist_info.artist_id);
		if(artist_info.name.includes(',')){
			various_count++;
			console.log('Is Various Artist ');
			await cherry_service.UpdateIsVarious(artist_info.artist_id);
			await ProcVarious(artist_info.artist_id, artist_info.name);
		}
	}

	console.log('various_count ' + various_count);
	console.log('finish ');
	process.exit();
}

Main();