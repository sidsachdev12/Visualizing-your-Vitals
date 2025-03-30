class MyHeartDailyRange {
  constructor(parentElement, data, changeMode) {
    this.parentElement = parentElement;
    this.data = data;
    this.changeMode = changeMode;

    this.filteredData = [];

    this.day = new Date(2023, 0, 1);

    this.initVis();
  }

  initVis() {
    const vis = this;

    d3.select(vis.parentElement).select("svg").remove();

    vis.margin = { top: 20, right: 30, bottom: 40, left: 50 };
    vis.width =
      document.getElementById(vis.parentElement).getBoundingClientRect().width -
      vis.margin.left -
      vis.margin.right;
    vis.height =
      document.getElementById(vis.parentElement).getBoundingClientRect()
        .height -
      vis.margin.top -
      vis.margin.bottom;

    vis.svg = d3
      .select("#" + vis.parentElement)
      .append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    // Create a start and end date for the day
    const tempStartDate = new Date(2023, 0, 1); // Jan 1, 2023 at 00:00
    const tempEndDate = new Date(2023, 0, 1, 23, 59, 59); // Jan 1, 2023 at 23:59:59

    vis.x = d3
      .scaleTime()
      .domain([tempStartDate, tempEndDate]) // midnight to midnight
      .range([0, vis.width]);

    // y-scale: min to max heart rate (with some padding)
    vis.y = d3.scaleLinear().domain([50, 100]).range([vis.height, 0]);

    // x-axis: maybe tick every 2 or 3 hours
    vis.xAxis = d3
      .axisBottom(vis.x)
      .ticks(d3.timeHour.every(3))
      .tickFormat(d3.timeFormat("%-I %p")); // e.g. "12 AM"
    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(vis.xAxis);

    // y-axis: a few ticks
    vis.yAxis = d3.axisLeft(vis.y).ticks(5);
    vis.svg.append("g").attr("class", "y-axis").call(vis.yAxis);

    vis.wrangleData();
  }

  wrangleData() {
    const vis = this;

    // Format the selected day as "YYYY-MM-DD"
    vis.selectedDateStr = d3.timeFormat("%Y-%m-%d")(vis.day);

    // Filter the full data array to only include records from the selected day.
    vis.filteredData = vis.data.filter(
      (d) => d3.timeFormat("%Y-%m-%d")(d.timestamp) === vis.selectedDateStr
    );

    // Group the filtered data by hour
    vis.hourlyData = Array.from(
      d3.group(vis.filteredData, (d) => d3.timeHour.floor(d.timestamp)),
      ([hour, values]) => ({
        hour, // Date object representing the hour (e.g., 2023-03-20 07:00)
        min: d3.min(values, (v) => v.heart_rate),
        max: d3.max(values, (v) => v.heart_rate),
      })
    ).sort((a, b) => a.hour - b.hour);

    // Find overall min & max heart rate for y-scale
    vis.globalMin = d3.min(vis.hourlyData, (d) => d.min) || 40;
    vis.globalMax = d3.max(vis.hourlyData, (d) => d.max) || 120;

    // x-scale: from earliest hour to the next day’s hour
    // Or just 0–24 if you always show a full day
    vis.startOfDay = d3.timeDay.floor(vis.hourlyData[0].hour);
    vis.endOfDay = d3.timeDay.offset(vis.startOfDay, 1); // +1 day

    vis.updateVis();
  }

  updateVis() {
    const vis = this;
    vis.x.domain([vis.startOfDay, vis.endOfDay]);
    vis.y.domain([vis.globalMin - 5, vis.globalMax + 5]);

    // For each hour, draw an ellipse covering min..max
    // Ellipse center: ( x(hour + half?), y(midpoint of min & max) )
    // Ellipse rx: a small fixed horizontal radius
    // Ellipse ry: half the vertical distance between min & max
    const ellipseRx = 8; // horizontal radius in pixels
    vis.svg
      .selectAll("ellipse.hour")
      .data(vis.hourlyData)
      .join("ellipse")
      .attr("class", "hour-oval")
      .attr("cx", (d) => {
        // center at the hour + half hour offset if you prefer
        // But Apple Health typically centers at the hour
        console.log(d.hour);
        return vis.x(d.hour);
      })
      .attr("cy", (d) => {
        const mid = (d.min + d.max) / 2;
        return vis.y(mid);
      })
      .attr("rx", ellipseRx)
      .attr("ry", (d) => {
        const minY = vis.y(d.min);
        const maxY = vis.y(d.max);
        const halfSpan = Math.abs(maxY - minY) / 2;
        return halfSpan;
      })
      .attr("fill", "#ff2d55") // Apple Health–like pink
      .attr("opacity", 0.6)
      .on("click", (event, d) => {
        if (onHourClick) {
          onHourClick(d.hour);
        }
      });
  }
}
