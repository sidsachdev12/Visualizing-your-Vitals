class ScatterPlot {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      width: _config.width || 800,
      height: _config.height || 400,
      margin: _config.margin || { top: 30, right: 30, bottom: 50, left: 60 },
    };
    this.data = _config.data;
    this.variable = _config.variable || "Heart_Rate";
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width =
      document.getElementById(vis.config.parentElement).getBoundingClientRect()
        .width -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      document.getElementById(vis.config.parentElement).getBoundingClientRect()
        .height -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // create svg
    vis.svg = d3
      .select("#" + vis.config.parentElement)
      .append("svg")
      .attr(
        "width",
        vis.width + vis.config.margin.left + vis.config.margin.right
      )
      .attr(
        "height",
        vis.height + vis.config.margin.top + vis.config.margin.bottom
      )
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // scales
    vis.xScale = d3.scaleLinear().range([0, vis.width]);

    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    // axis groups
    vis.xAxisG = vis.svg
      .append("g")
      .attr("transform", `translate(0, ${vis.height})`);

    vis.yAxisG = vis.svg.append("g");

    // axis labels
    vis.svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + 35)
      .attr("text-anchor", "middle")
      .text("AGE");

    vis.svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -vis.height / 2)
      .attr("text-anchor", "middle")
      .text(vis.variable.replace("_", " ").toUpperCase());

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;
    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // update scales and axes
    vis.xScale.domain(d3.extent(vis.data, (d) => d.Age));
    vis.yScale.domain([0, d3.max(vis.data, (d) => d[vis.variable])]).nice();

    vis.xAxisG.call(d3.axisBottom(vis.xScale));
    vis.yAxisG.call(d3.axisLeft(vis.yScale));

    // draw circles
    const circles = vis.svg.selectAll(".dot").data(vis.data, (d) => d.Age);

    circles.exit().remove();

    circles
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 2)
      .attr("fill", "blue")
      .merge(circles)
      .transition()
      .duration(1000)
      .attr("cx", (d) => vis.xScale(d.Age))
      .attr("cy", (d) => vis.yScale(d[vis.variable]));
  }

  updateLine(selectedValue) {
    const vis = this;
    const xPos = vis.xScale(selectedValue);
    const lineSelection = vis.svg.selectAll(".user-line").data([selectedValue]);

    // Enter
    lineSelection
      .enter()
      .append("line")
      .attr("class", "user-line")
      .merge(lineSelection) // Update: merge and modify the existing line
      .transition()
      .duration(1000)
      .attr("x1", xPos)
      .attr("x2", xPos)
      .attr("y1", 0)
      .attr("y2", vis.height)
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,2");

    // Exit: remove any extra lines (if necessary)
    lineSelection.exit().remove();
  }
}
