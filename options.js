function convertStatToTime(stat) {
	const hours = parseInt(stat / 3600, 10);
	let remainingSeconds = stat - (hours * 3600);
	const minutes = parseInt(remainingSeconds / 60, 10);
	remainingSeconds = stat - (hours * 3600) - (minutes * 60);
	return {
		hours,
		minutes,
		seconds: remainingSeconds,
	};
}

function populateStats() {
	const stats = [];
	for (const key in localStorage) {
		stats[key] = convertStatToTime(localStorage[key]);
	}
	return stats;
}

function constructGraph(data) {
	console.log(data);
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('hello');
	constructGraph(populateStats());
});
