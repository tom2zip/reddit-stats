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

const width = 700;
const barHeight = 20;
const height = 5 * barHeight + 100;
let chart;

function createBaseChart() {
	chart = d3.select('#chart')
		.attr('width', width)
		.attr('height', height);
}

function setXScale(data) {
	const xScale = d3.scale.linear()
		.domain([0, d3.max(data)])
		.range([0, 500]);
	return xScale;
}

function setYScale() {
	const yScale = d3.scale.linear()
		.domain([0, 5])
		.range([0, height]);
	return yScale;
}

function createYAxisElements(yScale, subreddits) {
	const yAxis = d3.svg.axis();
	yAxis.orient('left')
		.scale(yScale)
		.tickSize(0)
		.tickFormat((d, i) => subreddits[i])
		.tickValues(d3.range(5));
	return yAxis;
}

function drawYAxis(yAxis) {
	chart.append('g')
		.attr('transform', 'translate(130, 20)')
		.call(yAxis);
}

function createToolTip() {
	const tooltip = d3.select('body')
		.append('div')
		.style('position', 'absolute')
		.style('background', 'rgba(0, 0, 0, 0.8)')
		.style('text-align', 'center')
		.style('color', 'white')
		.style('height', '25px')
		.style('width', '100px')
		.style('visibility', 'hidden');
	return tooltip;
}

function drawBars(data, currentTab, tooltip, xScale) {
	const bar = chart.selectAll('g')
		.data(data)
		.enter()
			.append('g')
			.attr('transform', (d, i) => `translate(135, ${10 + i * (barHeight + 20)})`);

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
}

function constructChart(metrics, currentTab) {
	const subreddits = metrics.map(metric => metric.subreddit);
	const measuredMetricArr = currentTab === 'VIEWS' ?
		metrics.map(metric => metric.views) :
		metrics.map(metric => metric.seconds);

	createBaseChart();
	const xScale = setXScale(measuredMetricArr);
	const yScale = setYScale();
	const yAxis = createYAxisElements(yScale, subreddits);
	const tooltip = createToolTip();
	drawBars(measuredMetricArr, currentTab, tooltip, xScale);
	drawYAxis(yAxis);
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

function goToOptions() {
	window.open(chrome.extension.getURL('options.html'));
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('timespent-tab-heading').addEventListener('click', changeTab);
	document.getElementById('views-tab-heading').addEventListener('click', changeTab);
	document.getElementById('options-link').addEventListener('click', goToOptions);
	render('TIME_SPENT');
});
