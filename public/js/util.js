function UTIL_Escape(str){
	// str = str.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
	return $('<div>').text(str).html();
}

function UTIL_UnescapeHTML(str){
	return str.replace(/&amp;/g, '&')
	.replace(/&quot;/g, '"')
	.replace(/&#39;/g, '\'')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>');
}

function UTIL_ShowCherryToast(msg){
	$('#id_cherry_toast_text').html(msg);
	$('.cherry_toast').show();
	setTimeout(function(){
		$('.cherry_toast').hide();
	}, 1000);
}

//		https://www.youtube.com/watch?v=Wb8-6QCd_yI&pp=qAMBugMGCgJrbxAB
function UTIL_ExtractVideoIDFromUrl(url){
	var video_id = url;

	video_id = UTIL_Escape(video_id);
	video_id = video_id.trim();
	if(video_id == ''){
		return null;
	}

	var str_idx = video_id.indexOf('watch?v=');
	if(str_idx != -1){
		video_id = video_id.substr(str_idx + 'watch?v='.length);
	}

	var tmp_arr = video_id.split('&');
	if(tmp_arr.length > 1){
		video_id = tmp_arr[0];
	}

	return video_id;
}

function POST(url, req, cb){
	$.ajax({
		url: url,
		type: 'POST',
		data: JSON.stringify(req),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (res) {
			cb(res);
		}
	});
}
