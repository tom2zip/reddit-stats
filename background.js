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

document.addEventListener('DOMContentLoaded', () => {
	timer = initTimer();
});

function getCurrentTabUrl(callback) {
	const queryInfo = {
		active: true,
		currentWindow: true,
	};
	chrome.tabs.query(queryInfo, tabs => {
		const tab = tabs[0];
		const url = tab.url;
		callback(url);
	});
}

// TODO: might need more robust way
function isRedditUrl(url) {
	return url.indexOf('reddit') !== -1;
}

function getSubredditFromUrl(url) {
	const splitUrl = url.split('/');
	if (splitUrl[3] === 'r') {
		const subredditName = splitUrl[4];
		if (subredditName.indexOf('#') > -1) {
			return subredditName.split('#')[0];
		}
		return subredditName;
	}
	return 'everything else';
}

function setStats(subreddit, seconds) {
	if (!localStorage.getItem(subreddit)) {
		localStorage.setItem(subreddit, seconds);
	} else {
		const localStorageNumValue = parseInt(localStorage.getItem(subreddit), 10);
		localStorage.setItem(subreddit, localStorageNumValue + seconds);
	}
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

chrome.tabs.onActivated.addListener(() => {
	getCurrentTabUrl(url => {
		resetTimerAndSetStatsIfRedditUrl(url);
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		resetTimerAndSetStatsIfRedditUrl(tab.url);
	}
});

chrome.windows.onFocusChanged.addListener(() => {
	getCurrentTabUrl(url => {
		resetTimerAndSetStatsIfRedditUrl(url);
	});
});
