function startTimer() {
	var seconds = 0;
	setInterval(function() {
		console.log(seconds);
		seconds++;
	}, 1000);
}

function stopTimer() {
	clearInterval();
}

chrome.tabs.onActivated.addListener(function(info) {
	console.log(info);
	// stopTimer();
	// startTimer();
});