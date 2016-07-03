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

function constructChart(metrics, currentTab) {
	const subreddits = metrics.map(metric => metric.subreddit);
	const measuredMetricArr = currentTab === 'VIEWS' ?
		metrics.map(metric => metric.views) :
		metrics.map(metric => metric.seconds);

	const width = 700;
	const barHeight = 20;
	const height = 5 * barHeight + 100;

	const xScale = d3.scale.linear()
		.domain([0, d3.max(measuredMetricArr)])
		.range([0, 500]);

	const yScale = d3.scale.linear()
		.domain([0, 5])
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
		.data(measuredMetricArr)
		.enter()
			.append('g')
			.attr('transform', (d, i) => `translate(135, ${10 + i * (barHeight + 20)})`);

	const tooltip = d3.select('body')
		.append('div')
		.style('position', 'absolute')
		.style('background', 'rgba(0, 0, 0, 0.8)')
		.style('text-align', 'center')
		.style('color', 'white')
		.style('height', '25px')
		.style('width', '100px')
		.style('visibility', 'hidden');

	bar.append('rect')
		.attr('width', 0)
		.attr('height', barHeight - 1)
		.attr('fill', 'orangered')
		.on('mouseover', function() {
			d3.select(this).attr('fill', 'lightsalmon');
			tooltip.style('visibility', 'visible');
		})
		.on('mousemove', (d) => {
			tooltip.style('top', `${event.pageY - 30}px`).style('left', `${event.pageX - 50}px`);
			if (currentTab === 'VIEWS') {
				tooltip.text(`${d} views`);
			} else {
				const timeSpent = convertStatToTime(d);
				const hours = timeSpent.hours;
				const minutes = timeSpent.minutes;
				const seconds = timeSpent.seconds;
				const displayTime = timeSpent.hours > 0 ?
					`${hours}h ${minutes}m ${seconds}s` :
					`${minutes}m ${seconds}s`;
				tooltip.text(displayTime);
			}
		})
		.on('mouseout', function() {
			d3.select(this).attr('fill', 'orangered');
			tooltip.style('visibility', 'hidden');
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

function render(currentTab) {
	clearChart();
	const metrics = getMetrics();
	const topFiveMetrics = getTopFiveMetrics(metrics, currentTab);
	constructChart(topFiveMetrics, currentTab);
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
