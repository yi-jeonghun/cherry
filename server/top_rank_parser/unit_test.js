const top_rank_parser = require('./top_rank_parser');
const CC = require('../../public/js/const/country_code');
var fs = require('fs');

async function SaveTestResult(music_list){
	return new Promise(async function(resolve, reject){
		var content = 'Total : ' + music_list.length + '\n';
		for(var i=0 ; i<music_list.length ; i++){
			content += (i*1+1) + ' ' + music_list[i].title + '\n';
			content += '\t' + music_list[i].artist + '\n';
		}

		fs.writeFile('test_result.txt', content, function (err) {
			if (err) {
				console.log(err);
				reject(err);
			}
			console.log('file write success');
			resolve();
		});
	});
}

function TestExtractArtist(line){
	var artist_list = [];
	var a_arr = line.split('<a');

	for (let i = 0; i < a_arr.length; i++) {
		const a = a_arr[i];
		var end_a_idx = a.indexOf('</a>');
		if(end_a_idx != -1){
			var value = a.substr(a.indexOf('>')+1);
			value = value.split('</a')[0];
			artist_list.push(value);
		}
	}

	return artist_list.join(', ');
}

function TestExtract(){
	// var line = '                                        <span>                                                        <a href="https://music.apple.com/us/artist/moneybagg-yo/991187319" class="songs-list-row__link" tabindex="-1" dir="auto">Moneybagg Yo</a></span>';
	var line = '     <span><a href="https://music.apple.com/WebObjects/MZStore.woa/wa/viewCollaboration?cc=kr&amp;ids=1509202338-1483178706-1280943441-1478713949" class="songs-list-row__link" tabindex="-1">미란이, 먼치맨, 쿤디판다 &amp; 머쉬베놈</a></span>';
	// var line = '     <span><a href="https://music.apple.com/us/artist/young-stoner-life/1545184404" class="songs-list-row__link" tabindex="-1" dir="auto">Young Stoner Life</a>, <a href="https://music.apple.com/us/artist/young-thug/81886939" class="songs-list-row__link" tabindex="-1" dir="auto">Young Thug</a>,   <a href="https://music.apple.com/us/artist/gunna/1236267297" class="songs-list-row__link" tabindex="-1" dir="auto">Gunna</a></span>';

	var artist = TestExtractArtist(line);
	console.log('artist ' + artist);
}

async function TestApple(){
	return new Promise(async function(resolve, reject){
		top_rank_parser.Init(CC.COUNTRY_CODE.KR, 'apple');
		{
			// await top_rank_parser.SaveContent();
		}
		{
			var music_list = await top_rank_parser.Test();
			await SaveTestResult(music_list);
		}
		resolve();
	});
}

async function TestMelon(){
	return new Promise(async function(resolve, reject){
		top_rank_parser.Init(CC.COUNTRY_CODE.KR, 'melon');
		{
			// await top_rank_parser.SaveContent();
		}
		{
			var music_list = await top_rank_parser.Test();
			await SaveTestResult(music_list);
		}
		resolve();
	});
}

async function Main(){
	await TestMelon();
	process.exit();
}

Main();