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


//https://www.worldatlas.com/articles/names-of-countries-in-their-own-languages.html
const COUNTRY_LIST = [
	{
		country_code: COUNTRY_CODE.US,
		country_name: 'United States'
	},
	{
		country_code: COUNTRY_CODE.GB,
		country_name: 'United Kingdom'
	},
	{
		country_code: COUNTRY_CODE.KR,
		country_name: '한국'
	},
	{
		country_code: COUNTRY_CODE.DE,
		country_name: 'Deutschland'
	},
	{
		country_code: COUNTRY_CODE.FR,
		country_name: 'France'
	},
	{
		country_code: COUNTRY_CODE.AU,
		country_name: 'Australia'
	},

];