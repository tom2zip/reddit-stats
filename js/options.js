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

function addRow(subreddit, seconds, views) {
	const metricsTable = document.getElementById('metrics-table-body');

	const newRow = metricsTable.insertRow(metricsTable.childElementCount);

	const subredditCell = newRow.insertCell(0);
	const secondsCell = newRow.insertCell(1);
	const viewsCell = newRow.insertCell(2);

	const subredditText = document.createTextNode(subreddit);
	const timeSpent = convertStatToTime(seconds);
	const hours = timeSpent.hours;
	const minutes = timeSpent.minutes;
	const timeSpentSeconds = timeSpent.seconds;
	const displayTime = timeSpent.hours > 0 ?
		`${hours}h ${minutes}m ${timeSpentSeconds}s` :
		`${minutes}m ${timeSpentSeconds}s`;
	const secondsText = document.createTextNode(displayTime);
	const viewsText = document.createTextNode(views);

	subredditCell.appendChild(subredditText);
	secondsCell.appendChild(secondsText);
	viewsCell.appendChild(viewsText);
}

function constructTable(metrics) {
	metrics.forEach(metric => {
		addRow(metric.subreddit, metric.seconds, metric.views);
	});
}

function clearChart() {
	d3.selectAll('svg > *').remove();
}

function processLocalStorageForPlot() {
	const metricArr = [];
	for (const key in localStorage) {
		metricArr.push(JSON.parse(localStorage[key]));
	}
	const metricDataset = metricArr.map(metric => [metric.seconds, metric.views]);
	return metricDataset;
}

function processLocalStorageForTable() {
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

function render() {
	clearChart();
	const metricDataset = processLocalStorageForPlot();
	const metricDataTable = processLocalStorageForTable();
	constructPlot(metricDataset);
	constructTable(metricDataTable);
}

document.addEventListener('DOMContentLoaded', () => {
	render('TIME_SPENT');
});
