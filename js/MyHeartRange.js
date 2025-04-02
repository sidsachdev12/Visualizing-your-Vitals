class MyHeartDailyRange {
  constructor(parentElement, data, selectedDay, onHourClickCallback = null) {
    this.parentElement = parentElement;
    this.data = data;
    this.onHourClickCallback = onHourClickCallback;

    this.filteredData = [];
    this.day = selectedDay;

    if (!document.getElementById("fixed-heart-tooltip")) {
      const tooltipDiv = document.createElement("div");
      tooltipDiv.id = "fixed-heart-tooltip";
      tooltipDiv.style.position = "absolute";
      tooltipDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      tooltipDiv.style.color = "white";
      tooltipDiv.style.padding = "10px";
      tooltipDiv.style.borderRadius = "5px";
      tooltipDiv.style.pointerEvents = "none";
      tooltipDiv.style.display = "none";
      tooltipDiv.style.zIndex = "10000";
      document.body.appendChild(tooltipDiv);
    }

    this.tooltipElement = document.getElementById("fixed-heart-tooltip");

    this.timeDisplay = document.getElementById("timeDisplay");

    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.timeDisplay.innerText = d3.timeFormat("%d %b, %Y")(vis.day);

    d3.select("#" + vis.parentElement)
      .select("svg")
      .remove();

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
      .domain([tempStartDate, tempEndDate])
      .range([0, vis.width]);

    vis.y = d3.scaleLinear().domain([50, 100]).range([vis.height, 0]);

    vis.xAxis = d3
      .axisBottom(vis.x)
      .ticks(d3.timeHour.every(3))
      .tickFormat(d3.timeFormat("%-I %p"));
    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(vis.xAxis);

    vis.yAxis = d3.axisLeft(vis.y).ticks(5);
    vis.svg.append("g").attr("class", "y-axis").call(vis.yAxis);

    vis.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - vis.margin.left)
      .attr("x", 0 - vis.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Heart Rate (bpm)");

    vis.wrangleData();
  }

  wrangleData() {
    const vis = this;

    vis.selectedDateStr = d3.timeFormat("%Y-%m-%d")(vis.day);

    vis.filteredData = vis.data.filter(
      (d) => d3.timeFormat("%Y-%m-%d")(d.timestamp) === vis.selectedDateStr
    );

    vis.hourlyData = Array.from(
      d3.group(vis.filteredData, (d) => d3.timeHour.floor(d.timestamp)),
      ([hour, values]) => ({
        hour,
        min: d3.min(values, (v) => v.heart_rate),
        max: d3.max(values, (v) => v.heart_rate),
        avg: d3.mean(values, (v) => v.heart_rate),
        count: values.length,
        values: values,
      })
    ).sort((a, b) => a.hour - b.hour);

    vis.globalMin = d3.min(vis.hourlyData, (d) => d.min) || 40;
    vis.globalMax = d3.max(vis.hourlyData, (d) => d.max) || 120;

    vis.startOfDay = d3.timeDay.floor(vis.hourlyData[0]?.hour || vis.day);
    vis.endOfDay = d3.timeDay.offset(vis.startOfDay, 1); // +1 day

    vis.newAvg = d3.mean(vis.filteredData, (d) => d.heart_rate) || 60;
    vis.roundedAvg = Math.round(vis.newAvg * 10) / 10;

    // Update avgHeartBeat display
    document.getElementById(
      "avgHeartBeat"
    ).innerText = `Your Average Heart Rate on this day was ${vis.roundedAvg} (accurate simulation)`;
    document.getElementById("heartIcon").style.animation = `beat ${
      60 / vis.roundedAvg
    }s infinite ease-in-out`;

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    vis.timeDisplay.innerText = d3.timeFormat("%d %b, %Y")(vis.day);

    vis.x.domain([vis.startOfDay, vis.endOfDay]);
    vis.y.domain([vis.globalMin - 5, vis.globalMax + 5]);

    const ellipseRx = 8;

    const ellipses = vis.svg
      .selectAll("ellipse.hour")
      .data(vis.hourlyData)
      .join("ellipse")
      .attr("class", "hour-oval")
      .attr("cx", (d) => vis.x(d.hour))
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
      .attr("fill", "#ff2d55")
      .attr("opacity", 0.6)
      .style("cursor", "pointer");

    ellipses.each(function (d) {
      const ellipse = this;

      // Mouseover event
      ellipse.addEventListener("mouseover", function (event) {
        d3.select(this)
          .attr("opacity", 1.0)
          .attr("stroke", "#ff0040")
          .attr("stroke-width", 2);

        // Create tooltip content
        const tooltipContent = `
          <div style="font-weight: bold">${d3.timeFormat("%-I %p")(
            d.hour
          )}</div>
          <div>Range: ${Math.round(d.min)} - ${Math.round(d.max)} bpm</div>
          <div>Avg: ${Math.round(d.avg * 10) / 10} bpm</div>
          <div>Readings: ${d.count}</div>
        `;

        // Update tooltip content and position
        vis.tooltipElement.innerHTML = tooltipContent;
        vis.tooltipElement.style.left = event.pageX + 15 + "px";
        vis.tooltipElement.style.top = event.pageY - 15 + "px";
        vis.tooltipElement.style.display = "block";
      });

      ellipse.addEventListener("mousemove", function (event) {
        vis.tooltipElement.style.left = event.pageX + 15 + "px";
        vis.tooltipElement.style.top = event.pageY - 15 + "px";
      });

      ellipse.addEventListener("mouseout", function () {
        d3.select(this).attr("opacity", 0.6).attr("stroke", "none");

        vis.tooltipElement.style.display = "none";
      });

      ellipse.addEventListener("click", function () {
        vis.tooltipElement.style.display = "none";
        if (vis.onHourClickCallback) {
          vis.onHourClickCallback(d);
        }
      });
    });
  }
}
