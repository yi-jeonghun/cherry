function UTIL_Escape(str){
	// str = str.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
	return $('<div>').text(str).html();
}