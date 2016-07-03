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

function constructPlot(dataset) {
	const chart = d3.select('#chart')
		.attr('width', 700)
		.attr('height', 400);

	chart.selectAll('circle')
		.data(dataset)
		.enter()
		.append('circle')
		.attr('cx', d => d[0])
		.attr('cy', d => d[1])
		.attr('r', 5);
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
			const hours = timeSpent.hours;
			const minutes = timeSpent.minutes;
			const seconds = timeSpent.seconds;
			metricEntries[i].innerHTML = timeSpent.hours > 0 ?
				`${hours}h ${minutes}m ${seconds}s` :
				`${minutes}m ${seconds}s`;
		}
	}
}

function clearChart() {
	d3.selectAll('svg > *').remove();
}

function processLocalStorage() {
	const metricArr = [];
	for (const key in localStorage) {
		metricArr.push(JSON.parse(localStorage[key]));
	}
	const metricDataset = metricArr.map(metric => [metric.seconds, metric.views]);
	return metricDataset;
}

function render(currentTab) {
	clearChart();
	const metrics = getMetrics();
	const topFiveMetrics = getTopFiveMetrics(metrics, currentTab);
	const metricDataset = processLocalStorage();
	constructPlot(metricDataset);
	constructTable(topFiveMetrics, currentTab);
}

document.addEventListener('DOMContentLoaded', () => {
	render('TIME_SPENT');
});
