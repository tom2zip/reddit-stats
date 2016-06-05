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
	const timeSpent = [];
	const subreddits = [];
	for (const key in data) {
		timeSpent.push(data[key]);
		subreddits.push(key);
	}

	// const width = 400;
	// const barHeight = 20;
	// const height = barHeight * timeSpent.length;

	// const chart = d3.select('#chart')
	// 	.attr('width', width)
	// 	.attr('height', height);

	// const xScale = d3.scale.linear()
	// 	.domain([0, d3.max(timeSpent)])
	// 	.range([0, width]);
	// const yScale = d3.scale.ordinal()
	// 	.domain(d3.range(timeSpent.length))
	// 	.rangeBands([0, height]);
	// chart.selectAll('rect')
	// 	.data(timeSpent)
	// 	.enter().append('rect')
	// 	.attr('x', 0)
	// 	.attr('y', yScale)
	// 	.attr('width', xScale)
	// 	.attr('height', yScale.rangeBand());
}

document.addEventListener('DOMContentLoaded', () => {
	console.log('hello');
	const topFive = calculateTopFive(getStats());
	// constructGraph(topFive);
});
