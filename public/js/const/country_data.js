const COUNTRY_CODE_LIST = [
	window._const.COUNTRY_CODE.US,
	window._const.COUNTRY_CODE.GB,
	window._const.COUNTRY_CODE.KR,
	window._const.COUNTRY_CODE.DE,
	window._const.COUNTRY_CODE.FR,
	window._const.COUNTRY_CODE.AU,
];

//https://www.worldatlas.com/articles/names-of-countries-in-their-own-languages.html
var COUNTRY_NAME_LIST = [];
COUNTRY_NAME_LIST[window._const.COUNTRY_CODE.US] = 'United States';
COUNTRY_NAME_LIST[window._const.COUNTRY_CODE.GB] = 'United Kingdom';
COUNTRY_NAME_LIST[window._const.COUNTRY_CODE.KR] = '한국';
COUNTRY_NAME_LIST[window._const.COUNTRY_CODE.DE] = 'Deutschland';
COUNTRY_NAME_LIST[window._const.COUNTRY_CODE.FR] = 'France';
COUNTRY_NAME_LIST[window._const.COUNTRY_CODE.AU] = 'Australia';

var COUNTRY_TOP_RANK_SRC = [];
COUNTRY_TOP_RANK_SRC[window._const.COUNTRY_CODE.US] = {
	a_src: 'https://music.apple.com/us/playlist/top-100-usa/pl.606afcbb70264d2eb2b51d8dbcfa6a12',
};
COUNTRY_TOP_RANK_SRC[window._const.COUNTRY_CODE.GB] = {
	a_src: 'https://music.apple.com/us/playlist/top-100-uk/pl.c2273b7e89b44121b3093f67228918e7',
};
COUNTRY_TOP_RANK_SRC[window._const.COUNTRY_CODE.KR] = {
	a_src: 'https://music.apple.com/kr/playlist/%EC%98%A4%EB%8A%98%EC%9D%98-top-100-%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD/pl.d3d10c32fbc540b38e266367dc8cb00c'
};
COUNTRY_TOP_RANK_SRC[window._const.COUNTRY_CODE.DE] = {
	a_src: 'https://music.apple.com/us/playlist/top-100-germany/pl.c10a2c113db14685a0b09fa5834d8e8b'
};
COUNTRY_TOP_RANK_SRC[window._const.COUNTRY_CODE.FR] = {
	a_src: 'https://music.apple.com/us/playlist/top-100-france/pl.6e8cfd81d51042648fa36c9df5236b8d'
};
COUNTRY_TOP_RANK_SRC[window._const.COUNTRY_CODE.AU] = {
	a_src: 'https://music.apple.com/us/playlist/top-100-australia/pl.18be1cf04dfd4ffb9b6b0453e8fae8f1'
};
