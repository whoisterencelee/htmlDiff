/**
 * Based on the code by menway@gmail.com , 
 * https://code.google.com/p/google-diff-match-patch/wiki/Plaintext
 * The html tags are replaced by a unicode character , the diff is performed 
 * & then the unicode is converted back to html tags 
 */ 
function htmlDiff() {
	var _htmlHash;
	var _revHtmlHash;
	var _currentHash;
	var _is_debug = false;
	
	function pushHash(tag) {
	  if (typeof(_htmlHash[tag]) == 'undefined') {
	  	var value = eval('"\\u'+_currentHash.toString(16)+'"');
	    _htmlHash[tag] = value;
	    _revHtmlHash[value] = tag;
	    _currentHash++;
	  }
	  return _htmlHash[tag];
	}
	
	this.clearHash = function() {
	  _htmlHash = {};
	  _revHtmlHash = {};
	  _currentHash = 44032; //朝鲜文音节 Hangul Syllables
	};
	
	function html2plain(html,options) {
	  //html = html.replace(/<(S*?)[^>]*>.*?|<.*?\/>/g, function(tag){
	  html = html.replace(/<[^>]*>|&\w+;|[\w|']+/g, function(tag){ // (1) tag (2) escaped characters &gt; (3) words
	    //debug:
	    if (_is_debug) {
              if(options.uppercasetag)return pushHash(tag.toUpperCase().replace(/</g, '&lt;').replace(/>/g, '&gt;'));
              return pushHash(tag.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
	    } else {
              if(options.uppercasetag)return pushHash(tag.toUpperCase());
	      return pushHash(tag);
	    }
	  });
	  
	  return html;
	};
	function diff2html(diff) {
		var back='',difflength=diff.length,i=0;
		while(difflength--){
			var char=diff[i];
			var word=_revHtmlHash[char];
			if(word)back += word;
			else back += char;
			i++;
		}
		return back;
	};	
	function diff2htmlwithtag(diff, tag, datetime) {
		var back='',word='',difflength=diff.length,i=0,tagopen=true;
		while(difflength--){
			var char=diff[i];
			word=_revHtmlHash[char];
			if(word){
				if( /<[^>]+>/.test(word) ){// tag
					if(!tagopen){
						back += "</"+tag+"><wbr>";
						tagopen=true;
					};
					back += word;
					// add an inline wbr separator, bec otherwise contenteditable goes inside the tags until text node is reached, 
					// and this gives a frustrating user experience, as you can never get into normal formatting
				}else{ 
					if(tagopen){
						back += "<"+tag+" datetime='"+datetime+"'>";
						tagopen=false;
					};
					back += word;
				}
			}else{
				if(tagopen){
					back += "<"+tag+" datetime='"+datetime+"'>";
					tagopen=false;
				};
 				back += char; 
			};
			i++;
		}
		if(!tagopen) back += "</"+tag+">";
		back += "<wbr>";
		return back;
	};	
	function plain2html(plain) { return diff2html(plain); };

	var dmp = new diff_match_patch();
	this.diff = function(first,second,options){
                if(typeof options!='object')options={};
		var tagless = typeof options.tagless=='undefined' ? false : options.tagless ;
	        if(typeof options.uppercasetag=='undefined')options.uppercasetag=false;
		var datetime = typeof options.datetime=='undefined' ? (new Date).toISOString() : options.datetime ;

		var convertedFirst =  html2plain(first,options);
		var convertedSecond = html2plain(second,options);
		var diffs = dmp.diff_main(convertedFirst,convertedSecond);
		dmp.diff_cleanupSemantic(diffs);

		var modified = '',diffslength=diffs.length,i=0;
		while(diffslength--){
			var diff = diffs[i];
			if ( diff[0]==0 || tagless ) modified += diff2html(diff[1]);
			else if( diff[0]==1 ) modified += diff2htmlwithtag(diff[1],'ins',datetime);// insert
			else modified += diff2htmlwithtag(diff[1],'del',datetime);// delete
			i++;
		}
		return modified;
	};
}
