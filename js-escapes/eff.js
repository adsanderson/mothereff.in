(function(window, document, evil) {

	var pre = document.getElementsByTagName('pre')[0],
	    code = document.getElementsByTagName('code')[0],
	    textarea = document.getElementsByTagName('textarea')[0],
	    inputs = document.getElementsByTagName('input'),
	    checkboxOnlyASCII = inputs[0],
	    checkboxStringBody = inputs[1],
	    permalink = document.getElementById('permalink'),
	    // http://mathiasbynens.be/notes/localstorage-pattern
	    storage = (function() {
	    	var uid = new Date,
	    	    storage,
	    	    result;
	    	try {
	    		(storage = window.localStorage).setItem(uid, uid);
	    		result = storage.getItem(uid) == uid;
	    		storage.removeItem(uid);
	    		return result && storage;
	    	} catch(e) {}
	    }()),
	    cache = {
	    	'\n': '\\n',
	    	'\"': '\\\"',
	    	'\u2028': '\\u2028',
	    	'\u2029': '\\u2029',
	    	'\'': '\\\''
	    };

	function encode(string) {
		// URL-encode some more characters to avoid issues when using permalink URLs in Markdown
		return encodeURIComponent(string).replace(/['()_*]/g, function(character) {
			return '%' + character.charCodeAt().toString(16);
		});
	}

	function text(el, str) {
		if (str == null) {
			return el.innerText || el.textContent;
		}
		el.innerText != null && (el.innerText = str);
		el.textContent != null && (el.textContent = str);
	}

	function update() {
		var value = textarea.value.replace(/\\\n/g, ''); // LineContinuation
		var result;
		try {
			if (checkboxStringBody.checked) {
				result = evil(
					'"'
					+ value.replace(/[\n\u2028\u2029"']/g, function(chr) {
						return cache[chr];
					})
					.replace(/\\v/g, '\x0B') // In IE < 9, '\v' == 'v'; this normalizes the input
					+ '"'
				);
			} else {
				result = value;
			}
			result = stringEscape(result, {
				'quotes': 'single',
				'wrap': true,
				'escapeEverything': !checkboxOnlyASCII.checked
			});
			text(
				code,
				result
			);
			pre.className = '';
		} catch (e) {
			pre.className = 'fail';
		}
		if (storage) {
			storage.jsEscapeText = value;
			if (checkboxOnlyASCII.checked) {
				storage.jsEscapeOnlyASCII = true;
			} else {
				storage.removeItem('jsEscapeOnlyASCII');
			}
			if (checkboxStringBody.checked) {
				storage.jsEscapeStringBody = true;
			} else {
				storage.removeItem('jsEscapeStringBody');
			}
		}
		permalink.hash = +checkboxOnlyASCII.checked + encode(textarea.value);
	}

	// http://mathiasbynens.be/notes/oninput
	textarea.onkeyup = checkboxOnlyASCII.onchange = checkboxStringBody.onchange = update;
	textarea.oninput = function() {
		textarea.onkeyup = null;
		update();
	};


	if (storage) {
		storage.jsEscapeText && (textarea.value = storage.jsEscapeText);
		storage.jsEscapeOnlyASCII && (checkboxOnlyASCII.checked = true);
		storage.jsEscapeStringBody && (checkboxStringBody.checked = true);
		update();
	}

	window.onhashchange = function() {
		var hash = location.hash;
		hash.charAt(1) == '0' && (checkboxOnlyASCII.checked = false);
		textarea.value = decodeURIComponent(hash.slice(2));
		update();
	};

	if (location.hash) {
		window.onhashchange();
	}

}(this, document, eval));

// Google Analytics
window._gaq = [['_setAccount', 'UA-6065217-60'], ['_trackPageview']];
(function(d, t) {
	var g = d.createElement(t),
	    s = d.getElementsByTagName(t)[0];
	g.src = '//www.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g, s);
}(document, 'script'));
