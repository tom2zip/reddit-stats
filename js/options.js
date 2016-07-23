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

const width = 800;
const height = 400;
const padding = 20;
let plot;

function setBasePlot() {
	plot = d3.select('#plot')
		.attr('width', width)
		.attr('height', height);
}

function setXScale(dataset) {
	const xScale = d3.scale.linear()
		.domain([0, d3.max(dataset, d => d[1])])
		.range([padding + 5, width - padding]);
	return xScale;
}

function setYScale(dataset) {
	const yScale = d3.scale.linear()
		.domain([0, d3.max(dataset, d => d[2])])
		.range([height - padding, padding]);
	return yScale;
}

function createXAxis(xScale) {
	const xAxis = d3.svg.axis().scale(xScale).orient('bottom');
	plot.append('g')
		.attr('class', 'axis')
		.attr('transform', `translate(0, ${height - padding})`)
		.call(xAxis)
		.append('text')
			.attr('x', width)
			.attr('y', -6)
			.style('text-anchor', 'end')
			.text('Time Spent (seconds)');
}

function createYAxis(yScale) {
	const yAxis = d3.svg.axis().scale(yScale).orient('left');
	plot.append('g')
		.attr('class', 'axis')
		.attr('transform', `translate(${padding + 5}, 0)`)
		.call(yAxis)
		.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 14)
			.style('text-anchor', 'end')
			.text('Views');
}

function createToolTip() {
	const tooltip = d3.select('body').append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);
	return tooltip;
}

// data[0]: subreddit
// data[1]: time spent
// data[2]: views
function drawDots(dataset, xScale, yScale, tooltip) {
	plot.selectAll('circle')
		.data(dataset)
		.enter()
		.append('circle')
		.attr('cx', d => xScale(d[1]))
		.attr('cy', d => yScale(d[2]))
		.attr('r', 5)
		.attr('fill', 'orangered')
		.on('mouseover', function(d) {
			d3.select(this).attr('fill', 'lightsalmon');
			tooltip.transition()
				.duration(200)
				.style('opacity', 0.9);
			tooltip.html(() => {
				const displayTime = getDisplayTime(convertStatToTime(d[1]));
				return `<strong>${d[0]}</strong>: (${displayTime}, ${d[2]} views)`;
			})
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

function constructPlot(dataset) {
	setBasePlot();
	const xScale = setXScale(dataset);
	const yScale = setYScale(dataset);
	createXAxis(xScale);
	createYAxis(yScale);
	const tooltip = createToolTip();
	drawDots(dataset, xScale, yScale, tooltip);
}

function addRow(subreddit, seconds, views) {
	const metricsTable = document.getElementById('metrics-table-body');

	const newRow = metricsTable.insertRow(metricsTable.childElementCount);

	const subredditCell = newRow.insertCell(0);
	const secondsCell = newRow.insertCell(1);
	const viewsCell = newRow.insertCell(2);

	const subredditText = document.createTextNode(subreddit);
	const displayTime = getDisplayTime(convertStatToTime(seconds));
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

function processLocalStorageForPlot() {
	const subredditNames = [];
	const metricArr = [];
	for (const key in localStorage) {
		subredditNames.push(key);
		metricArr.push(JSON.parse(localStorage[key]));
	}
	const metricDataset = metricArr.map((metric, index) =>
		[subredditNames[index], metric.seconds, metric.views]
	);
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
	const metricDataset = processLocalStorageForPlot();
	const metricDataTable = processLocalStorageForTable();
	constructPlot(metricDataset);
	constructTable(metricDataTable);
}

document.addEventListener('DOMContentLoaded', () => {
	render();
});
