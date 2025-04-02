class sleepAreaChart {
  constructor(parentElement, data) {
    this.parentElement = parentElement;
    this.data = data;

    this.startDate = parseDate("2023-1-02");
    this.endDate = parseDate("2023-1-08");

    this.filteredData = [];

    this.formatDate = d3.timeFormat("%b %d, %y");
    this.parseDate = d3.timeParse("%Y-%m-%d");

    // Initialize tooltip div
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "sleep-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.3)");

    this.initViz();
  }

  initViz() {
    let viz = this;

    viz.margin = { top: 20, right: 100, bottom: 40, left: 50 };
    viz.width =
      document.getElementById(viz.parentElement).getBoundingClientRect().width -
      viz.margin.left -
      viz.margin.right;
    viz.height =
      document.getElementById(viz.parentElement).getBoundingClientRect()
        .height -
      viz.margin.top -
      viz.margin.bottom;

    viz.svg = d3
      .select("#" + viz.parentElement)
      .append("svg")
      .attr("width", viz.width + viz.margin.left + viz.margin.right)
      .attr("height", viz.height + viz.margin.top + viz.margin.bottom)
      .append("g")
      .attr("transform", `translate(${viz.margin.left},${viz.margin.top})`);

    // X scale (days of the week)
    viz.x = d3
      .scaleBand()
      .domain(viz.filteredData.map((d) => d.date))
      .range([0, viz.width])
      .padding(0.2);

    // Y scale (total sleep duration in hours)
    viz.y = d3.scaleLinear().domain([0, 12]).range([viz.height, 0]);

    // Color scale for sleep phases
    viz.color = d3
      .scaleOrdinal()
      .domain(["deep", "core", "rem", "awake"])
      .range(["#1f77b4", "#ff7f0e", "#ff8292", "#2ca02c"]);

    // Add X axis
    viz.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${viz.height})`)
      .call(d3.axisBottom(viz.x).tickFormat(viz.formatDate));

    // Add Y axis
    viz.svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(viz.y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -(viz.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .text("Hours");

    viz.leftArrow = d3.select("#left-arrow").on("click", () => {
      viz.updateDates(false);
    });

    viz.rightArrow = d3.select("#right-arrow").on("click", () => {
      viz.updateDates(true);
    });

    viz.wrangleData();
  }

  wrangleData() {
    const viz = this;

    // Filter the data based on the date range
    viz.filteredData = viz.data.filter((d) => {
      return d.date >= viz.startDate && d.date <= viz.endDate;
    });

    // Stack the data by sleep phases
    viz.stack = d3.stack().keys(["deep", "core", "rem", "awake"]);
    viz.stackedData = viz.stack(viz.filteredData);

    // Add the key property to each data point
    viz.stackedData.forEach((layer) => {
      layer.forEach((d) => {
        d.key = layer.key;
      });
    });

    viz.updateViz();
  }

  formatSleepDuration(hours) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  }

  updateViz() {
    let viz = this;

    viz.x.domain(viz.filteredData.map((d) => d.date));
    viz.y.domain([0, 12]);

    // Update the x-axis
    viz.svg
      .select(".x-axis")
      .call(d3.axisBottom(viz.x).tickFormat(viz.formatDate));

    if (viz.startDate <= parseDate("2023-1-02")) {
      viz.leftArrow.style("visibility", "hidden");
    } else {
      viz.leftArrow.style("visibility", "visible");
    }

    if (viz.endDate >= parseDate("2024-05-14")) {
      viz.rightArrow.style("visibility", "hidden");
    } else {
      viz.rightArrow.style("visibility", "visible");
    }

    // Bind the updated data to the bars
    viz.bars = viz.svg.selectAll(".bar").data(viz.stackedData.flat());

    // Remove old bars
    viz.bars.exit().remove();

    // Update existing bars
    viz.bars
      .attr("x", (d) => viz.x(d.data.date))
      .attr("y", (d) => viz.y(d[1]))
      .attr("height", (d) => viz.y(d[0]) - viz.y(d[1]))
      .attr("width", viz.x.bandwidth())
      .attr("fill", (d) => viz.color(d.key));

    // Add new bars with tooltip interactions
    viz.bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => viz.x(d.data.date))
      .attr("y", (d) => viz.y(d[1]))
      .attr("height", (d) => viz.y(d[0]) - viz.y(d[1]))
      .attr("width", viz.x.bandwidth())
      .attr("fill", (d) => viz.color(d.key))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        const duration = d[1] - d[0];

        const formattedDate = viz.formatDate(d.data.date);

        const dayOfWeek = d3.timeFormat("%A")(d.data.date);

        const sleepPhase = d.key.charAt(0).toUpperCase() + d.key.slice(1);

        const totalSleep =
          d.data.deep + d.data.core + d.data.rem + d.data.awake;

        const percentage = Math.round((duration / totalSleep) * 100);

        let tooltipContent = `
          <div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">
            ${dayOfWeek}, ${formattedDate}
          </div>
          <div style="margin: 5px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; background-color: ${viz.color(
              d.key
            )}; margin-right: 5px;"></span>
            <strong>${sleepPhase} Sleep:</strong> ${viz.formatSleepDuration(
          duration
        )}
          </div>
          <div style="margin: 5px 0;">
            <strong>Total Sleep:</strong> ${viz.formatSleepDuration(totalSleep)}
          </div>
          <div style="margin: 5px 0;">
            <strong>Percentage:</strong> ${percentage}% of sleep
          </div>
        `;

        // Show tooltip
        viz.tooltip
          .html(tooltipContent)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 15 + "px")
          .style("visibility", "visible")
          .transition()
          .duration(200)
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        viz.tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 15 + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke", "none");

        viz.tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
          .on("end", function () {
            viz.tooltip.style("visibility", "hidden");
          });
      });

    // Create legend
    viz.legend = d3
      .select("#legend")
      .selectAll("div")
      .data(viz.color.domain())
      .enter()
      .append("div")
      .attr("class", "legend")
      .style("color", (d) => viz.color(d))
      .html(
        (d) => `<span style="background-color:${viz.color(d)}"></span> ${d}`
      )
      .on("click", function (event, selectedGroup) {
        const selectedIndex = viz.color.domain().indexOf(selectedGroup);

        // Update the y-position and height of each bar
        viz.bars
          .transition()
          .duration(500)
          .attr("y", (d) => {
            let height = viz.y(d[0]) - viz.y(d[1]);
            let groupIndex = viz.color.domain().indexOf(d.key);
            if (groupIndex < selectedIndex) {
              return viz.y(d[1] - 60);
            } else if (groupIndex === selectedIndex) {
              return viz.y(0) - height;
            } else {
              return viz.y(d[1]);
            }
          })
          .attr("height", (d) => {
            let groupIndex = viz.color.domain().indexOf(d.key);
            if (groupIndex < selectedIndex) {
              return viz.y(d[0] - 60) - viz.y(d[1] - 60);
            } else {
              return viz.y(d[0]) - viz.y(d[1]);
            }
          });
      });

    d3.select(".legend").dispatch("click");
  }

  updateDates(future) {
    let viz = this;

    if (future) {
      viz.startDate = d3.timeDay.offset(viz.startDate, 7);
      viz.endDate = d3.timeDay.offset(viz.endDate, 7);
    } else {
      viz.startDate = d3.timeDay.offset(viz.startDate, -7);
      viz.endDate = d3.timeDay.offset(viz.endDate, -7);
    }

    viz.wrangleData();
  }
}
