const lyrics_parser = require('./lyrics_parser');

async function Main(){
	await lyrics_parser.LoadHtmlFile();
	await lyrics_parser.Pasrse();
}

Main();