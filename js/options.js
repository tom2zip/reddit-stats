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

let width = 1150;
let height = 800;
const padding = 30;
let plot;

function createBasePlot() {
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
			.text('Visits');
}

function createToolTip() {
	const tooltip = d3.select('body').append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0);
	return tooltip;
}

// data[0]: subreddit
// data[1]: time spent
// data[2]: visits
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
				return `<strong>${d[0]}</strong>: (${displayTime}, ${d[2]} visits)`;
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
	createBasePlot();
	const xScale = setXScale(dataset);
	const yScale = setYScale(dataset);
	createXAxis(xScale);
	createYAxis(yScale);
	const tooltip = createToolTip();
	drawDots(dataset, xScale, yScale, tooltip);
}

function addRow(subreddit, seconds, visits) {
	const metricsTable = document.getElementById('metrics-table-body');

	const newRow = metricsTable.insertRow(metricsTable.childElementCount);
	newRow.addEventListener('mouseover', () => {
		console.log('hello');
	});

	const subredditCell = newRow.insertCell(0);
	const secondsCell = newRow.insertCell(1);
	const visitsCell = newRow.insertCell(2);

	const subredditText = document.createTextNode(subreddit);
	const displayTime = getDisplayTime(convertStatToTime(seconds));
	const secondsText = document.createTextNode(displayTime);
	const visitsText = document.createTextNode(visits);

	subredditCell.appendChild(subredditText);
	secondsCell.appendChild(secondsText);
	visitsCell.appendChild(visitsText);
}

function constructTable(metrics) {
	// add rows
	d3.select('#metrics-table-body')
		.selectAll('.data-row')
		.data(metrics)
		.enter()
		.append('tr')
		.attr('class', 'data-row');

	// add table data
	d3.selectAll('#metrics-table-body .data-row')
		.selectAll('td')
		.data(row => row)
		.enter()
			.append('td')
			.html(d => d);
}

function processLocalStorageForPlot() {
	const subredditNames = [];
	const metricArr = [];
	for (const key in localStorage) {
		subredditNames.push(key);
		metricArr.push(JSON.parse(localStorage[key]));
	}
	const metricDataset = metricArr.map((metric, index) =>
		[subredditNames[index], metric.seconds, metric.visits]
	);
	return metricDataset;
}

function processLocalStorageForTable() {
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

function render() {
	const metricDataset = processLocalStorageForPlot();
	constructPlot(metricDataset);
	constructTable(metricDataset);
}

document.addEventListener('DOMContentLoaded', () => {
	render();
});

// window.addEventListener('resize', () => {
// 	d3.select('svg').selectAll('*').remove();
// 	if (window.innerWidth < 992) {
// 		width = 600;
// 		height = 300;
// 		render();
// 	} else {
// 		width = 800;
// 		height = 400;
// 		render();
// 	}
// });
