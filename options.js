document.addEventListener('DOMContentLoaded', function() {
	console.log('hello');
	populateStats();

	var data = [4, 8, 15, 16, 23, 42];
	d3.select('.chart')
		.selectAll('div')
			.data(data)
		.enter().append('div')
			.style('width', function(d) { return d * 10 + 'px'; })
			.text(function(d) { return d; });
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
