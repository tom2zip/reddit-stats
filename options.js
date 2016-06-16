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

	const width = 900;
	const barHeight = 20;
	const height = barHeight * timeSpent.length + 100;

	const xScale = d3.scale.linear()
		.domain([0, d3.max(timeSpent)])
		.range([0, 700]);

	const yScale = d3.scale.linear()
		.domain([0, subreddits.length])
		.range([0, height]);

	const yAxis = d3.svg.axis();
	yAxis.orient('left')
		.scale(yScale)
		.tickSize(0)
		.tickFormat((d, i) => subreddits[i])
		.tickValues(d3.range(5));

	const chart = d3.select('#chart')
		.attr('width', width)
		.attr('height', height);

	const bar = chart.selectAll('g')
		.data(timeSpent)
		.enter()
			.append('g')
			.attr('transform', (d, i) => `translate(135, ${10 + i * (barHeight + 20)})`);

	bar.append('rect')
		.attr('width', 0)
		.attr('height', barHeight - 1)
		.attr('fill', 'orangered')
		.on('mouseover', function() {
			d3.select(this).attr('fill', 'lightsalmon');
		})
		.on('mouseout', function() {
			d3.select(this).attr('fill', 'orangered');
		})
		.transition()
			.duration(500)
			.delay((d, i) => i * 100)
			.attr('width', (d, i) => xScale(d));

	bar.append('text')
		.attr('x', d => 0)
		.attr('y', barHeight / 2)
		.attr('dy', '.35em')
		.text(d => d)
		.transition()
			.duration(500)
			.attr('x', d => xScale(d) + 3)

	chart.append('g')
		.attr('transform', 'translate(130, 20)')
		.attr('id', 'yaxis')
		.call(yAxis);
}

document.addEventListener('DOMContentLoaded', () => {
	const topFive = calculateTopFive(getStats());
	console.log(topFive);
	constructGraph(topFive);
});
