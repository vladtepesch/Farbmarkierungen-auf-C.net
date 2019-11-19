// ==UserScript==
// @name           Farbmarkierungen auf µC.net
// @author         Krapao (2012)
// @author         vlad_tepesch (2019) 
// @namespace      http://www.mikrocontroller.net
// @description    add some color coding to posts from self, thread opener and old posts on uC.net
// @include        http://www.mikrocontroller.net/*
// @include        https://www.mikrocontroller.net/*
// @include        http://embdev.net/*
// @include        https://embdev.net/*
// @version        9
// ==/UserScript==
//
// changelog:
//       v4: by Krapo
//           tidied up release 
//       v5: by vlad_tepesch
//           added some includes to also work on https and english version of site
//       v6: by vlad_tepesch
//           changed coloring by age to use different shades for older or younger posts
//           changed age colorting to color post info field instead of complete background
//           inserted variable for different colors into param section
//           changed some colors
//       v7: by vlad_tepesch
//           optimizations
//           using topic ID to detect thread opener -> solves issue with wrong coloring on multi-page-threads
//           individual colors for USERNAME_HIGHLIGHT
//       v8: by vlad_tepesch
//           fix the width of the colored headers after µC.net style update around 2019-11-18
//       v9: by vlad_tepesch
//           added snippet to shwo own user id
//
// --------------------------------------------
// --------- Individuelle Anpassungen ---------
// --------------------------------------------


// own user name or id
// if ID is known (determine it from a own posts attribute (<div class="post..." data-user-id="18486"))
// this saves the effort of doing string comparisons
var USERNAME_EIGENER = 'Vlad T.';
var USERID_EIGENER = 18486; //< set to 0 if unknown
var USERNAME_ZITAT = /vlad/gi;

// Matches for Vips are done with regular expressions
// but also user ids can be entered directly.
// this saves the effort of doing string comparisons
// d.h. an Quotes mit \ denken z.B. bei . und ()
// \s+ = mindestens ein Whitespace (Leerzeichen, Newline)
var USERNAME_HIGHLIGHT = [ 
  new VIP( 1, '#FF0000'), // andreas Schwarz
  new VIP( /\)\s+\(Moderator\)/, '#FF7700')
];

// normal subject color: #FA0 
var ownColor          = '#0000FF'; // blau
var threadOpenerColor = '#00A000'; // mittelhelles grün
var specialUserColor  = '#FF0000'; // 

var Months = (30 * 24 * 60 * 60 * 1000); // ca. 1 Monat


var ZOMBIE_DATUM          =  0.2 * Months;  // ab diesem Alter beginnt das Einfärben nach Alter
var ZOMBIE_VERY_OLD_DATUM = 18   * Months;  // Beiträgen älter als dies bekommen die dunkelste Färbung
var zombieIntensityYoung =  0xf0; // standard post: f0  // Startfarbton für Einfärbung nach Alter
var zombieIntensityOld   =  0x80; // dunkelster Farbton, der benutzt wird.

// ---------------------------------
// --------- Funktionsteil ---------
// ---------------------------------
if(/\/user\/edit$/.test(window.location)){
  var userid  = document.querySelector("#new_user_id").value;
  if(userid){
    var table   = document.querySelector("#form_new_user_email").closest('table');
    if(table){
      var row = table.insertRow(2);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = "<strong>User ID</strong>";
      cell2.innerHTML =  userid;
    }
  }
}
if(! /\/topic\//.test(window.location)){
  return;
  
}


var today = new Date();
var subjects = document.evaluate("//div[@class='subject']", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
var authornames = document.evaluate("//span[@class='name']", subjects.snapshotItem(0).parentNode, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
var openerId =  document.evaluate("//div[@class='topic ']/@data-user-id", document.body, null, XPathResult.STRING_TYPE, null).stringValue;
var dstart = new Date();

addGlobalStyle(' div.info { margin: 0px 0px 0px 0px; padding:5px 5px 5px 5px;}');
//addGlobalStyle(' div.author {visibility:collapse;} div.author * {visibility:visible;} ');




//alert( " " + openerId);
// color thread opener
if(openerId!=""){
  addGlobalStyle(".post-userid-"+openerId+" .subject { background: linear-gradient(to left, #FFA500, "+threadOpenerColor+");}");
}else{
  var guestOpenerName = document.evaluate("@data-guest-name", subjects.snapshotItem(0).parentNode, null, XPathResult.STRING_TYPE, null).stringValue;
  if(guestOpenerName != ""){ // happens on multipage with guest opener
    addGlobalStyle('.post[data-guest-name="'+guestOpenerName+'"] .subject { background: linear-gradient(to left, #FFA500, '+threadOpenerColor+');}');
  }
}

// set style rules for all vips that are defined by id instead of expression
for (var j = 0; j < USERNAME_HIGHLIGHT.length; j++) {
  if( isNumber(USERNAME_HIGHLIGHT[j].expr)){ // test for id
    addGlobalStyle(".post-userid-"+USERNAME_HIGHLIGHT[j].expr+" .subject { background: linear-gradient(to left, #FFA500, "+USERNAME_HIGHLIGHT[j].col+");}");
    USERNAME_HIGHLIGHT.splice(j, 1); 
    --j;
  }
}

// set css rule if own id is known
if(USERID_EIGENER!=0){
  addGlobalStyle(".post-userid-"+USERID_EIGENER+" .subject { background: linear-gradient(to right, #FFA500, "+ownColor+')');
}

var d1 = new Date();
var d2 = new Date();
var d3 = new Date();
var d4 = new Date();

for (var i = subjects.snapshotLength - 1; i >= 0; i--) {
  var subject = subjects.snapshotItem(i);
  var beitrag = subject.parentNode;
  var shortauthorname = authornames.snapshotItem(i).textContent;
  
  //Beiträge einiger User hervorheben
  for (var j = 0; j < USERNAME_HIGHLIGHT.length; j++) {
    if ( USERNAME_HIGHLIGHT[j].expr.test(shortauthorname) ) {
      subject.style.background = 'linear-gradient(to left, #FFA500, '+USERNAME_HIGHLIGHT[j].col +')'; 
      break;
    }
  }
  
  // Beiträge markieren, in denen auf USERNAME_ZITAT Bezug genommen wird
  var texts = document.evaluate("//div[@class='text gainlayout']", beitrag, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  if ( USERNAME_ZITAT.test(texts.snapshotItem(i).textContent) ) {
    subject.style.background = 'linear-gradient(to left, #FFA500, '+ownColor+')'; // orange => magenta
  }  
  
  // Beiträge älter als ... kennzeichnen
  var past = new Date();
  var dateAttrib = beitrag.getAttribute('data-updated-at');
  if (dateAttrib) {
    past.setTime(dateAttrib);
    var age = today-past;

    if ( age > ZOMBIE_VERY_OLD_DATUM ){
      age = ZOMBIE_VERY_OLD_DATUM;
    }
    if ( age > ZOMBIE_DATUM ) { 
      var scaledAge = (age - ZOMBIE_DATUM)/(ZOMBIE_VERY_OLD_DATUM-ZOMBIE_DATUM);
      var val =   scaledAge
                * (zombieIntensityOld-zombieIntensityYoung)
                + zombieIntensityYoung;
      val = Math.round(val);
      var info = beitrag.getElementsByClassName("info")[0];
      info.style.backgroundColor = "rgb("+val+","+val+","+val+")";
    }
  }
  // Eigene Beiträge besonders markieren 
  if( USERID_EIGENER != 0){
    if ( shortauthorname.indexOf(USERNAME_EIGENER) > 0 ) {
      subject.style.background = 'linear-gradient(to right, #FFA500, '+ownColor+')';
    }
  }
}
var d5 = new Date();
//alert("collect:" + (dstart - today)+" col opener: " +(d1-dstart)+" col vip: " + (d2-d1)+" col me:" + (d3-d2)+" col cit:" + (d4-d3)+" col age:" + (d5-d4)+"\n"+ (d5-dstart) );
 

 
function VIP(i_expr, i_col){
  this.expr  = i_expr;
  this.col   = i_col;
};

function isNumber(o) {
    return typeof o === 'number' && isFinite(o);
};


function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css.replace(/;/g, ' !important;');
    head.appendChild(style);
}