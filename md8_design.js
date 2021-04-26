var img = new Array();
var blank = "transparent.gif";
function addPngImage(element) { doPNG(element); }
function doPNG(e) { e.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + e.src + "')"; e.src=blank; }
function SetPageHeight(sHeight) { document.getElementById("mainframe").style.height = sHeight; document.body.style.height = '100%'; }
function SetPageTitle(sTitle) { document.title = sTitle; }
