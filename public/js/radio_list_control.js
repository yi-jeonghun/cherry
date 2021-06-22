$('document').ready(function(){
	window._radio_list_control = new RadioListControl().Init();
});

function RadioListControl(){
	var self = this;
	this._radio_network_list = [];
	this._radio_program_list = [];

	this.Init = function(){
		self.GetRadioNetworkAndProgramList();
		return this;
	};

	//----------------------------------------------------------------------

	this.GetRadioNetworkAndProgramList = function(){
		var req = {
			country_code: window._country_code
		};
		POST('/cherry_api/get_radio_networks_and_programs', req, res=>{
			if(res.ok){
				self._radio_network_list = res.radio_network_list;
				self._radio_program_list = res.radio_program_list;
				self.DISP_RadioNetworkAndProgramList();
			}else{
				alert(res.err);
			}
		});
	};

	//----------------------------------------------------------------------

	this.DISP_RadioNetworkAndProgramList = function(){
		var h = '';

		for(var n=0 ; n<self._radio_network_list.length ; n++){
			var network = self._radio_network_list[n];
			h += `
			<div>${network.name}</div>
			`;

			for(var p=0 ; p<self._radio_program_list.length ; p++){
				var program = self._radio_program_list[p];
				var on_click = `window._router.Go('/${window._country_code}/radio_detail.go?pid=${program.program_uid}')`;

				h += `
				<div class="pl-3 pointer" onClick="${on_click}">${program.name}</div>
				`;
			}
		}
		$('#id_div_radio_list').html(h);
	};
}