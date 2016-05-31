let currSubreddit = '';
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

		stop() {
			clearInterval(timerObj);
		},

		resume() {
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
		const tab = tabs[0];
		const url = tab.url;
		// console.assert(typeof url == 'string', 'tab.url should be a string');
		callback(url);
	});
}

// TODO: might need more robust way
function isRedditUrl(url) {
	return url.indexOf('reddit') !== -1;
}

function getSubredditFromUrl(url) {
	return url.split('/')[4];
}

function resetTimerAndSetStatsIfRedditUrl(url) {
	if (isRedditUrl(url)) {
		if (currSubreddit !== getSubredditFromUrl(url)) {
			setStats(currSubreddit, timer.getSeconds());
			currSubreddit = getSubredditFromUrl(url);
			console.log(currSubreddit);
			timer.reset();
		}
	} else {
		timer.stop();
	}
}

function setStats(subreddit, seconds) {
	if (!localStorage.getItem(subreddit)) {
		localStorage.setItem(subreddit, seconds);
	} else {
		const localStorageNumValue = parseInt(localStorage.getItem(subreddit), 10);
		localStorage.setItem(subreddit, localStorageNumValue + seconds);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	timer = initTimer();
});

chrome.tabs.onActivated.addListener(() => {
	getCurrentTabUrl(url => {
		resetTimerAndSetStatsIfRedditUrl(url);
	});
});

chrome.windows.onFocusChanged.addListener(() => {
	getCurrentTabUrl(url => {
		resetTimerAndSetStatsIfRedditUrl(url);
	});
});
