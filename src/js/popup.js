/**
 * 
 * HEADER functions
 * 
 * To avoid recursive fail on the declaration.
 * 
 */ 
function PopupPool(refer, name)
{
	// Properties
	this.pops = new Array;
	var _self = this;
	this.Name = name;
	this.default_zindex = 10;
	this.pops_current = new Array;


	// Members -- Full Pool
	this.PopUpExist = function () {};
	this.AddPopUp = function (child) {};
	this.ChildNumber = function (nameChild) {};

	// Members -- Current Pool
	this.PopUpCurrentExist = function (nameChild) {};
	this.ChildNumberCurrent = function (nameChild) {};
	this.AddPopUpCurrent = function (child) {};
	this.back_do = function () {};
	this.back_undo = function () {};
	// Members -- Do / Undo -- Actions -- Pool
	this.clearPopUp = function (name) {};

	// Members -- Current -- Pool
	this.remove_popup = function () {};
	this.actif_child = function (child) {};

	// Member -- Construct
	var _construct = function () {};
	this.Exec = function () {};
}

/** Class Popup
 * 
 * Manage a Popup.
 * 
 * @param refer 		string	The name of the refering div.
 * @param name			string	The name of the div that will be the popup.
 * @param url_ajax		url		The url of the popup content.
 * @param ondiv_name	string	The name of div which makes appear the popup when the clic event is triggered.
 */
function Popup(refer, name, url_ajax, ondiv_name, classname, closediv_name, last)
{
	// Properties
	this.Name = name;
	this.url_ajax = url_ajax;
	this.ondiv_name = ondiv_name;
	this.closediv_name = closediv_name;
	this.pool = null;
	this.last = typeof last !== 'undefined' ? last : false;
	this.zindex = 20;
	var _self = this;

	// Members
	// Members -- Do / Undo
	this.fct_undo = function () {
		$(('#' + _self.Name)).css("display", "none");
	};
	this.SetActif = function () {
		$(('#' + _self.Name)).css("display", "block");
	};
	this.fct_do = function () {
		_self.SetActif();
		if (_self.pool !== null)
		{
			_self.pool.actif_child(_self.Name);
		}
	}

	this.SetZindex = function () {
		$('#' + _self.Name).css("postion", "fixed");
		$('#' + _self.Name).css("zIndex", _self.zindex);	
	};

	// Member -- Construct -- Protected//Private
	var _construct = function () {
		$('#' + refer).append('<div id="' + name + '" class="' + classname +'"></div>');
		$.ajax({url: url_ajax, success: function(result){		
			$("#" + name).html(result);
			if (typeof closediv_name !== 'undefined' || closediv_name === "")
			{
				$('#' + closediv_name).click(function() {
					if (_self.pool !== null) _self.pool.back_undo();
					else _self.fct_undo();
				});
			}
		}});
		if (ondiv_name !== "") $('#' + ondiv_name).click(function() {_self.fct_do();});
	};

	this.Exec = function () {
		if (_construct !== null)
		{
			_construct();
			_construct = null;
		}
	};
}

/** Class PopupPool
 * 
 * Manage a pool of Popups.
 * 
 * @param refer 		string	The name of the refering div.
 * @param name			string	The name of the div that will be the popup.
 */
function PopupPool(refer, name)
{
	// Properties
	this.pops = new Array;
	var _self = this;
	this.Name = name;
	this.default_zindex = 10;
	this.pops_current = new Array;


	// Members -- Full Pool
	this.PopUpExist = function (nameChild) {
		var res = false;
		for (var popup in _self.pops)
		{
			if (this.pops[popup].Name === nameChild)
			{
				res = true;
				break;
			}
		}
		return (res);
	};
	this.AddPopUp = function (child) {
		if (_self.PopUpExist(child.Name) === false || _self.pops.length === 0)
		{
			child.pool = this;
			child.Exec();
			_self.pops.push(child);
		}
	};
	this.ChildNumber = function (nameChild) {
		var child =  0;
		if (_self.pops.length <= 0) return (-1);
		for (child in _self.pops) 
		{
			if (_self.pops[child].Name === nameChild)
			{
				break;
			}	
		}
		return (child);
	};

	// Members -- Current Pool
	this.PopUpCurrentExist = function (nameChild) {
		var res = false;
		for (var popup in _self.pops_current)
		{
			if (_self.pops_current[popup].Name === nameChild)
			{
				res = true;
				break;
			}
		}
		return (res);
	};
	this.ChildNumberCurrent = function (nameChild) {
		var child =  0;
		var ok = false;
		if (_self.pops_current.length <= 0) return (-1);
		for (child in _self.pops_current) 
		{
			if (_self.pops_current[child].Name === nameChild)
			{
				ok = true;
				break;
			}	
		}
		return (ok === true ? child : -1);
	};
	this.AddPopUpCurrent = function (child) {
		if (_self.PopUpCurrentExist(child.Name) === true)
			_self.clearPopUp(child.Name);
		if (_self.pops_current.length === 0)
			_self.back_do();
		if (_self.PopUpExist(child.Name) == true)
		{
			child.zindex = _self.default_zindex * 2 + _self.pops_current.length;
			child.SetZindex();
			var tmp = jQuery.extend({}, child);
			if (_self.pops_current.length > 0)
				_self.pops_current[_self.pops_current.length - 1].fct_undo();
				if (child.last === true)
				{
					var current = new Array;
					current.push(tmp);
					_self.pops_current = current.concat(_self.pops_current);
					_self.clearPopUp(child.Name);
				}
				else
				_self.pops_current.push(tmp);
		}
	};
	this.back_do = function () {
		$(('#' + _self.Name)).css("display", "block");
	};
	this.back_undo = function () {
		_self.clearPopUp();
		$(('#' + _self.Name)).css("display", "none");
	};
	// Members -- Do / Undo -- Actions -- Pool
	this.clearPopUp = function (name) {
		var id = parseInt(_self.ChildNumberCurrent(name));
		var check = _self.pops_current.length > 0 && (typeof name === 'undefined' || (id !== -1 && id !== _self.pops_current.length - 1));
		while (check)
		{	
			_self.pops_current[(_self.pops_current.length - 1)].fct_undo();
			var tmp = _self.pops_current[(_self.pops_current.length - 1)];
			_self.pops_current.pop();
			delete tmp;
			check = _self.pops_current.length > 0 && (typeof name === 'undefined' || (id !== -1 && id !== _self.pops_current.length - 1));
		}
	};


	// Members -- Current -- Pool
	this.remove_popup = function () {
		if (_self.pops_current.length > 0)
		{
			_self.pops_current[(_self.pops_current.length - 1)].fct_undo();
			var tmp = _self.pops_current[(_self.pops_current.length - 1)];
			_self.pops_current.pop();
			delete tmp;
			if (_self.pops_current.length === 0)
			{
				_self.back_undo();
			}
			else
				_self.pops_current[_self.pops_current.length - 1].SetActif();
		}
	};
	this.actif_child = function (child) {
		var nbr =_self.ChildNumber(child);
		if (nbr < 0) return;
		_self.AddPopUpCurrent(_self.pops[nbr]);
	};

	// Member -- Construct
	var _construct = function () {
		$('#' + refer).append('<div id="' + name + '" class="black_screen"></div>');
		$('#' + name).css("postion", "fixed");
		$('#' + name).css('z-index', _self.default_zindex);
		$('#' + name).bind('click', _self.remove_popup);
	};
	this.Exec = function () {
		if (_construct !== null)
		{
			_construct();
			_construct = null;
		}
	};
	this.Exec();
}