const L_TOP_RANK_META_KEYWORDS = [];
{
	L_TOP_RANK_META_KEYWORDS[C_US] = 'Youtube, Music, No Ads, no advertisement, playlist, top100, top 100, no ads top 100, youtube music, youtube playlist';
	L_TOP_RANK_META_KEYWORDS[C_KR] = 'Youtube, 음악, 광고 없음, 플레이리스트, top100, top 100, 탑100, 톱100, 광고 없는 탑 100, 유튜브 음악, 유튜브 플레이리스트';
	L_TOP_RANK_META_KEYWORDS[C_DE] = 'Youtube, Musik, keine Werbung, keine Werbung, Wiedergabeliste, Top100, Top 100, keine Werbung Top 100, Youtube-Musik, Youtube-Wiedergabeliste';
	L_TOP_RANK_META_KEYWORDS[C_FR] = 'Youtube, musique, pas de publicité, pas de publicité, playlist, top 100, top 100, pas de pub top 100, musique youtube, playlist youtube';
	L_TOP_RANK_META_KEYWORDS[C_BR] = 'Youtube, música, sem anúncios, sem anúncio, lista de reprodução, top100, top 100, sem anúncios, top 100, música do youtube, lista de reprodução do youtube';
}

const L_TOP_RANK_META_DESC = [];
{
	L_TOP_RANK_META_DESC[C_US] = ' Top 100 popular songs. Listen to youtube music without ads.';
	L_TOP_RANK_META_DESC[C_KR] = ' Top 100 인기 음악. Youtube 음악을 광고 없이 들어보세요.';
	L_TOP_RANK_META_DESC[C_DE] = ' Top 100 beliebte Songs. Hören Sie YouTube-Musik ohne Werbung.';
	L_TOP_RANK_META_DESC[C_FR] = ' Top 100 des chansons populaires. Écoutez de la musique YouTube sans publicité.';
	L_TOP_RANK_META_DESC[C_BR] = ' As 100 melhores músicas populares. Ouça músicas do YouTube sem anúncios.';
}

const L_ARTIST_META_KEYWORDS = [];
{
	L_ARTIST_META_KEYWORDS[C_US] = ', song, music, musics, hit songs, popular songs, youtube music, no ads, no advertisement';
	L_ARTIST_META_KEYWORDS[C_KR] = ', 노래, 음악, 히트송, 인기 음악, Youtube 음악, 광고 없이';
	L_ARTIST_META_KEYWORDS[C_DE] = ', Lied, Musik, Musik, Hits, populäre Lieder, Youtube-Musik, keine Werbung, keine Werbung';
	L_ARTIST_META_KEYWORDS[C_FR] = ', chanson, musique, musiques, chansons à succès, chansons populaires, musique youtube, pas de publicité, pas de publicité';
	L_ARTIST_META_KEYWORDS[C_BR] = ', canção, música, músicas, canções de sucesso, canções populares, música do youtube, sem anúncios, sem propaganda';
}

const L_ARTIST_META_DESC = [];
{
	L_ARTIST_META_DESC[C_US] = ' popular songs. Listend to youtube music without ads';
	L_ARTIST_META_DESC[C_KR] = ' 인기 음악. Youtube 음악을 광고 없이 들어보세요.';
	L_ARTIST_META_DESC[C_DE] = ' beliebte Lieder. Hören Sie YouTube-Musik ohne Werbung';
	L_ARTIST_META_DESC[C_FR] = ' chansons populaires. Écouter de la musique YouTube sans publicité';
	L_ARTIST_META_DESC[C_BR] = ' musicas populares. Ouça músicas do YouTube sem anúncios';
}

const L_SEARCH_AND_CHOOSE_VIDEO_PLZ = [];
{
	L_SEARCH_AND_CHOOSE_VIDEO_PLZ[C_US] = 'Search and choose video, please.';
}

const L_INPUT_TITLE_PLZ = [];
{
	L_INPUT_TITLE_PLZ[C_US] = 'Input title, please.';
}

const L_SUCCESS = [];
{
	L_SUCCESS[C_US] = 'Success';
}

const L_SAME_TITLE_EXISTS = [];
{
	L_SAME_TITLE_EXISTS[C_US] = 'Same title exists';
}

const L_SAME_VIDEO_EXISTS = [];
{
	L_SAME_VIDEO_EXISTS[C_US] = 'Same video exists';
}

const L_SIGN_IN_REQUIRED = [];
{
	L_SIGN_IN_REQUIRED[C_US] = "Sign in requred.";
}

const L_SIGN_OUT = [];
{
	L_SIGN_OUT[C_US] = 'Sign Out';
	L_SIGN_OUT[C_KR] = '로그 아웃';
}

//================================================

function TR(L){
	var val = L[window._country_code];
	if(val === undefined){
		return L[C_US];
	}
	return val;
}

function TRP(L){
	document.write(TR(L));
}