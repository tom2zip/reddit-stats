let currUrl = '';
let timer = {};

const initTimer = function() {
	let timerObj = {};
	let seconds = 0;

	return {
		start() {
			timerObj = setInterval(() => {
				seconds++;
			}, 1000);
		},

		reset() {
			clearInterval(timerObj);
			seconds = 0;
			this.start();
		},

		getSeconds() {
			return seconds;
		},
	};
};

function getCurrentTabUrl(callback) {
	const queryInfo = {
		active: true,
		currentWindow: true,
	};
	chrome.tabs.query(queryInfo, tabs => {
		// tabs[0] will always be the current tab on current window
		const tab = tabs[0];
		const url = tab.url;
		// console.assert(typeof url == 'string', 'tab.url should be a string');
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
		const localStorageNumValue = parseInt(localStorage.getItem(url), 10);
		localStorage.setItem(url, localStorageNumValue + seconds);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	timer = initTimer();
	getCurrentTabUrl((url) => {
		currUrl = parseUrl(url);
	});
	timer.start();
});

chrome.tabs.onActivated.addListener(() => {
	getCurrentTabUrl(url => {
		const parsedUrl = parseUrl(url);
		if (!currUrl || currUrl !== parsedUrl) {
			setStats(currUrl, timer.getSeconds());
			currUrl = parsedUrl;
			timer.reset();
		}
	});
});

chrome.windows.onFocusChanged.addListener(() => {
	getCurrentTabUrl(url => {
		const parsedUrl = parseUrl(url);
		setStats(currUrl, timer.getSeconds());
		currUrl = parsedUrl;
		timer.reset();
	});
});
