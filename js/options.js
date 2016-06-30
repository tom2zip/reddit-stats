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

function getMetrics() {
	const metrics = [];
	for (const key in localStorage) {
		const nameObj = {
			subreddit: key,
		};
		const timeAndViews = JSON.parse(localStorage[key]);
		const metric = Object.assign(nameObj, timeAndViews);
		metrics.push(metric);
	}
	return metrics;
}

function getTopFiveMetrics(metrics, currentTab) {
	const topFive = [];
	const measuredMetricArr = currentTab === 'TIME_SPENT' ?
		metrics.map(metric => metric.seconds) :
		metrics.map(metric => metric.views);

	let i = 0;
	while (i < 5) {
		const maxMetric = Math.max.apply(Math, measuredMetricArr);
		const maxMetricIndex = measuredMetricArr.indexOf(maxMetric);
		const maxMetricSubreddit = metrics[maxMetricIndex].subreddit;
		if (maxMetricSubreddit === 'everything else' ||
			maxMetricSubreddit === 'front' ||
			maxMetricSubreddit === 'longest_visit') {
			metrics.splice(maxMetricIndex, 1);
			measuredMetricArr.splice(maxMetricIndex, 1);
			continue;
		}

		topFive.push(metrics[maxMetricIndex]);
		metrics.splice(maxMetricIndex, 1);
		measuredMetricArr.splice(maxMetricIndex, 1);

		i++;
	}

	return topFive;
}

function constructTimeSpentGraph(data) {
	const subreddits = [];
	const timeSpent = [];
	for (let i = 0; i < data.length; i++) {
		subreddits.push(data[i].subreddit);
		timeSpent.push(data[i].seconds);
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

	const chart = d3.select('#chart')
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

function clearChart() {
	d3.selectAll('svg > *').remove();
}

function constructTable(metrics, currentTab) {
	const tableHeading = document.getElementsByClassName('table-heading-metric')[0];
	const subredditEntries = document.getElementsByClassName('subreddit-name');
	const metricEntries = document.getElementsByClassName('subreddit-metric');
	tableHeading.innerHTML = currentTab === 'VIEWS' ? 'Views' : 'Time';
	for (let i = 0; i < subredditEntries.length; i++) {
		const subredditName = metrics[i].subreddit;
		subredditEntries[i].innerHTML = subredditName;
		subredditEntries[i].setAttribute('href', `https://www.reddit.com/r/${subredditName}`);
		if (currentTab === 'VIEWS') {
			const views = metrics[i].views;
			metricEntries[i].innerHTML = views;
		} else {
			const timeSpent = convertStatToTime(metrics[i].seconds);
			hours = timeSpent.hours;
			minutes = timeSpent.minutes;
			seconds = timeSpent.seconds;
			metricEntries[i].innerHTML = timeSpent.hours > 0 ?
				`${hours}h ${minutes}m ${seconds}s` :
				`${minutes}m ${seconds}s`;
		}
	}
}

function render(currentTab) {
	clearChart();
	const metrics = getMetrics();
	const topFiveMetrics = getTopFiveMetrics(metrics, currentTab);
	constructTable(topFiveMetrics, currentTab);
	if (currentTab === 'TIME_SPENT') {
		constructTimeSpentGraph(topFiveMetrics);
		constructTimeSpentTable(topFiveMetrics);
	} else if (currentTab === 'VIEWS') {
		constructViewsGraph(topFiveMetrics);
		constructViewsTable(topFiveMetrics);
	}
}

function changeTab(event) {
	if (event.target.innerHTML === 'Time Spent') {
		render('TIME_SPENT');
	} else if (event.target.innerHTML === 'Views') {
		render('VIEWS');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('timespent-tab-heading').addEventListener('click', changeTab);
	document.getElementById('views-tab-heading').addEventListener('click', changeTab);
	render('TIME_SPENT');
});
