function Util(){
	this.EscapeHTML = function(str){
		return str.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
	};
}

module.exports = new Util();