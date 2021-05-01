(function(exports) {

//ISO-3166 Country Codes and ISO-639 Language Codes
//https://docs.oracle.com/cd/E13214_01/wli/docs92/xref/xqisocodes.html

//country flag image
//https://www.countries-ofthe-world.com/flags-of-the-world.html

const COUNTRY_CODE = {
	US: 'US',//미국
	GB: 'GB',//영국
	KR: 'KR',//대한민국
	DE: 'DE',//독일
	FR: 'FR',//프랑스
	AU: 'AU',//호주
	CA: 'CA',//캐나다
	BR: 'BR',//브라질
};

const __COUNTRY_CODE_LIST = [
	COUNTRY_CODE.US,
	COUNTRY_CODE.GB,
	COUNTRY_CODE.KR,
	COUNTRY_CODE.DE,
	COUNTRY_CODE.FR,
	COUNTRY_CODE.AU,
	COUNTRY_CODE.CA,
	COUNTRY_CODE.BR,
];

exports.COUNTRY_CODE = COUNTRY_CODE;
exports.__COUNTRY_CODE_LIST = __COUNTRY_CODE_LIST;

}) (typeof exports === 'undefined'? window._const={}: exports);