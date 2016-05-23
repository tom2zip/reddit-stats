const makeTimer = function() {
	let timerObj = {};

	return {
		start: function() {
			timerObj = setInterval(function() {
				seconds++;
			}, 1000);
		},

	 	reset: function() {
			clearInterval(timerObj);
			seconds = 0;
			this.start();
		}
	}
};

let currUrl = '';
let stats = [];
let timer = {};
let seconds = 0;

function getCurrentTabUrl(callback) {
	const queryInfo = {
		active: true,
		//currentWindow: true
	};
	chrome.tabs.query(queryInfo, function(tabs) {
		// tabs[0] will always be the current tab on current window
		const tab = tabs[0];
		const url = tab.url;
		console.assert(typeof url == 'string', 'tab.url should be a string');
		callback(url);
	});
}

// cuts off the http(s):// part from the url
function parseUrl(url) {
	const httpPart = url.substr(0, 5);
	
	// starts with http
	if (httpPart.indexOf('s') === -1) {
		return url.substr(7).split('/')[0];
	} 

	// starts with https
	return url.substr(8).split('/')[0];
}

function updateStats(url, seconds) {
	if (!stats[url]) {
		stats[url] = seconds;	
	} else {
		stats[url] += seconds;
	}
}

// reset timer on tab change
chrome.tabs.onActivated.addListener(function(info) {
	getCurrentTabUrl(function(url) {
		const parsedUrl = parseUrl(url);
		console.log(currUrl, parsedUrl);
		if (!currUrl || currUrl !== parsedUrl) {
			updateStats(currUrl, seconds);
			currUrl = parsedUrl;
			timer.reset();
			console.log(stats);
		}
	});
});

// start timer in the beginning
document.addEventListener('DOMContentLoaded', function() {
	timer = makeTimer();
	getCurrentTabUrl(function(url) {
		currUrl = parseUrl(url);
	});
	timer.start();
});
