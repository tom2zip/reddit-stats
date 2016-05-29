document.addEventListener('DOMContentLoaded', function() {
	timer = initTimer();
	getCurrentTabUrl(function(url) {
		currUrl = parseUrl(url);
	});
	timer.start();
});

const initTimer = function() {
	let timerObj = {};
	let seconds = 0;

	return {
		start: function() {
			timerObj = setInterval(function() {
				console.log(seconds);
				seconds++;
			}, 1000);
		},

	 	reset: function() {
			clearInterval(timerObj);
			seconds = 0;
			this.start();
		},

		getSeconds: function() {
			return seconds;
		}
	}
};

let currUrl = '';
let timer = {};

function getCurrentTabUrl(callback) {
	const queryInfo = {
		active: true,
		currentWindow: true
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

function setStats(url, seconds) {
	if (!localStorage.getItem(url)) {
		localStorage.setItem(url, seconds);
	} else {
		const localStorageNumValue = parseInt(localStorage.getItem(url));
		localStorage.setItem(url, localStorageNumValue + seconds);
	}
}

chrome.tabs.onActivated.addListener(function(info) {
	getCurrentTabUrl(function(url) {
		const parsedUrl = parseUrl(url);
		console.log('tab changed to: ' + url);
		if (!currUrl || currUrl !== parsedUrl) {
			setStats(currUrl, timer.getSeconds());
			currUrl = parsedUrl;
			timer.reset();
		}
	});
});

chrome.windows.onFocusChanged.addListener(function() {
	console.log('window changed');
	getCurrentTabUrl(function(url) {
		const parsedUrl = parseUrl(url);
		console.log('tab chagned to: ' + url);
		setStats(currUrl, timer.getSeconds());
		currUrl = parsedUrl;
		timer.reset();
	});
});
