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

function getArrayOfTimeSpent() {
	const timeSpentArr = [];
	for (const key in localStorage) {
		const subredditEntry = JSON.parse(localStorage[key]);
		timeSpentArr[key] = subredditEntry.seconds;
	}
	return timeSpentArr;
}

function getArrayOfViews() {
	const viewsArr = [];
	for (const key in localStorage) {
		const subredditEntry = JSON.parse(localStorage[key]);
		viewsArr[key] = subredditEntry.views;
	}
	return viewsArr;
}

function calculateTopFiveTimeSpent(stats) {
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
		if (maxTimeSpentSubreddit === 'everything else' ||
			maxTimeSpentSubreddit === 'front' || 
			maxTimeSpentSubreddit === 'longest_visit') {
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

function calculateTopFiveViews(stats) {
	const subreddits = [];
	const views = [];
	const topFive = [];
	for (const subreddit in stats) {
		subreddits.push(subreddit);
		views.push(stats[subreddit]);
	}

	let i = 0;
	while (i < 5) {
		const mostViews = Math.max.apply(Math, views);
		const mostViewsIndex = views.indexOf(mostViews);
		const mostViewsSubreddit = subreddits[mostViewsIndex];
		if (mostViewsSubreddit === 'everything else' ||
			mostViewsSubreddit === 'front' || 
			mostViewsSubreddit === 'longest_visit') {
			subreddits.splice(mostViewsIndex, 1);
			views.splice(mostViewsIndex, 1);
			continue;
		}
		topFive.push({ subreddit: mostViewsSubreddit, views: mostViews });

		subreddits.splice(mostViewsIndex, 1);
		views.splice(mostViewsIndex, 1);

		i++;
	}

	return topFive;
}

function constructTimeSpentGraph(data) {
	const subreddits = [];
	const timeSpent = [];
	for (let i = 0; i < data.length; i++) {
		subreddits.push(data[i].subreddit);
		timeSpent.push(data[i].time);
	}

	const width = 700;
	const barHeight = 20;
	const height = barHeight * timeSpent.length + 100;

	const xScale = d3.scale.linear()
		.domain([0, d3.max(timeSpent)])
		.range([0, 500]);

	const yScale = d3.scale.linear()
		.domain([0, subreddits.length])
		.range([0, height]);

	const yAxis = d3.svg.axis();
	yAxis.orient('left')
		.scale(yScale)
		.tickSize(0)
		.tickFormat((d, i) => subreddits[i])
		.tickValues(d3.range(5));

	const chart = d3.select('#timespent-chart')
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
			.attr('width', d => xScale(d));

	chart.append('g')
		.attr('transform', 'translate(130, 20)')
		.attr('id', 'yaxis')
		.call(yAxis);
}

function constructViewsGraph(data) {
	const subreddits = [];
	const views = [];
	for (let i = 0; i < data.length; i++) {
		subreddits.push(data[i].subreddit);
		views.push(data[i].views);
	}

	const width = 700;
	const barHeight = 20;
	const height = barHeight * views.length + 100;

	const xScale = d3.scale.linear()
		.domain([0, d3.max(views)])
		.range([0, 500]);

	const yScale = d3.scale.linear()
		.domain([0, subreddits.length])
		.range([0, height]);

	const yAxis = d3.svg.axis();
	yAxis.orient('left')
		.scale(yScale)
		.tickSize(0)
		.tickFormat((d, i) => subreddits[i])
		.tickValues(d3.range(5));

	const chart = d3.select('#views-chart')
		.attr('width', width)
		.attr('height', height);

	const bar = chart.selectAll('g')
		.data(views)
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
			.attr('width', d => xScale(d));

	chart.append('g')
		.attr('transform', 'translate(130, 20)')
		.attr('id', 'yaxis')
		.call(yAxis);
}

function constructTimeSpentTable(data) {
	const subredditEntries = document.getElementsByClassName('subreddit-timespent-name');
	const timeSpentEntries = document.getElementsByClassName('subreddit-timespent-time');
	for (let i = 0; i < subredditEntries.length; i++) {
		const subredditName = data[i].subreddit;
		const timeSpent = convertStatToTime(data[i].time);
		const hours = timeSpent.hours;
		const minutes = timeSpent.minutes;
		const seconds = timeSpent.seconds;

		subredditEntries[i].innerHTML = subredditName;
		subredditEntries[i].setAttribute('href', `https://www.reddit.com/r/${subredditName}`);

		if (timeSpent.hours > 0) {
			timeSpentEntries[i].innerHTML = `${hours}h ${minutes}m ${seconds}s`;
		} else {
			timeSpentEntries[i].innerHTML = `${minutes}m ${seconds}s`;
		}
	}
}

function constructViewsTable(data) {
	const subredditEntries = document.getElementsByClassName('subreddit-views-name');
	const viewsEntries = document.getElementsByClassName('subreddit-views-views');
	for (let i = 0; i < subredditEntries.length; i++) {
		const subredditName = data[i].subreddit;
		const views = data[i].views;
		subredditEntries[i].innerHTML = subredditName;
		subredditEntries[i].setAttribute('href', `https://www.reddit.com/r/${subredditName}`);
		viewsEntries[i].innerHTML = views;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const topFiveTimeSpent = calculateTopFiveTimeSpent(getArrayOfTimeSpent());
	const topFiveViews = calculateTopFiveViews(getArrayOfViews());

	constructTimeSpentGraph(topFiveTimeSpent);
	constructTimeSpentTable(topFiveTimeSpent);

	constructViewsGraph(topFiveViews);
	constructViewsTable(topFiveViews);
});
