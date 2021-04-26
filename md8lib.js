/******************************************************************************
* File: md8lib.js                                                             *
*                                                                             *
* Copyright MatchWare A/S                                                     *
* Author: Jens Ø. Nielsen                                                     *
******************************************************************************/
 

var clickobj  = null;
var insideobj = null;
var actions   = new Array();
var terminating = false;
var initialized = false;
var animatingobjs = new Array();
var nextanimation = 0;
var bIsIE4Final = false;
var currentHttpReq = null

var LocalVar = new Array();
var localvarcount = 0;

var m_bIsTop = false;

// Scorm vars

function PageUnloading()
{
	UninitSCORM();
}

function IsIE() {
      var userAgent = navigator.userAgent.toLowerCase();
      if (document.all && userAgent.indexOf('msie')!=-1) {
         return true;
      }
      else {
         return false;
      }
}
function FrameMe() 
{
	var url = document.location.href;
	var page = "index.html#" + url.substring(url.lastIndexOf("\/")+1, 100);
	document.location.href = page;
}

function AddMPlayer(divId, src, autoplay, uimode, width, height, playcount)
{
    var obj = document.getElementById(divId);
    var html = "";
    if (!obj) return;

    html = '<object width="' + width + '" height="' + height + '" ';
    html += (IsIE()) ? 'classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6" ' : 'type="application/x-ms-wmp" ';
    html += 'data="' + src + '">';
    html += '<param name="uiMode" value="' + uimode + '"/>'
    html += '<param name="autostart" value="' + autoplay + '"/>'
    html += '<param name="PlayCount" value="' + playcount + '"/>'
    html += '<param name="stretchToFit" value="true"/>'
    html += '<param name="URL" value="' + src + '"/>';
    html += '</object>'

    obj.innerHTML = html;
}

function InitPage(sHeight) 
{
	if (parent.location.href == window.location.href) {
		FrameMe();
	} else {
		parent.SetPageHeight(sHeight);
		parent.SetPageTitle(document.title);
		LoadActions();
		OnPageReady();
	}
}


//*****************************************************************************
//** Variable Handling
//*****************************************************************************

function Var(name, value) {
 this.name = name;
 this.value = value;
}

function GetSystemVar(sVarName)
{
	if (sVarName == "@cursorxpos") {
		return (window.event.x+document.body.scrollLeft)
	}
	if (sVarName == "@cursorypos") {
		return (window.event.y+document.body.scrollTop)
	}
	if (sVarName == "@date") {
		var dNow = new Date();
		return dNow.toDateString();
	}
	if (sVarName == "@dateday") {
		var dNow = new Date();
		return dNow.getDate();
	}
	if (sVarName == "@datemonth") {
		var dNow = new Date();
		return dNow.getMonth();
	}
	if (sVarName == "@dateyear") {
		var dNow = new Date();
		return dNow.getFullYear();
	}
	if (sVarName == "@screenxsize") {
		return window.screen.width;
	}
	if (sVarName == "@screenysize") {
		return window.screen.height;
	}
	if (sVarName == "@time") {
		var dNow = new Date();
		return dNow.toTimeString();
	}
	if (sVarName == "@timehour") {
		var dNow = new Date();
		return dNow.getHours();
	}
	if (sVarName == "@timemin") {
		var dNow = new Date();
		return dNow.getMinutes();
	}
	if (sVarName == "@timesec") {
		var dNow = new Date();
		return dNow.getSeconds();
	}

	// @WindowsDir
	// @DesktopDir
	// @DocDir
	// @WindowsDir
	// @SystemDir
	// @TempDir
	// @Timer
	// @ProgramDir
	// @CPU
	// @Key
	// @OS
	// @PageCount
	// @PageName
	// @PageNum
	// @PageRange
	// @ColorBits
	// @Colors
	
    
	
	alert(sVarName + " is not supported");
    throw("err");
	return null
}

function GetVar(sVarName)
{
   if (sVarName.indexOf("global") >= 0) {
        if (parent.GetVar && parent != this) {
            return parent.GetVar(sVarName);
        }
    }    
	if (sVarName.charAt(0) == "@") {
		return GetSystemVar(sVarName);
	}
	

	// Check for local var
	var nIndex = GetVarIndex(sVarName);
	if (nIndex != null)
		return LocalVar[nIndex].value;
	
	alert("GetVar Error : variable " + sVarName + " is not defined");
	return null;
}

function GetVarIndex(sVarName)
{
    if (sVarName.indexOf("global") >= 0) {
        if (parent.GetVarIndex && parent != this) {
            return parent.GetVarIndex(sVarName);
        }
    }    
	for (var n=0; n<localvarcount; n++) {
    	if (LocalVar[n].name == sVarName)
			return n;
	}
	return null;
}

function GetArVar(sVarName, sVarIndex)
{
    if (sVarName.indexOf("global") >= 0) {
        if (parent.GetArVar && parent != this) {
            return parent.GetArVar(sVarName, sVarIndex);
        }
    }    
	var nIndex = GetVarIndex(sVarName);
	if (nIndex != null) {
	    if (!isArray(LocalVar[nIndex].value)) {
	        return null;
	    }
	    
	    var index = eval(sVarIndex);
	    return LocalVar[nIndex].value[index];
	}
	alert("error : variable " + sVarName + " is not defined");
	return null;
}

function RemoveArIndex(sVarName, sVarIndex)
{
    if (sVarName.indexOf("global") >= 0) {
        if (parent.RemoveArIndex && parent != this) {
            return parent.RemoveArIndex(sVarName, sVarIndex);
        }
    }    
	var nIndex = GetVarIndex(sVarName);
	if (nIndex != null) {
	    if (!isArray(LocalVar[nIndex].value)) {
	        return null;
	    }
	    var index = eval(sVarIndex);
	    
	    var tmparray = new Array();
	    for (x in LocalVar[nIndex].value) {
            if (x != index)
                tmparray[x] = LocalVar[nIndex].value[x];
	    }
	    LocalVar[nIndex].value = tmparray;
	    return;
    }
	alert("error : variable " + sVarName + " is not defined");
	return null;
}

function isArray(obj) {
    if (!obj)
        return false;
    if (!obj.constructor)
        return false;
    if (obj.constructor.toString().indexOf("Array") == -1)
        return false;
    else
        return true;
}

function SetArVal(sVarName, sVarIndex, sVarValue)
{
    if (sVarName.indexOf("global") >= 0) {
        if (parent.SetArVal && parent != this) {
            return parent.SetArVal(sVarName, sVarIndex, sVarValue);
        }
    }    
	var nIndex = GetVarIndex(sVarName);
	if (nIndex != null) {
	    if (!isArray(LocalVar[nIndex].value)) {
	        LocalVar[nIndex].value = new Array();
	    }
	    var index = eval(sVarIndex);
	    LocalVar[nIndex].value[index] = sVarValue
	    return;
    }
	alert("error : variable " + sVarName + " is not defined");
	return;
   
}

function AssignVar(sVarName, nVarValue)
{
    if (sVarName.indexOf("global") >= 0) {
        if (parent.AssignVar && parent != this) {
            parent.AssignVar(sVarName, nVarValue);
            return;
        }
    }    
    var nIndex = GetVarIndex(sVarName);
    if (nIndex != null) {
        LocalVar[nIndex].value = nVarValue;
        return;
    }
	LocalVar[localvarcount] = new Var(sVarName, nVarValue);
	localvarcount++;
}

function SetVar(sVarName, nVarValue)
{
    if (sVarName.indexOf("global") >= 0) {
        if (parent.SetVar && parent != this) {
            parent.SetVar(sVarName, nVarValue);
            return;
        }
    }    

	// Check for local var
	var nIndex = GetVarIndex(sVarName);
	if (nIndex != null) {
		var oldval = LocalVar[nIndex].value;
		if ( typeof( oldval) == "number")
			LocalVar[nIndex].value = parseFloat( nVarValue);
		else if ( typeof( oldval) == "string")
			LocalVar[nIndex].value = String( nVarValue);
		else		
			LocalVar[nIndex].value = nVarValue;
		return;
	}


	alert("SetVar Error: variable not defined " + sVarName);
	
}

function HttpRequestAction(sUrl, sData, sVerb, sResponseVar, sStatusCodeVar, sStatusTextVar, sOkActionNames, sErrorActionNames)
{
	this.Start = HttpRequestAction_Start;
	this.sUrl = sUrl;
	this.sData = sData;
	this.sVerb = sVerb;
	this.sResponseVar = sResponseVar;
	this.sStatusCodeVar = sStatusCodeVar;
	this.sStatusTextVar = sStatusTextVar;
	this.sOkActionNames = sOkActionNames;
	this.sErrorActionNames = sErrorActionNames;
}

function HttpRequestAction_Start()
{
    if (top.location.protocol == "file:") {
        alert("HttpRequest cannot be done locally.\nYou need to upload your project.");
        return;
    }
    if (currentHttpReq) {
        alert("Only one request at a time.");
        return;
    }
    currentHttpReq = GetNewHttpRequestObject();
    if (!currentHttpReq)
        return;
    
    currentHttpReq.onreadystatechange = processHttpRequest;
    currentHttpReq.object = this;
    
    var url = eval(this.sUrl);
	if (url.indexOf("http://") == -1)
	    url = "http://" + url;

    if (this.sVerb == "GET") {
        var data = eval(this.sData);
        url += "?" + data;
    	currentHttpReq.open("GET", url, true);
    	currentHttpReq.send(null);
    } else if (this.sVerb == "POST") {
        var data = eval(this.sData);
	    currentHttpReq.open("POST", url, true);
	    currentHttpReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    currentHttpReq.setRequestHeader("Content-length", data.length);
	    currentHttpReq.setRequestHeader("Connection", "close");
	    currentHttpReq.send(data);
    } else {
        return;
    }
}

function processHttpRequest(obj)
{
    var obj = currentHttpReq.object;
    if (!obj) {
        currentHttpReq = null;
        return;
    }
	if (currentHttpReq.readyState == 4)	{
	
	    SetVar(obj.sStatusCodeVar, currentHttpReq.status);
		if (currentHttpReq.status == 200) {
		    SetVar(obj.sStatusTextVar, "Success");
        	SetVar(obj.sResponseVar, currentHttpReq.responseText);
            var arr = obj.sOkActionNames.split(";");
            for (n = 0; n<arr.length-1; n++) {
	            var sAction = "actions."+arr[n] + ".Start();";
	            eval(sAction);
            }
		} else {
		    SetVar(obj.sStatusTextVar, "Error");
            var arr = obj.sErrorActionNames.split(";");
            for (n = 0; n<arr.length-1; n++) {
	            var sAction = "actions."+arr[n] + ".Start();";
	            eval(sAction);
            }
		}
		currentHttpReq = null;
    }
    
}

function GetNewHttpRequestObject()
{
    if (window.XMLHttpRequest)
	    return new XMLHttpRequest();
    else if (window.ActiveXObject)
	    return new ActiveXObject("Microsoft.XMLHTTP");
	alert("Httprequest is not supported by your browser");
	return null;
}

//*****************************************************************************
//** Set/Get Property Action
//*****************************************************************************

function SetPropertyAction(sObjectName, sObjectType, sPropertyName, sPropertyValue)
{
	this.sObjectType = sObjectType;			// Objects type
	this.sObjectName = sObjectName;			// Objects name
	this.propertyname = sPropertyName;		// Property name
	this.propertyvalue = sPropertyValue;	// Propertyvalue / expression
	this.Start = SetPropertyAction_Start;	
}

function SetPropertyAction_Start()
{
    if (this.sObjectName == "")
        return;

	var sProperty = GetObjectPropertyName(this.sObjectName, this.sObjectType, this.propertyname);
	if (sProperty == null)
		return;

	if (this.sObjectType == "InputObject" && this.propertyname == "value") {

        var EnableDecimals = GetProperty(this.sObjectName+"_JSGinner", "EnableDecimals");
		if (EnableDecimals == 1) {
            var DecimalPoint = GetProperty(this.sObjectName+"_JSGinner", "DecimalPoint");
            var Decimals = GetProperty(this.sObjectName+"_JSGinner", "Decimals");
			sVal = ConvertFromStringToValue(eval(this.propertyvalue), DecimalPoint, Decimals);
			eval(sProperty + " = \"" + sVal + "\";");
			return;
		} else {
		    var nProp = parseInt(eval(this.propertyvalue));
		    eval(sProperty + " = " + nProp + ";");
		    return;
		}
	}
	if (this.sObjectType == "HtmlObject" && this.propertyname == "html") {
			eval(sProperty+"="+this.propertyvalue);
			return;
	}
	eval(sProperty + " = " + this.propertyvalue + ";");
}

function ConvertFromStringToValue(sValue, DecimalPoint, Decimals)
{
	sValue = "" + sValue;
	
	if (sValue.indexOf(DecimalPoint) > -1)
		sValue = sValue.replace(DecimalPoint, ".");

	var	n = parseFloat(sValue);
	
	if (!n) n = 0;
	
	sValue = n.toFixed(Decimals);

	if (sValue.indexOf(".") > -1)
		sValue = sValue.replace(".", DecimalPoint);
	
	return sValue;
}

function GetObjectProperty(objname, objtype, prop)
{

	var sProperty = GetObjectPropertyName(objname, objtype, prop);
	if (sProperty == null)
		return;
		
	if (objtype == "InputObject" && prop == "value") {
        var EnableDecimals = GetProperty(objname+"_JSGinner", "EnableDecimals");
		if (EnableDecimals == 1) {
            var DecimalPoint = GetProperty(objname+"_JSGinner", "DecimalPoint");
            var Decimals = GetProperty(objname+"_JSGinner", "Decimals");
            var prop = eval(sProperty);
            prop = prop.replace(DecimalPoint, ".");
            return parseFloat(prop);
			//return ConvertFromStringToValue(eval(sProperty), DecimalPoint, Decimals);
		} else {
		    return parseInt(eval(sProperty));
		}
	}
	if (objtype == "HtmlObject" && prop == "html") {
	    return eval(sProperty);
	}

	if (prop == "x" || prop == "y" || prop == "width" || prop == "height") {
		return parseInt(eval(sProperty));
	}
		
	return eval(sProperty);
}

function GetObjectPropertyName(objname, objectType, property)
{
	var sObjectProperty = null;
	if (objectType == "InputObject") {
		if (property == "text")
			sObjectProperty = "GetObject('"+objname + "_JSGinner').value";
			
		if (property == "value") {
			sObjectProperty = "GetObject('"+objname + "_JSGinner').value";
		}
			
		if (property == "x") {
			sObjectProperty = "GetObject('"+objname + "').style.left";
		}
		if (property == "y") {
			sObjectProperty = "GetObject('"+objname + "').style.top";
		}
		if (property == "width") {
			sObjectProperty = "GetObject('"+objname + "_JSGinner').style.width";
		}
		if (property == "height") {
			sObjectProperty = "GetObject('"+objname + "_JSGinner').style.height";
		}
		if (property == "backgroundcolor") {
			sObjectProperty = "GetObject('"+objname + "_JSGinner').backgroundColor";
		}
		if (property == "textcolor") {
			sObjectProperty = "GetObject('"+objname + "_JSGinner').style.color";
		}
		if (sObjectProperty == "")
			return;
		return sObjectProperty;
	}
	if (objectType == "HtmlObject") {
		if (property == "html") {
		
			sObjectProperty = "GetObject('"+objname + "').innerHTML";
			//alert(sObjectProperty);
		}
		return sObjectProperty;
    }	
	return sObjectProperty;
}

//*****************************************************************************
//** If Then Else Action
//*****************************************************************************

function IfThenElseAction(sExp, sTrueActions, sFalseActions)
{
	this.sExp = sExp;
	this.sTrueActions = sTrueActions;
	this.sFalseActions = sFalseActions;
	this.Start = IfThenElseAction_Start;
}

function IfThenElseAction_Start()
{
	if (eval(this.sExp)) {
		eval(this.sTrueActions);
	} else {
		eval(this.sFalseActions);
	}
}

//*****************************************************************************
//** BreakAction
//*****************************************************************************

function BreakAction()
{
	this.Start = BreakAction_Start;
}

function BreakAction_Start()
{
    throw("err");
}

//*****************************************************************************
//** LoopAction
//*****************************************************************************

function LoopAction(sActions)
{
	this.sActions = sActions;
	this.Start = LoopAction_Start;
}

function LoopAction_Start(no)
{
    try {
        while (1) {
	        eval(this.sActions);
        }
    } catch (er) {
        
    }
}

//*****************************************************************************
//** SubAction
//*****************************************************************************

function SubAction(sActions)
{
	this.sActions = sActions;
	this.Start = SubAction_Start;
}

function SubAction_Start(no)
{
    eval(this.sActions);
}


//*****************************************************************************
//** Assign Action
//*****************************************************************************

function AssignAction(sVar, sValue)
{
	this.m_sVar = sVar;
	this.m_sValue = sValue;
	this.Start = AssignAction_Start;
}

function AssignAction_Start()
{
	SetVar(this.m_sVar, eval(this.m_sValue))
}


function AssignArAction(sVar, sIndex, sValue)
{
	this.m_sVar = sVar;
	this.m_sValue = sValue;
	this.m_sIndex = sIndex;
	this.Start = AssignArAction_Start;
}

function AssignArAction_Start()
{
	SetArVal(this.m_sVar, eval(this.m_sIndex), eval(this.m_sValue))
}

function RemoveArIndexAction(sVar, sIndex)
{
    this.Start = RemoveArIndexAction_Start;
    this.m_sVar = sVar;
    this.m_sIndex = sIndex;
}

function RemoveArIndexAction_Start()
{
    RemoveArIndex(this.m_sVar, this.m_sIndex);
}

//*****************************************************************************
//** Page Action
//*****************************************************************************

function PageAction( pagename) {

 this.m_PageName = pagename;
 this.Start = PageAction_Start;
}

function PageAction_Start() 
{
    if (this.m_PageName == "@prepage") {
        history.back()
        return;
    }
	parent.loadPage(this.m_PageName);
}

//------------------------------------

var ANIM_TICK = 1;

var ANIM_STYLE_NORMAL   = 0;
var ANIM_STYLE_FIRSTPOS = 1;
var ANIM_STYLE_FLYTO    = 2;
var ANIM_STYLE_FLYFROM  = 3;

//------------------------------------


//------------------------------------

function bsearch(myarray, val) {

  var lo=0;
  var hi=myarray.length;

  while(true) {
    var mid=Math.floor((hi+lo)/2);
    if(mid==0)
      return mid;
    if(mid==myarray.length-1)
      return mid-1;
    else if((myarray[mid]<=val && myarray[mid+1]>val))
      return mid;               
    else if(val<myarray[mid])
      hi=mid;
    else
      lo=mid;
  }
  return 0;
}


/******************************************************************************
* Class AnimationPath                                                         *
******************************************************************************/

function AnimationPath(xpoints_array, ypoints_array) {

  this.m_xpoints_array=xpoints_array;
  this.m_ypoints_array=ypoints_array;
  this.m_sqdists=new Array(xpoints_array.length);
  this.m_sqdistsum=0;

  this.GetPointAtTime=AnimationPath_GetPointAtTime;

  /*********************/ 
  var x=xpoints_array[0];
  var y=ypoints_array[0];

  for(i=0; i<this.m_sqdists.length; i++) {
    var dx = this.m_xpoints_array[i]-x;
    var dy = this.m_ypoints_array[i]-y;
    this.m_sqdistsum += Math.sqrt(dx*dx+dy*dy);
	this.m_sqdists[i] = this.m_sqdistsum;

    x=xpoints_array[i];
    y=ypoints_array[i];
  }

}

function AnimationPath_GetPointAtTime(t) {

  if(t>=1) {
    var endx=this.m_xpoints_array[this.m_xpoints_array.length-1];
    var endy=this.m_ypoints_array[this.m_ypoints_array.length-1];
    return new Array(endx, endy);
  }
  
  var pos = t*this.m_sqdistsum;
  var idx = bsearch(this.m_sqdists, pos);
  
  var dx  = this.m_xpoints_array[idx+1] - this.m_xpoints_array[idx];
  var dy  = this.m_ypoints_array[idx+1] - this.m_ypoints_array[idx];
   

  var dv  = pos - this.m_sqdists[idx];     /* distance we went too far */
  var lenseg = this.m_sqdists[idx+1]-this.m_sqdists[idx];

  dx*=(dv/lenseg);
  dy*=(dv/lenseg);
  
  xpos=this.m_xpoints_array[idx]+dx;
  ypos=this.m_ypoints_array[idx]+dy;



  return new Array(xpos, ypos);
}


/******************************************************************************
* Class AnimationAction                                                       *
******************************************************************************/

function AnimationAction( myname,obj,path,totaltime,repeat,reverse,autoshow,style) {

  this.m_name=myname;
  this.m_object= FindObject( obj);
  this.m_path=path;
  this.m_totaltime=totaltime;
  this.m_time=0;
  this.m_paused=false;
  this.m_startdate=null;
  this.m_repeat=repeat;
  this.m_reverse=reverse;
  this.m_style=style;
  this.m_autoshow = autoshow;
  this.m_doshow = this.m_autoshow;
  this.m_timerid = 0;
  
  this.Start = AnimationAction_Start;
  this.Stop  = AnimationAction_Stop;
  this.Pause = AnimationAction_Pause;
  this.Tick  = AnimationAction_Tick;
}

function FindAnimation( objname) {

 for ( var i = 0; i < nextanimation;i++) {
   if ( animatingobjs[ i].m_object == objname)
     return i;
 }
 return -1;
}

function RemoveAnimation( objname) {

 var i = FindAnimation( objname);
 if ( i >= 0) {
   animatingobjs[ i] = null;
   nextanimation--;
   for ( ; i < nextanimation; i++)
     animatingobjs[ i] = animatingobjs[ i+1];
 }
}


function AnimationAction_Start() 
{ 
    var i = FindAnimation( this.m_object);
    if ( i >= 0) {
        animatingobjs[ i].Stop();
    } else {
        animatingobjs[ nextanimation++] = this;
    }

    if ( IsObjVisible( this.m_object))
        this.m_doshow = false;
    else
        this.m_doshow = this.m_autoshow;
        

    var obj_x = GetObjLeft( this.m_object) + GetObjWidth( this.m_object) / 2;
    var obj_y = GetObjTop( this.m_object) + GetObjHeight( this.m_object) / 2;

    this.m_time=0;
    this.m_startdate=new Date();
    var endidx=this.m_path.m_xpoints_array.length-1;
    if ( this.m_style == ANIM_STYLE_NORMAL) {
        this.m_offset_x=0;
        this.m_offset_y=0;
    } else if ( this.m_style == ANIM_STYLE_FLYTO) {
        var endpoint = this.m_reverse ? 0 : endidx;
        this.m_offset_x = obj_x - this.m_path.m_xpoints_array[endpoint];
        this.m_offset_y = obj_y - this.m_path.m_ypoints_array[endpoint];
    } else if ( this.m_style == ANIM_STYLE_FLYFROM) {
        var startpoint = this.m_reverse ? endidx : 0;
        this.m_offset_x = obj_x - this.m_path.m_xpoints_array[ startpoint];
        this.m_offset_y = obj_y - this.m_path.m_ypoints_array[ startpoint];
    } else if ( this.m_style == ANIM_STYLE_FIRSTPOS) {
        this.m_seg0_x = obj_x;
        this.m_seg0_y = obj_y;
        startpoint = this.m_reverse ? endidx : 0;
        this.m_seg0_dx = this.m_path.m_xpoints_array[ startpoint]-this.m_seg0_x;
        this.m_seg0_dy = this.m_path.m_ypoints_array[ startpoint]-this.m_seg0_y;
        this.m_seg0_len=Math.sqrt(this.m_seg0_dx*this.m_seg0_dx + this.m_seg0_dy*this.m_seg0_dy);
        this.m_seg0_endtime= this.m_seg0_len / (this.m_seg0_len+this.m_path.m_sqdistsum);
    }
    this.m_timerid = window.setTimeout( "actions." + this.m_name + ".Tick()", ANIM_TICK);
}


function AnimationAction_Tick() 
{

 if ( this.terminating) {
    this.terminating = false;
    return;
 }
 this.m_timerid = 0;
 if(this.m_startdate!=null) {
   var datenow=new Date();
   var msnow=this.m_time + (datenow-this.m_startdate);
   
   
   var t=msnow/this.m_totaltime;



   if ( t > 1) t = 1;
   if ( this.m_style != ANIM_STYLE_FIRSTPOS) {
     if(this.m_reverse)
       t=1-t;



     point = this.m_path.GetPointAtTime(t);
     
     var x = point[0] + this.m_offset_x - GetObjWidth( this.m_object) / 2;
     var y = point[1] + this.m_offset_y - GetObjHeight( this.m_object) / 2;
     SetObjPosition( this.m_object,x,y);
   }
   else { 
   

     // firstpos hack
     if(t < this.m_seg0_endtime) {
       var tt= t*(1/this.m_seg0_endtime);
       var x = this.m_seg0_x+tt*this.m_seg0_dx - GetObjWidth( this.m_object) / 2;
       var y = this.m_seg0_y+tt*this.m_seg0_dy - GetObjHeight( this.m_object) / 2;
       SetObjPosition( this.m_object,x,y);
     }
     else {
       var tt=(t-this.m_seg0_endtime)*(1/(1-this.m_seg0_endtime));
       if(this.m_reverse)
         tt=1-tt;
         
       point=this.m_path.GetPointAtTime(tt);

       var x = point[ 0] - GetObjWidth( this.m_object) / 2;
       var y = point[ 1] - GetObjHeight( this.m_object) / 2;
       
          SetObjPosition( this.m_object,x,y);
     }
   }

   if(msnow<this.m_totaltime)     
     this.m_timerid = window.setTimeout( "actions." + this.m_name+".Tick()", ANIM_TICK);
   else if(this.m_repeat) {
     this.m_startdate=new Date();
     this.m_timerid = window.setTimeout( "actions." + this.m_name + ".Tick()", ANIM_TICK);
   }
   else {
     RemoveAnimation( this.m_object);
   }
 }
 if ( this.m_doshow) {
   ShowObject( this.m_object,true);
   this.m_doshow = false;
 }
 
 
 
}

function AnimationAction_Stop() {
    this.terminating = true;
    if ( this.m_timerid) {
        window.clearTimeout( this.m_timerid);
        this.m_timerid = 0;
    }
    RemoveAnimation( this.m_object);
    this.m_paused=false; 
    this.m_time=0;
    this.terminating = false;
}

function AnimationAction_Pause() {
alert("pause");
  this.m_paused=true;
  d= new Date();
  this.m_time+=d-this.m_startdate;
  this.m_startdate=null;
}

//------------------------------------

function TimeLineAction( myname, actionarray,delayarray) {

 this.m_Name       = myname;
 this.m_ActionList = actionarray;
 this.m_DelayList  = delayarray;
 this.m_Current    = 0;
 this.m_TimerId    = 0;

 this.Start = TimeLineAction_Start;
 this.Tick  = TimeLineAction_Tick;
}


function TimeLineAction_Start() {

 if ( this.m_ActionList.length == 0) return;
 if ( this.m_TimerId) 
   clearTimeout( this.m_TimerId);
 this.m_Current = 0;
 this.m_TimerId = window.setTimeout( "actions." + this.m_Name+".Tick()", this.m_DelayList[ 0]);
}


function TimeLineAction_Tick() {

 this.m_TimerId = 0;
 if ( terminating) return;
 var index = this.m_Current;
 this.m_ActionList[ index].Start();
 if ( this.m_Current != index) return;
 this.m_Current++;
 if ( this.m_Current >= this.m_ActionList.length) return;
 this.m_TimerId = window.setTimeout( "actions." + this.m_Name+".Tick()", this.m_DelayList[ this.m_Current]);
}


//------------------------------------

function EmailAction( to,subject,text) {
 
 this.m_To      = to;
 this.m_Subject = subject;
 this.m_Text    = text;

 this.Start = EmailAction_Start;
}

function EmailAction_Start() {
	var txt = eval(this.m_Text)
	var txt = escape(txt);
	while (txt.indexOf("%u20AC") > -1)
		txt = txt.replace("%u20AC", "%80");
	window.location.href = "mailto:" + eval(this.m_To) + "?Subject=" + eval(this.m_Subject) + "&Body=" + txt;
}

//------------------------------------

function HttpAction( url,innewwindow) {

 this.m_Url         = url;
 this.m_InNewWindow = innewwindow;

 this.Start = HttpAction_Start;
}

function HttpAction_Start() {


try {
 if ( this.m_InNewWindow) {
    window.open( eval(this.m_Url));
 } 
 else
   GetTop().location.href = eval(this.m_Url);

} catch(er) {

}
}

//------------------------------------

function StartAction( action) 
{
	this.m_Action = action;
	this.Start = StartAction_Start;
}

function StartAction_Start()
{
	eval( this.m_Action);
}

function StopAction( action) {
	this.m_Action = action;
	this.Start = StopAction_Start;
}

function StopAction_Start() 
{ 
	eval( this.m_Action);
}

function GetObjLeft( obj) {
    if (obj.style.pixelLeft)
        return obj.style.pixelLeft;
    return parseInt(obj.style.left);
}

function GetObjTop( obj) {
    if (obj.style.pixelTop)
        return obj.style.pixelTop;
    return parseInt(obj.style.top);
}

function GetObjWidth( obj) {
 if ( obj.style.pixelWidth)
   return obj.style.pixelWidth;
 else
   return obj.clientWidth;
}

function GetObjHeight( obj) {
 if ( obj.style.pixelHeight)
   return obj.style.pixelHeight;
 else
   return obj.clientHeight;
}

function SetObjPosition( obj,left,top)
{
   obj.style.left = left+"px";
   obj.style.top  = top+"px";
}

function IsObjVisible( obj) {
 return obj.style.visibility == "visible";
}

function ShowObject( obj,visible) {
 obj.style.visibility = visible ? "visible" : "hidden";
}

function FindObject( name) {
 if ( bIsIE4Final)
   return document.all( name);
 else
   return document.getElementById( name);
}

//------------------------------------

var effects = new Array();
effects.BoxIn      = 0;
effects.BoxOut     = 1;
effects.CircleIn   = 2;
effects.CircleOut  = 3;
effects.WipeUp     = 4;
effects.WipeDown   = 5;
effects.WipeRight  = 6;
effects.WipeLeft   = 7;
effects.HorzBlinds = 9;
effects.Dissolve        = 12;
effects.SplitVerticalIn = 13;
effects.Normal          = 100;
effects.Fade            = 101;

//------------------------------------

function HideAction( obj,duration,effecttype) {

 this.m_Obj        = FindObject( obj);
 this.m_Duration   = duration;
 this.m_EffectType = effecttype;

 this.Start = HideAction_Start;
}


function HideAction_Start() {

 if ( this.m_Obj.style.visibility == "hidden") return;
 if (!IsIE()) {
    this.m_Obj.style.visibility = "hidden";
    return;
 }
 switch ( this.m_EffectType) {
  case effects.Normal :
    this.m_Obj.style.visibility = "hidden";
    break;
  case effects.Fade :
    this.m_Obj.style.filter = "blendTrans(duration=" + (this.m_Duration / 1000) + ")";
    this.m_Obj.filters.blendTrans.stop();
    this.m_Obj.filters.blendTrans.apply();
    this.m_Obj.style.visibility="hidden";
    this.m_Obj.filters.blendTrans.play();
    break;
  default :
    this.m_Obj.style.filter = "revealTrans(duration==" + (this.m_Duration / 1000) + ", transition=" + this.m_EffectType + ")";
    this.m_Obj.filters.revealTrans.stop();
    this.m_Obj.filters.revealTrans.apply();
    this.m_Obj.style.visibility="hidden";
    this.m_Obj.filters.revealTrans.play();
    break;
 }
}

//------------------------------------


function ShowAction( obj,duration,effecttype) {

 this.m_Obj        = FindObject( obj);
 this.m_Duration   = duration;
 this.m_EffectType = effecttype;

 this.Start = ShowAction_Start;
}


function ShowAction_Start() {

 if ( this.m_Obj.style.visibility == "visible") return;
 
 if (!IsIE()) {
    this.m_Obj.style.visibility = "visible";
    return;
 }

 switch ( this.m_EffectType) {
  case effects.Normal :
    this.m_Obj.style.visibility = "visible";
    break;
  case effects.Fade :
    this.m_Obj.style.filter = "blendTrans(duration=" + (this.m_Duration / 1000) + ")";
    this.m_Obj.filters.blendTrans.stop();
    this.m_Obj.filters.blendTrans.apply();
    this.m_Obj.style.visibility = "visible";
    this.m_Obj.filters.blendTrans.play();
    break;
  default :
    this.m_Obj.style.filter = "revealTrans(duration==" + (this.m_Duration / 1000) + ", transition=" + this.m_EffectType + ")";
    this.m_Obj.filters.revealTrans.stop();
    this.m_Obj.filters.revealTrans.apply();
    this.m_Obj.style.visibility = "visible";
    this.m_Obj.filters.revealTrans.play();
    break;
 }
}

//------------------------------------

function SoundAction( sound,repeat,id, cancel)
{

    this.cancel = cancel;
    this.id = id;
    this.m_Sound      = sound;
    this.m_Repeat     = repeat;
    this.Start = SoundAction_Start;
    this.Stop = SoundAction_Stop;
}

function SoundAction_Stop() {
    StopAllSounds();
}

function SoundAction_Start() {
    if (this.cancel)
        this.Stop(this.id);
    PlaySound(this.id, this.m_Sound, this.m_Repeat);
}

//------------------------------------

function MsgBoxAction(sText)
{
	this.m_sText = sText;
	this.Start = MsgBoxAction_Start;
}

function MsgBoxAction_Start()
{
	alert(eval(this.m_sText));
}


function SetCursorAction( type) {

 this.m_Type = type;

 this.Start = SetCursorAction_Start;
}


function SetCursorAction_Start() {

 var aDivs = GetTags("DIV");
 if ( ! aDivs) return;

 for ( var i=0;i < aDivs.length; i++) 
   aDivs[i].style.cursor = this.m_Type;

 aDivs = GetTags("IMG");
 if ( ! aDivs) return;

 for ( var i=0;i < aDivs.length; i++) 
   aDivs[i].style.cursor = this.m_Type;

 aDivs = GetTags("INPUT");
 if ( ! aDivs) return;

 for ( var i=0;i < aDivs.length; i++) 
   aDivs[i].style.cursor = this.m_Type;
}

function GetTags(sTagType)
{
  return document.getElementsByTagName(sTagType);
}

//------------------------------------

function TextObject_GetText(textobj)
{
	return textobj.value;
}

function TextObject_PutText(textobj, text)
{
	textobj.value = text;
}

function GetTop()
{
	if (this.m_bIsTop == null) {
		return null;
	}
	if (this.m_bIsTop == true) {
		return this;
	}
	if (this == parent) {
		return this;
	} 
	return parent.GetTop();
}


function RND(nMin, nMax)
{
	return Math.floor(Math.random()*(nMax-nMin+1)) + nMin;
}

function ABS(n)
{
	return Math.abs(n);
}

function COS(n)
{
	return Math.cos(n);
}

function FLOAT(n)
{
	n = parseFloat(n);
	if (isNaN(n))
		return 0;
	return n;
}

function INT(n)
{
	n = parseInt(n);
	if (isNaN(n))
		return 0;
	return n;
}

function STRING(n)
{
	return n.toString();
}

function LEN(str)
{
	return str.length;
}

function LOWER(str)
{
	return str.toLowerCase();
}

function UPPER(str)
{
	return str.toUpperCase();
}

function NOT(n)
{
	return !n;
}

function SIN(n)
{
	return Math.sin(n);
}

function SUBPOS(str1, str2)
{
	return str1.indexOf(str2)+1;
}

function SUBSTR(str, nStart, nLength)
{
	return str.substr(nStart-1,nLength);
}

function SQR(n)
{
	return Math.sqrt(n);
}

function FORMAT(nValue, sFormat)
{
	var sValue = nValue.toString();
	if (sFormat == null)
		return sValue;
		
	nDotPos = sFormat.indexOf(".");
	
	var nZeros = 0;	// Before dot
	var n2 = 0;	// value after dot
	var s3 = "";	// letter after dot
	
	if (nDotPos == -1) {
		s3 = sFormat;
	} else {
		var s = sFormat.substring(0, nDotPos);
		if (s != "")
			nZeros = parseInt(s);
		sFormat = sFormat.slice(nDotPos+1);
		s3 = sFormat.charAt(sFormat.length-1);
		sFormat = sFormat.slice(0,-1);
		if (sFormat.length > 0)
			n2 = parseInt(sFormat);
			
			
	}
	if (s3 == "")
		s3 = "g";	// default : use "g"
		
		
	if (s3 == "g" || s3 == "G") {
		if (parseFloat(nValue) / 100000 > 1) {	// more that 6 significant digits
			s3 = "e";
		} else {
			s3 = "f";
		}
	}

//	alert(nZeros + " : " + n2 + " : " + s3);

	var sReturn = sValue;
	
	if (s3 == "e" || s3 == "E") {

		

		var n = parseFloat(sValue);
		var nFactor = 0;
		while (n > 10) {
			nFactor++;
			n = n / 10;
		}
			
		sReturn = sValue.charAt(0);
		sValue = sValue.slice(1);
				
		if (n2 > 0) {
			sReturn += ".";
		}
				
		while (n2 > 0) {
			if (sValue.length == 0) {
				sReturn += "0";
			} else {
				if (sValue.charAt(0) == ".")
					sValue = sValue.slice(1);
				sReturn += sValue.charAt(0);
				sValue = sValue.slice(1);
			}
			n2--;
		}
		
		if (nZeros != 0) {
			if (nZeros > 0) {
				while (sReturn.length < nZeros)
					sReturn = "0" + sReturn;
			} else {
				nZeros = -nZeros;
				while (sReturn.length < nZeros)
					sReturn = sReturn + "0";
		
			}
		}

		sReturn += s3;
		
		var s = nFactor.toString();
		while (s.length < 3)
			s = "0" + s;
			
		sReturn += " + " + s;
	}

	if (s3 == "f" || s3 == "F") {
		if (n2 == 0) {
			var nPos = sValue.indexOf(".");
			if (nPos > -1) {
				n2 = 6-nPos;
			}
		}
		
		var n = parseFloat(sValue)
		sReturn = n.toFixed(n2);
		
		if (nZeros != 0) {
			if (nZeros > 0) {
				while (sReturn.length < nZeros)
					sReturn = "0" + sReturn;
			} else {
				nZeros = -nZeros;
				while (sReturn.length < nZeros)
					sReturn = sReturn + "0";
		
			}
		}
	}

	return sReturn;
}

function donothing() {}

function IEPNGAlpha( img) {

	if ( ! IsIE()) return;
	img.onload = donothing;
	var dir = img.src;
	var pos = dir.lastIndexOf( "/");
	if ( pos < 0)
		pos = dir.lastIndexOf( "\\");
	dir = dir.substr( 0,pos+1);
	var imageurl = img.src;
	img.src = dir + "transparent.gif";
	img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imageurl+"',sizingMethod='scale');";
}

function RemoveFocusFromInput() {
  arr = document.getElementsByTagName("input");
  for (i = 0; i < arr.length; i++) {
    if (!arr[i].blur)
      return;
    arr[i].onfocus = function() {
      this.blur();
    }
  }
}

function GetObject(objid)
{
    return document.getElementById(objid);
}

function GetProperty(objectid, propname)
{
    var obj = document.getElementById(objectid);
    var GetVars = obj.name.split(";"); 
    for (i in GetVars) {
        var tmp = GetVars[i].split("="); 
        if (tmp.length && tmp[0] == propname) {
            if (isNaN(tmp[1]))
                return tmp[1];
            return parseInt(tmp[1]);
          } 
     } 
    return null;
}

// Sound related material
// Requires 2 div tags:
// <div id="med_sound1"></div>
// <div id="med_sound2"></div>

var sSoundObject = '<object type="application/x-mplayer2"\n';
sSoundObject    += 'id="<--ID-->" width="0" height="0"/>\n';
sSoundObject    += '<param name="src" value="<--SRC-->"/>\n';
sSoundObject += '<param name="AutoStart" value="1"/>\n';
sSoundObject += '<param name="loop" value="<--LOOP-->"/>\n';
sSoundObject += '<--FFLOOP-->';
sSoundObject    += '</object>\n';


function StopAllSounds() {
    var id = parent.document.getElementById("med_sound1");
    id.innerHTML = "";
    id = parent.document.getElementById("med_sound2");
    id.innerHTML = "";
    return 0;
}
  
function PlaySound(soundobj, filename, repeat) {
    if (filename == "" || filename == undefined)
        return;
    
    no = parent.med_next_sound_id;
    parent.med_next_sound_id++;
    if (parent.med_next_sound_id == 3)
        parent.med_next_sound_id = 1;

    var divid = "med_sound" + no;
    var thissounddiv=parent.document.getElementById(divid);

    eval("parent.med_sSound"+no+"='"+soundobj+"'");
    var s = sSoundObject.replace("<--ID-->", soundobj);
    s = s.replace("<--SRC-->", filename);
    
    s = s.replace("<--LOOP-->", (repeat)?"true":"");
    s = s.replace("<--FFLOOP-->", (repeat)?"<param name='playcount' value='true'/>\n":"");
    thissounddiv.innerHTML = s;
}

function ScormSetAction(sScormVar, sMediatorVar, bCommit, bSet)
{
	this.Start = ScormSetAction_Start;
	this.sScormVar = sScormVar;
	this.sMediatorVar = sMediatorVar;
	this.bCommit = bCommit;
	this.bSet = bSet;
}

function ScormSetAction_Start()
{
    var sScormVar = eval(this.sScormVar);
    var sScormValue = eval(this.sMediatorVar);
    
    if (!parent.g_objAPI) {
        alert("parent.g_objAPI.SetValue(\""+sScormVar+"\", \""+sScormValue+"\") call attempted,\nbut SCORM API was not found.");
        return;
    }
    
    if (this.bSet) {
        parent.g_objAPI.SetValue(sScormVar, sScormValue);
    }
    if (this.bCommit) {
        parent.g_objAPI.Commit("");
    }
}

function ScormGetAction(sScormVar, sMediatorVar, nActionType, pageName)
{
	this.Start = ScormGetAction_Start;
	this.sScormVar = sScormVar;
	this.sMediatorVar = sMediatorVar;
	this.nActionType = nActionType;
	this.pageName = pageName;
}

function ScormGetAction_Start()
{
    var sScormVar = eval(this.sScormVar);
    //var sMediatorVar = eval(this.sMediatorVar);

    if (!parent.g_objAPI) {
        alert("parent.g_objAPI.GetValue(\""+sScormVar+"\") call attempted,\nbut SCORM API was not found.");
        return;
    }
    //alert(this.sMediatorVar);
    var sVar = this.pageName + "_" + this.sMediatorVar;
    sVar = sVar.toLowerCase();
    
    //alert(sVar + " " + LocalVar[0].name);
    
    if (GetVarIndex(sVar) == null) {
    
        sVar = "global_" + this.sMediatorVar;
        if (GetVarIndex(sVar) == null) {
            alert("Error: var " + sVar + " Does not exist");
        }
    }
    
    switch (this.nActionType) {
        case 0 : { // GETVALUE
            AssignVar(sVar, parent.g_objAPI.GetValue(sScormVar));
            break;
        }
        case 1 : { // GETLASTERROR
            var nVal = parent.g_objAPI.GetLastError("");
            AssignVar(sVar, nVal);
            break;
        }
        case 2 : { // GETLASTERRORSTRING
            var nVal = parent.g_objAPI.GetLastError("");
            var sVal = parent.g_objAPI.GetErrorString(nVal);
            AssignVar(sVar, sVal);
            break;
        }
        case 3 : { // GETDIAGNOSTIC
            sVal = parent.g_objAPI.GetDiagnostic(sScormVar);
            AssignVar(sVar, sVal);
            break;
        }
    }
}


function InitSCORM() {
	var intIntervalSecs = 10;
	// This simply loops for a set period of time, waiting for the API to
	// load and/or be found.
	var timeCurrent_int = new Date().getTime();
	var timeLimit_int = new Date().getTime() + (intIntervalSecs * 1000);		
	while((g_objAPI == null) && timeCurrent_int < timeLimit_int)
	{
		g_objAPI = getAPI(0);
		if (g_objAPI) {
			g_objAPI.Initialize("");
			g_sessionStartTime = new Date().getTime();
		}
		timeCurrent_int = new Date().getTime();
	}
	if (g_objAPI == null) {
		alert("SCORM API could not be found.\nThis project is designed to run from a SCORM 1.2 compatible Learning System");
	}

}

function UninitSCORM()
{
	if (!window.getAPI)
		return;
	g_objAPI = getAPI(0);
	if (g_objAPI) {
		g_objAPI.Terminate("");
	}
}		