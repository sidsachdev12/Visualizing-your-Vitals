class LineChart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      width: _config.width || 700,
      height: _config.height || 400,
      margin: _config.margin || { top: 30, right: 30, bottom: 50, left: 60 },
    };
    this.data = _config.data;
    this.annotations = _config.annotations;
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
      .attr("width", vis.config.width)
      .attr("height", vis.config.height)
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // init scale and line generator
    vis.xScale = d3.scaleLinear().range([0, vis.width]);

    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.lineGenerator = d3
      .line()
      .x((d) => vis.xScale(d.month))
      .y((d) => vis.yScale(d.cortisol))
      .curve(d3.curveMonotoneX);

    // add axis groups
    vis.xAxisG = vis.svg
      .append("g")
      .attr("transform", `translate(0, ${vis.height})`);

    vis.yAxisG = vis.svg.append("g");

    // add labels
    vis.svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + 35)
      .attr("text-anchor", "middle")
      .text("Months from Today");

    vis.svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -vis.height / 2)
      .attr("text-anchor", "middle")
      .text("Average Cortisol Level (ng/dL)");

    // add title
    vis.svg
      .append("text")
      .attr("class", "title")
      .attr("x", vis.width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .text("Cortisol Levels Over Time by Activity");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.workingData = vis.data.filter((d) => d.activity === "working");
    vis.restData = vis.data.filter((d) => d.activity === "resting");
    vis.meditatingData = vis.data.filter((d) => d.activity === "meditating");

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // update scales and axes
    vis.xScale.domain(d3.extent(vis.workingData, (d) => d.month));
    vis.yScale.domain([0, d3.max(vis.workingData, (d) => d.cortisol)]).nice();

    vis.xAxisG.call(d3.axisBottom(vis.xScale));
    vis.yAxisG.call(d3.axisLeft(vis.yScale));

    /*
        WORKING ----------------------------------------------------------
    */
    // draw line
    const lineSelectionworking = vis.svg
      .selectAll(".line-path-working")
      .data([vis.workingData]);

    lineSelectionworking.exit().remove();

    const lineEnterworking = lineSelectionworking
      .enter()
      .append("path")
      .attr("class", "line line-path");

    lineEnterworking
      .merge(lineSelectionworking)
      .transition()
      .duration(1000)
      .attr("d", vis.lineGenerator)
      .attr("stroke", "blue")
      .attr("fill", "none"); // add this line to remove the fill

    // add circles for each data point
    const circles = vis.svg
      .selectAll(".dot")
      .data(vis.workingData, (d) => d.month);

    circles.exit().remove();

    circles
      .enter()
      .append("circle")
      .attr("class", "workingDot")
      .attr("r", 3)
      .merge(circles)
      .transition()
      .duration(1000)
      .attr("cx", (d) => vis.xScale(d.month))
      .attr("cy", (d) => vis.yScale(d.cortisol));

    /*
      RESTING -------------------------------------------------------------
    */
    const lineSelectionRest = vis.svg
      .selectAll(".line-path-rest")
      .data([vis.restData]);

    lineSelectionRest.exit().remove();

    const lineEnterRest = lineSelectionRest
      .enter()
      .append("path")
      .attr("class", "line line-path");

    lineEnterRest
      .merge(lineSelectionRest)
      .transition()
      .duration(1000)
      .attr("d", vis.lineGenerator)
      .attr("stroke", "brown")
      .attr("fill", "none"); // add this line to remove the fill

    // add circles for each data point
    const circlesRest = vis.svg
      .selectAll(".dot")
      .data(vis.restData, (d) => d.month);

    circlesRest.exit().remove();

    circlesRest
      .enter()
      .append("circle")
      .attr("class", "restDot")
      .attr("r", 3)
      .merge(circlesRest)
      .transition()
      .duration(1000)
      .attr("cx", (d) => vis.xScale(d.month))
      .attr("cy", (d) => vis.yScale(d.cortisol));

    /*
      Meditating -------------------------------------------------------------
    */
    const lineSelectionMeditating = vis.svg
      .selectAll(".line-path-meditating")
      .data([vis.meditatingData]);

    lineSelectionMeditating.exit().remove();

    const lineEnterMeditating = lineSelectionMeditating
      .enter()
      .append("path")
      .attr("class", "line line-path");

    lineEnterMeditating
      .merge(lineSelectionMeditating)
      .transition()
      .duration(1000)
      .attr("d", vis.lineGenerator)
      .attr("stroke", "green")
      .attr("fill", "none"); // add this line to remove the fill

    // add circles for each data point
    const circlesMeditating = vis.svg
      .selectAll(".dot")
      .data(vis.meditatingData, (d) => d.month);

    circlesMeditating.exit().remove();

    circlesMeditating
      .enter()
      .append("circle")
      .attr("class", "meditatingDot")
      .attr("r", 3)
      .merge(circlesMeditating)
      .transition()
      .duration(1000)
      .attr("cx", (d) => vis.xScale(d.month))
      .attr("cy", (d) => vis.yScale(d.cortisol));

    // insert annotations
    const annotationGroup = vis.svg
      .selectAll(".annotation-group")
      .data(vis.annotations);

    annotationGroup.exit().remove();

    const annotationEnter = annotationGroup
      .enter()
      .append("g")
      .attr("class", "annotation-group");

    annotationEnter
      .append("text")
      .attr("class", "annotation")
      .attr("text-anchor", "start")
      .merge(annotationGroup.select("text"))
      .attr("x", (d) => vis.xScale(d.month) + 2)
      .attr("y", (d) => vis.yScale(d.cortisol) + 3)
      .text((d) => d.label);

    // add legend
    let legend = vis.svg.select(".legend");
    if (legend.empty()) {
      const legendData = [
        { name: "Working", color: "blue" },
        { name: "Resting", color: "brown" },
        { name: "Meditating", color: "green" },
      ];

      legend = vis.svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${vis.width - 100}, 10)`);

      legend
        .selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (d) => d.color);

      legend
        .selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 15)
        .attr("y", (d, i) => i * 20 + 9)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text((d) => d.name);
    }
  }
}
