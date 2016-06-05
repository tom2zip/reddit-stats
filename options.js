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

function getStats() {
	const stats = [];
	for (const key in localStorage) {
		// stats[key] = convertStatToTime(localStorage[key]);
		stats[key] = parseInt(localStorage[key], 10);
	}
	return stats;
}

function calculateTopFive(stats) {
	const subreddits = [];
	const timeSpent = [];
	const topFive = [];
	for (const subreddit in stats) {
		subreddits.push(subreddit);
		timeSpent.push(stats[subreddit]);
	}

	let i = 0;
	while (i < 5) {
		const maxTimeSpent = Math.max.apply(Math, timeSpent);
		const maxTimeSpentIndex = timeSpent.indexOf(maxTimeSpent);
		const maxTimeSpentSubreddit = subreddits[maxTimeSpentIndex];
		if (maxTimeSpentSubreddit === 'everything else' || maxTimeSpentSubreddit === 'front') {
			subreddits.splice(maxTimeSpentIndex, 1);
			timeSpent.splice(maxTimeSpentIndex, 1);
			continue;
		}
		topFive.push({ subreddit: maxTimeSpentSubreddit, time: maxTimeSpent });

		subreddits.splice(maxTimeSpentIndex, 1);
		timeSpent.splice(maxTimeSpentIndex, 1);

		i++;
	}

	return topFive;
}

function constructGraph(data) {
	const subreddits = [];
	const timeSpent = [];
	for (let i = 0; i < data.length; i++) {
		subreddits.push(data[i].subreddit);
		timeSpent.push(data[i].time);
	}
	console.log(subreddits, timeSpent);

	const width = 900;
	const barHeight = 20;
	const height = barHeight * timeSpent.length;

	const xScale = d3.scale.linear()
		.domain([0, d3.max(timeSpent)])
		.range([0, width]);

	const chart = d3.select('#chart')
		.attr('width', width)
		.attr('height', height);

	const bar = chart.selectAll('g')
		.data(timeSpent)
		.enter().append('g')
			.attr('transform', (d, i) => 'translate(0, ' + i * barHeight + ')');

	bar.append('rect')
		.attr('width', xScale)
		.attr('height', barHeight - 1);

document.addEventListener('DOMContentLoaded', () => {
	console.log('hello');
	const topFive = calculateTopFive(getStats());
	console.log(topFive);
	constructGraph(topFive);
});
