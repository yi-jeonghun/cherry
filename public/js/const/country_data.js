const C_US = window._const.COUNTRY_CODE.US;
const C_GB = window._const.COUNTRY_CODE.GB;
const C_KR = window._const.COUNTRY_CODE.KR;
const C_DE = window._const.COUNTRY_CODE.DE;
const C_FR = window._const.COUNTRY_CODE.FR;
const C_AU = window._const.COUNTRY_CODE.AU;
const C_CA = window._const.COUNTRY_CODE.CA;
const C_BR = window._const.COUNTRY_CODE.BR;

const COUNTRY_CODE_LIST = [
	C_US,
	C_GB,
	C_KR,
	C_DE,
	C_FR,
	C_AU,
	C_CA,
	C_BR,
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
	COUNTRY_NAME_LIST[C_BR] = 'Brazil';
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
	COUNTRY_LANG_LIST[C_CA] = 'en-CA';
	COUNTRY_LANG_LIST[C_BR] = 'pt-BR';
}
