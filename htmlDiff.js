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
	  html = html.replace(/<(S*?)[^>]*>.*?|<.*?\/>/g, function(tag){
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
	}
	function plain2html(plain) {
		var back='';
		for (i=0;i<plain.length;i++){
			if(_revHtmlHash[plain[i]]){
				back += _revHtmlHash[plain[i]];
			}
			else{
				back += plain[i];
			}
		}
		return back;
	};	
	/*
	function plain2html(plain) {
	  for(var tag in _htmlHash){
	    plain = plain.replace(RegExp(_htmlHash[tag], 'g'), tag);
	  }
	  return plain;
	}*/
	var dmp = new diff_match_patch();
	this.diff = function(first,second,options){
                if(typeof options!='object')options={};
		if(typeof options.tagless!='undefined')options.tagless=false;
	        if(typeof options.uppercasetag!='undefined')options.uppercasetag=false;
		var convertedFirst =  html2plain(first,options);
		var convertedSecond = html2plain(second,options);
		var diffs = dmp.diff_main(convertedFirst,convertedSecond);
		dmp.diff_cleanupSemantic(diffs);
		var modified = '';
		for (i=0;i<diffs.length;i++){
			var diff = diffs[i];
			if (diff[0]==0){
				modified += diff[1];
			}
			else if(options.tagless)modified += diff[1]; 
			else if (diff[0]==1){
				modified += '<ins>'+diff[1]+'</ins>';
			}
			else {
				modified += '<del>'+diff[1]+'</del>';
			}
		}
		var complete = plain2html(modified);
		return complete;
	};
}
