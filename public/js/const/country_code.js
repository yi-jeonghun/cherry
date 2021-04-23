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
};

exports.COUNTRY_CODE = COUNTRY_CODE;
}) (typeof exports === 'undefined'? window._const={}: exports);