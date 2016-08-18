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
			console.log('TIMER RESET');
			clearInterval(timerObj);
			seconds = 0;
			this.start();
		},

		stop() {
			console.log('TIMER STOP');
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
	if (Object.keys(entry).length === 0) {
		updatedEntry.seconds = seconds;
	} else {
		updatedEntry.seconds += seconds;
	}
	return updatedEntry;
}

function updateVisits(entry) {
	const updatedEntry = entry;
	if (Object.keys(entry).length === 0) {
		updatedEntry.visits = 1;
	} else {
		updatedEntry.visits++;
	}
	return updatedEntry;
}

let currSubreddit = '';

function enterSubreddit(nextSubreddit) {
	console.log(`enter: ${nextSubreddit}`);

	const entryToUpdate = getEntryToUpdate(currSubreddit);
	const updatedEntry = updateVisits(entryToUpdate);
	console.log(`update visits for ${currSubreddit}:`, updatedEntry);
	localStorage.setItem(currSubreddit, JSON.stringify(updatedEntry));
	timer.reset();
}

function exitSubreddit() {
	const entryToUpdate = getEntryToUpdate(currSubreddit);
	const updatedEntry = updateTime(entryToUpdate);
	console.log(`exiting ${currSubreddit}`, updatedEntry);
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
	if (currSubreddit) {
		exitSubreddit();
	}
	getCurrentTabUrl(url => {
		console.log(`active tab change: ${url}`);
		enterOrExit(url);
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		if (currSubreddit) {
			exitSubreddit();
		}

		getCurrentTabUrl(url => {
			console.log(`same tab changed url: ${url}`);
			if (url === tab.url) {
				enterOrExit(url);
			}
		});
	}
});

// chrome.windows.onFocusChanged.addListener(() => {
// 	getCurrentTabUrl(url => {
// 		console.log(`active window change: ${url}`);
// 		if (isSubredditUrl(url)) {
// 			enterOrExit(url);
// 		}
// 	});
// });
