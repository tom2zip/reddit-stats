const stats = [];

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
	for (const key in localStorage) {
		stats[key] = convertStatToTime(localStorage[key]);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('hello');
	populateStats();

	const data = [4, 8, 15, 16, 23, 42];
	d3.select('.chart')
		.selectAll('div')
			.data(data)
		.enter()
		.append('div')
			.style('width', d => `${d * 10}px`)
			.text(d => d);
});
