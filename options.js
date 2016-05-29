document.addEventListener('DOMContentLoaded', function() {
	console.log('hello friendo');
	populateStats();
});

let stats = [];

function populateStats() {
	for (var key in localStorage) {
		stats[key] = convertStatToTime(localStorage[key]);
	}
}

function convertStatToTime(stat) {
	const hours = parseInt(stat / 3600);
	let remainingSeconds = stat - hours*3600;
	const minutes = parseInt(remainingSeconds / 60);
	remainingSeconds = stat - hours*3600 - minutes*60;
	return {
		hours: hours,
		minutes: minutes,
		seconds: remainingSeconds
	};
}
