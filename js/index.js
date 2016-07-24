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

function getDisplayTime(timeSpent) {
	const hours = timeSpent.hours;
	const minutes = timeSpent.minutes;
	const seconds = timeSpent.seconds;
	return hours > 0 ?
		`${hours}h ${minutes}m ${seconds}s` :
		`${minutes}m ${seconds}s`;
}

function getMetrics() {
	const metrics = [];
	for (const key in localStorage) {
		const nameObj = {
			subreddit: key,
		};
		const timeAndVisits = JSON.parse(localStorage[key]);
		const metric = Object.assign(nameObj, timeAndVisits);
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
	const tooltip = d3.select('body').append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);
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
		.attr('height', barHeight)
		.attr('fill', 'orangered')
		.transition()
			.duration(500)
			.delay((d, i) => i * 100)
			.attr('width', xScale);

	return bar;
}

function createBarLabels(data, bars, xScale, yScale, currentTab) {
	bars.append('text')
		.data(data)
		.attr('x', 0)
		.attr('y', 10)
		.attr('dx', -5)
		.attr('dy', '.36em')
		.attr('opacity', '0')
		.attr('fill', 'white')
		.attr('font-weight', 'bold')
		.attr('text-anchor', 'end')
		.text(d => {
			if (currentTab === 'TIME_SPENT') {
				return getDisplayTime(convertStatToTime(d));
			}
			return `${d} visits`;
		})
		.transition()
			.duration(500)
			.delay((d, i) => i * 100)
			.attr('x', xScale)
			.attr('opacity', '1');
}

function constructChart(metrics, currentTab) {
	const subreddits = metrics.map(metric => metric.subreddit);
	const measuredMetricArr = currentTab === 'VISITS' ?
		metrics.map(metric => metric.views) :
		metrics.map(metric => metric.seconds);

	createBaseChart();
	const xScale = setXScale(measuredMetricArr);
	const yScale = setYScale();
	const yAxis = createYAxisElements(yScale, subreddits);
	const tooltip = createToolTip();
	const bars = drawBars(measuredMetricArr, currentTab, tooltip, xScale);
	createBarLabels(measuredMetricArr, bars, xScale, yScale, currentTab);
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
	} else if (event.target.innerHTML === 'Visits') {
		render('VISITS');
	}
}

function goToOptions() {
	window.open(chrome.extension.getURL('options.html'));
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('timespent-tab-heading').addEventListener('click', changeTab);
	document.getElementById('visits-tab-heading').addEventListener('click', changeTab);
	document.getElementById('options-link').addEventListener('click', goToOptions);
	render('TIME_SPENT');
});
