
(function(exports) {
     
	// The code defines all the functions,
	// variables or object to expose as:
	// exports.variableName
	// exports.functionName
	// exports.ObjectName

	const _top_rank_country_list = [
		{
			country_code: 'GLO',
			country_name: 'Global',
			route_url:'/top_rank.vu?country_code=GLO',
			a_src: 'https://music.apple.com/us/playlist/top-100-global/pl.d25f5d1181894928af76c85c967f8f31',
		},
		{
			country_code: 'USA',
			country_name: 'USA',
			route_url:'/top_rank.vu?country_code=USA',
			a_src: 'https://music.apple.com/us/playlist/top-100-usa/pl.606afcbb70264d2eb2b51d8dbcfa6a12',
		},
		{
			country_code: 'GBR',
			country_name: 'UK',
			route_url:'/top_rank.vu?country_code=GBR',
			a_src: 'https://music.apple.com/us/playlist/top-100-uk/pl.c2273b7e89b44121b3093f67228918e7',
		},
		{
			country_code: 'KOR',
			country_name: 'Korea',
			route_url:'/top_rank.vu?country_code=KOR',
			a_src: 'https://music.apple.com/kr/playlist/%EC%98%A4%EB%8A%98%EC%9D%98-top-100-%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD/pl.d3d10c32fbc540b38e266367dc8cb00c'
		},
	];

	exports._top_rank_country_list = _top_rank_country_list;
	console.log('export top rank const ' );

}) (typeof exports === 'undefined'? window._const={}: exports);

