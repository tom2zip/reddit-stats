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

let currSubreddit = '';
let lastVisited = '';

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

function enterSubreddit(nextSubreddit) {
	console.log(`enter: ${nextSubreddit} from: ${currSubreddit}`);

	if (currSubreddit !== '') {
		const entryToUpdate = getEntryToUpdate(currSubreddit);
		const updatedEntry = updateTime(entryToUpdate);
		console.log(`update time for ${currSubreddit}:`, updatedEntry);
		localStorage.setItem(currSubreddit, JSON.stringify(updatedEntry));	
	}

	if (lastVisited !== nextSubreddit) {
		const entryToUpdate = getEntryToUpdate(nextSubreddit);
		const updatedEntry = updateVisits(entryToUpdate);
		console.log(`update visits for ${nextSubreddit}:`, updatedEntry);
		localStorage.setItem(nextSubreddit, JSON.stringify(updatedEntry));	
	}

	currSubreddit = nextSubreddit;
	timer.reset();
}

function exitReddit() {
	console.log(`exiting reddit, last visited: ${currSubreddit}`);
	const entryToUpdate = getEntryToUpdate(currSubreddit);
	const updatedEntry = updateTime(entryToUpdate);
	console.log(`update time for ${currSubreddit}:`, updatedEntry);
	localStorage.setItem(currSubreddit, JSON.stringify(updatedEntry));
	lastVisited = currSubreddit;
	currSubreddit = '';
	timer.stop();
}

chrome.tabs.onActivated.addListener(() => {
	getCurrentTabUrl(url => {
		console.log(`onActivated url: ${url}`);
		if (isRedditUrl(url)) {
			const nextSubreddit = getSubredditFromUrl(url);
			enterSubreddit(nextSubreddit);
		} else {
			exitReddit();
		}
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		getCurrentTabUrl(url => {
			console.log(`onUpdated url: ${url}`);
			if (url === tab.url) {
				if (isRedditUrl(url)) {
					const nextSubreddit = getSubredditFromUrl(url);
					enterSubreddit(nextSubreddit);
				} else {
					exitReddit();
				}
			}
		});
	}
});

chrome.windows.onFocusChanged.addListener(() => {
	getCurrentTabUrl(url => {
		console.log(`onFocusChanged url: ${url}`);
		if (isRedditUrl(url)) {
			if (isRedditUrl(url)) {
				const nextSubreddit = getSubredditFromUrl(url);
				enterSubreddit(nextSubreddit);
			} else {
				exitReddit();
			}
		}
	});
});
