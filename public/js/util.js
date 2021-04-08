function UTIL_Escape(str){
	// str = str.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
	return $('<div>').text(str).html();
}

function UTIL_ShowCherryToast(msg){
	$('#id_cherry_toast_text').html(msg);
	$('.cherry_toast').show();
	setTimeout(function(){
		$('.cherry_toast').hide();
	}, 1000);
}