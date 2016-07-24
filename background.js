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
	return '';
}

function setStats(subreddit, seconds) {
	if (!localStorage.getItem(subreddit)) {
		const newSubredditEntry = {
			seconds,
			visits: 1,
		};
		localStorage.setItem(subreddit, JSON.stringify(newSubredditEntry));
	} else {
		const subredditEntry = JSON.parse(localStorage.getItem(subreddit));
		const timeSpent = subredditEntry.seconds;
		const numVisits = subredditEntry.visits;
		const newSubredditEntry = {
			seconds: timeSpent + seconds,
			visits: numVisits + 1,
		};
		localStorage.setItem(subreddit, JSON.stringify(newSubredditEntry));
	}
}

function resetTimerAndSetStatsIfRedditUrl(url) {
	if (isRedditUrl(url)) {
		const newSubreddit = getSubredditFromUrl(url);
		if (newSubreddit !== '' && currSubreddit !== newSubreddit) {
			setStats(currSubreddit, timer.getSeconds());
			currSubreddit = getSubredditFromUrl(url);
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
		getCurrentTabUrl(url => {
			if (url === tab.url) {
				resetTimerAndSetStatsIfRedditUrl(tab.url);
			}
		});
	}
});

chrome.windows.onFocusChanged.addListener(() => {
	getCurrentTabUrl(url => {
		resetTimerAndSetStatsIfRedditUrl(url);
	});
});
