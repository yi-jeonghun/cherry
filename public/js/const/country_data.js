const C_US = window._const.COUNTRY_CODE.US;
const C_GB = window._const.COUNTRY_CODE.GB;
const C_KR = window._const.COUNTRY_CODE.KR;
const C_DE = window._const.COUNTRY_CODE.DE;
const C_FR = window._const.COUNTRY_CODE.FR;
const C_AU = window._const.COUNTRY_CODE.AU;
const C_CA = window._const.COUNTRY_CODE.CA;

const COUNTRY_CODE_LIST = [
	C_US,
	C_GB,
	C_KR,
	C_DE,
	C_FR,
	C_AU,
	C_CA,
];

//https://www.worldatlas.com/articles/names-of-countries-in-their-own-languages.html
var COUNTRY_NAME_LIST = [];
{
	COUNTRY_NAME_LIST[C_US] = 'United States';
	COUNTRY_NAME_LIST[C_GB] = 'United Kingdom';
	COUNTRY_NAME_LIST[C_KR] = '한국';
	COUNTRY_NAME_LIST[C_DE] = 'Deutschland';
	COUNTRY_NAME_LIST[C_FR] = 'France';
	COUNTRY_NAME_LIST[C_AU] = 'Australia';	
	COUNTRY_NAME_LIST[C_CA] = 'Canada';	
}

//Language code => https://www.w3schools.com/tags/ref_language_codes.asp
//Country code => https://www.w3schools.com/tags/ref_country_codes.asp
var COUNTRY_LANG_LIST = [];
{
	COUNTRY_LANG_LIST[C_US] = 'en-US';
	COUNTRY_LANG_LIST[C_GB] = 'en-GB';
	COUNTRY_LANG_LIST[C_KR] = 'ko-KR';
	COUNTRY_LANG_LIST[C_DE] = 'de-DE';
	COUNTRY_LANG_LIST[C_FR] = 'fr-FR';
	COUNTRY_LANG_LIST[C_AU] = 'en-AU';
	COUNTRY_LANG_LIST[C_AU] = 'en-CA';
}

var COUNTRY_TOP_RANK_SRC = [];
{
	COUNTRY_TOP_RANK_SRC[C_US] = {
		a_src: 'https://music.apple.com/us/playlist/top-100-usa/pl.606afcbb70264d2eb2b51d8dbcfa6a12',
	};
	COUNTRY_TOP_RANK_SRC[C_GB] = {
		a_src: 'https://music.apple.com/us/playlist/top-100-uk/pl.c2273b7e89b44121b3093f67228918e7',
	};
	COUNTRY_TOP_RANK_SRC[C_KR] = {
		a_src: 'https://music.apple.com/kr/playlist/%EC%98%A4%EB%8A%98%EC%9D%98-top-100-%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD/pl.d3d10c32fbc540b38e266367dc8cb00c'
	};
	COUNTRY_TOP_RANK_SRC[C_DE] = {
		a_src: 'https://music.apple.com/us/playlist/top-100-germany/pl.c10a2c113db14685a0b09fa5834d8e8b'
	};
	COUNTRY_TOP_RANK_SRC[C_FR] = {
		a_src: 'https://music.apple.com/us/playlist/top-100-france/pl.6e8cfd81d51042648fa36c9df5236b8d'
	};
	COUNTRY_TOP_RANK_SRC[C_AU] = {
		a_src: 'https://music.apple.com/us/playlist/top-100-australia/pl.18be1cf04dfd4ffb9b6b0453e8fae8f1'
	};
	COUNTRY_TOP_RANK_SRC[C_CA] = {
		a_src: 'https://music.apple.com/tr/playlist/top-100-canada/pl.79bac9045a2540e0b195e983df8ba569'
	};
}
