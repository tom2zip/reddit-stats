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

document.addEventListener('DOMContentLoaded', () => {
	getCurrentTabUrl(url => {
		const content = document.getElementById('content');
		content.innerHTML = `Your current active tab url is: ${url}`;
		chrome.runtime.sendMessage(url);
	});
});
