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
	const WIDTH = 700;
	const HEIGHT = 400;

	const xValues = dataset.map(data => data[0]);
	const yValues = dataset.map(data => data[1]);

	const xScale = d3.scale.linear()
		.domain([0, d3.max(xValues)])
		.range([0, WIDTH]);

	const yScale = d3.scale.linear()
		.domain([0, d3.max(yValues)])
		.range([HEIGHT, 0]);

	const chart = d3.select('#chart')
		.attr('width', WIDTH)
		.attr('height', HEIGHT);

	const tooltip = d3.select('body').append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);

	chart.selectAll('circle')
		.data(dataset)
		.enter()
		.append('circle')
		.attr('cx', d => xScale(d[0]))
		.attr('cy', d => yScale(d[1]))
		.attr('r', 5)
		.attr('fill', 'orangered')
		.on('mouseover', function(d) {
			d3.select(this).attr('fill', 'lightsalmon');
			tooltip.transition()
				.duration(200)
				.style('opacity', 0.9);
			tooltip.html(`(${d[0]}, ${d[1]})`)
				.style('left', `${d3.event.pageX + 5}px`)
				.style('top', `${d3.event.pageY - 28}px`);
		})
		.on('mouseout', function() {
			d3.select(this).attr('fill', 'orangered');
			tooltip.transition()
				.duration(500)
				.style('opacity', 0);
		});
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
