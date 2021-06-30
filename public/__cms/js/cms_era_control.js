$('document').ready(function(){
	console.log('ready ' );
	window._era_control = new EraControl().Init();
});

const EDIT_TYPE = {
	MELON_DRAFT : 0,
	GINIE_DRAFT : 1,
	RELEASE : 2
};

function EraControl(){
	var self = this;
	this._year_list = [];
	this._year = null;
	this._edit_type = null;

	this.Init = function(){
		console.log('init ');
		self.InitHandle();
		self.LoadYearList();
		return this;
	};

	this.InitHandle = function(){
	};

	this.LoadYearList = function(){
		var req = {
			country_code: window._country_selector.GetCountryCode()
		};
		POST('/cherry_api/era/get_year_list', req, res=>{
			if(res.ok){
				self._year_list = res.year_list;
				self.DISP_YearList();
			}else{
				alert(res.err);
			}
		});
	};

	//-------------------------------------------------------

	this.OnClick_AddYear = function(){
		var year = $('#id_input_cms_era_year').val().trim();
		if(year == ''){
			alert('input year');
			return;
		}
		for(var i=0 ; i<self._year_list.length ; i++){
			if(year == self._year_list[i].year){
				alert('same year is already registered.');
				return;
			}
		}

		var req = {
			country_code: window._country_selector.GetCountryCode(),
			year: year
		};
		POST('/cherry_api/era/add_year', req, res=>{
			if(res.ok){
				self.LoadYearList();
			}else{
				alert(res.err);
			}
		});
	};

	this.OnClick_SelectYear = function(idx){
		self._year = self._year_list[idx].year;
		$('#id_label_cms_era_selected_year').html(self._year);
	};

	this.OnClick_EditType = function(type){
		self._edit_type = type;
		self.HighlightEditType();
	};

	this.OnClick_Auto = function(){
		if(self._year == null){
			alert('choose year');
			return;
		}
	};

	//-------------------------------------------------------

	this.HighlightEditType = function(){
		$('#id_btn_cms_era_melon').removeClass('btn-primary');
		$('#id_btn_cms_era_ginie').removeClass('btn-primary');
		$('#id_btn_cms_era_release').removeClass('btn-primary');
		if(self._edit_type == EDIT_TYPE.MELON_DRAFT){
			$('#id_btn_cms_era_melon').addClass('btn-primary');
		}else if(self._edit_type == EDIT_TYPE.GINIE_DRAFT){
			$('#id_btn_cms_era_ginie').addClass('btn-primary');
		}else if(self._edit_type == EDIT_TYPE.RELEASE){
			$('#id_btn_cms_era_release').addClass('btn-primary');
		}
	};

	//-------------------------------------------------------

	this.DISP_YearList = function(){
		var h = '';
		for(var i=0 ; i<self._year_list.length ; i++){
			var onclick = `window._era_control.OnClick_SelectYear(${i})`;
			h += `
			<div class="pointer" onClick="${onclick}">
				${self._year_list[i].year}
			</div>
			`;
		}
		$('#id_cms_era_year_list').html(h);
	};
}