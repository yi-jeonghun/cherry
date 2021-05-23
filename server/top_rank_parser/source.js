var cc = require('../../public/js/const/country_code');

var COUNTRY_TOP_RANK_SRC = [];
{
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.US] = {
		apple: 'https://music.apple.com/us/playlist/top-100-usa/pl.606afcbb70264d2eb2b51d8dbcfa6a12',
	};
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.GB] = {
		apple: 'https://music.apple.com/us/playlist/top-100-uk/pl.c2273b7e89b44121b3093f67228918e7',
	};
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.KR] = {
		apple: 'https://music.apple.com/kr/playlist/%EC%98%A4%EB%8A%98%EC%9D%98-top-100-%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD/pl.d3d10c32fbc540b38e266367dc8cb00c',
		melon: 'https://www.melon.com/chart/index.htm'
	};
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.DE] = {
		apple: 'https://music.apple.com/us/playlist/top-100-germany/pl.c10a2c113db14685a0b09fa5834d8e8b'
	};
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.FR] = {
		apple: 'https://music.apple.com/us/playlist/top-100-france/pl.6e8cfd81d51042648fa36c9df5236b8d'
	};
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.AU] = {
		apple: 'https://music.apple.com/us/playlist/top-100-australia/pl.18be1cf04dfd4ffb9b6b0453e8fae8f1'
	};
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.CA] = {
		apple: 'https://music.apple.com/tr/playlist/top-100-canada/pl.79bac9045a2540e0b195e983df8ba569'
	};
	COUNTRY_TOP_RANK_SRC[cc.COUNTRY_CODE.BR] = {
		apple: 'https://music.apple.com/us/playlist/top-100-brazil/pl.11ac7cc7d09741c5822e8c66e5c7edbb'
	};
}

module.exports = COUNTRY_TOP_RANK_SRC;