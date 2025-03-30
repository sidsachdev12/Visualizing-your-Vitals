class sleepAreaChart {
  constructor(parentElement, data) {
    this.parentElement = parentElement;
    this.data = data;

    // Define the date range
    this.startDate = parseDate("2023-1-02");
    this.endDate = parseDate("2023-1-08");

    // Filter the data based on the date range
    this.filteredData = [];

    this.formatDate = d3.timeFormat("%b %d, %y");
    this.parseDate = d3.timeParse("%Y-%m-%d");

    this.initViz();
  }

  // 1. Initialize the visualization
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
    // Create SVG container
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
    viz.svg.append("g").attr("class", "y-axis").call(d3.axisLeft(viz.y));

    viz.leftArrow = d3.select("#left-arrow").on("click", () => {
      viz.updateDates(false);
    });

    viz.rightArrow = d3.select("#right-arrow").on("click", () => {
      viz.updateDates(true);
    });

    viz.wrangleData();
  }

  // 2. Process the data
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
        d.key = layer.key; // Add the key property
      });
    });

    viz.updateViz();
  }

  // 3. Draw and update the visualization
  updateViz() {
    let viz = this;
    // Update scales
    viz.x.domain(viz.filteredData.map((d) => d.date)); // Days of the week
    viz.y.domain([0, 12]); // Total sleep duration

    // Update the x-axis
    viz.svg
      .select(".x-axis") // Select the existing x-axis group
      .call(d3.axisBottom(viz.x).tickFormat(viz.formatDate)); // Re-render the x-axis

    console.log(viz.startDate);

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
      .attr("fill", (d) => viz.color(d.key)); // Use the key property for color

    // Add new bars
    viz.bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => viz.x(d.data.date))
      .attr("y", (d) => viz.y(d[1]))
      .attr("height", (d) => viz.y(d[0]) - viz.y(d[1]))
      .attr("width", viz.x.bandwidth())
      .attr("fill", (d) => viz.color(d.key)); // Use the key property for color

    // Create legend
    viz.legend = d3
      .select("#legend")
      .selectAll("div")
      .data(viz.color.domain())
      .enter()
      .append("div")
      .attr("class", "legend")
      .style("color", (d) => viz.color(d)) // Set text color
      .html(
        (d) => `<span style="background-color:${viz.color(d)}"></span> ${d}`
      ) // Add color box
      .on("click", function (event, selectedGroup) {
        // Find the index of the selected group
        const selectedIndex = viz.color.domain().indexOf(selectedGroup);

        // Update the y-position and height of each bar
        viz.bars
          .transition()
          .duration(500)
          .attr("y", (d) => {
            let height = viz.y(d[0]) - viz.y(d[1]);
            let groupIndex = viz.color.domain().indexOf(d.key);
            if (groupIndex < selectedIndex) {
              // Move groups below the selected group below the x-axis
              return viz.y(d[1] - 60); // Adjust offset as needed
            } else if (groupIndex === selectedIndex) {
              // Place the selected group on the x-axis
              return viz.y(0) - height; // Adjust y-position to snap to x-axis
            } else {
              // Keep groups above the selected group in their original positions
              return viz.y(d[1]);
            }
          })
          .attr("height", (d) => {
            let groupIndex = viz.color.domain().indexOf(d.key);
            if (groupIndex < selectedIndex) {
              // Adjust height for groups below the selected group
              return viz.y(d[0] - 60) - viz.y(d[1] - 60);
            } else {
              // Keep the height of the selected group the same
              return viz.y(d[0]) - viz.y(d[1]);
            }
          });
      });

    // Initial highlight (optional)
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
