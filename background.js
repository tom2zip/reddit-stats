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
		if (tabs.length > 0) {
			const tab = tabs[0];
			const url = tab.url;
			callback(url);
		}
	});
}

// TODO: might need more robust way
function isRedditUrl(url) {
	return url.indexOf('reddit') > -1;
}
function isSubredditUrl(url) {
	if (isRedditUrl(url)) {
		const splitUrl = url.split('/');
		if (splitUrl[3] === 'r') {
			return true;
		}
		return false;
	}
	return false;
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

function getEntryToUpdate(fromSubreddit) {
	if (!localStorage.getItem(fromSubreddit)) {
		return {};
	}
	return JSON.parse(localStorage.getItem(fromSubreddit));
}

function updateTime(entry) {
	const updatedEntry = entry;
	const seconds = timer.getSeconds();
	if (entry.seconds) {
		updatedEntry.seconds += seconds;
	} else {
		updatedEntry.seconds = seconds;
	}
	return updatedEntry;
}

function updateVisits(entry) {
	const updatedEntry = entry;
	if (entry.visits) {
		updatedEntry.visits++;
	} else {
		updatedEntry.visits = 1;
	}
	return updatedEntry;
}

let currSubreddit = '';

function enterSubreddit() {
	console.log('enter:', currSubreddit);
	const entryToUpdate = getEntryToUpdate(currSubreddit);
	const updatedEntry = updateVisits(entryToUpdate);
	localStorage.setItem(currSubreddit, JSON.stringify(updatedEntry));
	timer.reset();
}

function exitSubreddit() {
	console.log('exit:', currSubreddit);
	const entryToUpdate = getEntryToUpdate(currSubreddit);
	const updatedEntry = updateTime(entryToUpdate);
	localStorage.setItem(currSubreddit, JSON.stringify(updatedEntry));
	currSubreddit = '';
	timer.stop();
}

function enterOrExit(url) {
	const lowerCaseUrl = url.toLowerCase();

	if (isSubredditUrl(lowerCaseUrl)) {
		const nextSubreddit = getSubredditFromUrl(lowerCaseUrl);

		if (currSubreddit === '') {
			// new reddit session
			currSubreddit = nextSubreddit;
			enterSubreddit(nextSubreddit);
		} else {
			// leave to another subreddit
			currSubreddit = nextSubreddit;
		}
	} else {
		// leave to different site
		currSubreddit = '';
	}
}

chrome.tabs.onActivated.addListener(() => {
	getCurrentTabUrl(url => {
		const lowerCaseUrl = url.toLowerCase();
		const nextSubreddit = getSubredditFromUrl(lowerCaseUrl);

		if (currSubreddit && currSubreddit !== nextSubreddit) {
			exitSubreddit();
		}
		enterOrExit(url);
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		if (currSubreddit) {
			exitSubreddit();
		}

		getCurrentTabUrl(url => {
			if (url === tab.url) {
				enterOrExit(url);
			}
		});
	}
});

// chrome.windows.onFocusChanged.addListener(() => {
// 	if (currSubreddit) {
// 		exitSubreddit();
// 	}
// 	getCurrentTabUrl(url => {
// 		console.log(`active window change: ${url}`);
// 		if (isSubredditUrl(url)) {
// 			enterOrExit(url);
// 		}
// 	});
// });
