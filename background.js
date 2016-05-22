var seconds = 0;
var timer = {};
var stats = [];

function startTimer() {
	timer = setInterval(function() {
		console.log(seconds);
		seconds++;
	}, 1000);
}

function stopTimer() {
	clearInterval(timer);
	seconds = 0;
}

function getCurrentTabUrl(callback) {
	var queryInfo = {
		active: true,
		currentWindow: true
	};
	chrome.tabs.query(queryInfo, function(tabs) {
		var tab = tabs[0];
		var url = tab.url;
		console.assert(typeof url == 'string', 'tab.url should be a string');
		callback(url);
	});
}

// cuts off the http(s):// part from the url
function parseUrl(url) {
	var httpPart = url.substr(0, 5);
	
	// starts with http
	if (httpPart.indexOf('s') === -1) {
		return url.substr(7);
	} 

	// starts with https
	return url.substr(8);
}

// reset timer on tab change
chrome.tabs.onActivated.addListener(function(info) {
	getCurrentTabUrl(function(url) {
		console.log('new url: ' + url);
		if (stats.indexOf(url) === -1) {
			stats.push(parseUrl(url));
		}
	});

	// stopTimer();
	// startTimer();
});

// start timer in the beginning
document.addEventListener('DOMContentLoaded', function() {
	console.log('hello');
	// getCurrentTabUrl(function(url) {
	// 	console.log('current tab: ' + url);
	// });
	// startTimer();
});

// receive msg regarding current tab from popup
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log(msg);
});
