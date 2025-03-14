class LineChart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      width: _config.width || 700,
      height: _config.height || 400,
      margin: _config.margin || { top: 30, right: 30, bottom: 50, left: 60 }
    };
    this.data = _config.data;
    this.annotations = _config.annotations;
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

    // create svg
    vis.svg = d3.select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.width)
      .attr("height", vis.config.height)
      .append("g")
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // init scale and line generator
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    vis.lineGenerator = d3.line()
      .x(d => vis.xScale(d.month))
      .y(d => vis.yScale(d.cortisol))
      .curve(d3.curveMonotoneX);

    // add axis groups
    vis.xAxisG = vis.svg.append("g")
      .attr("transform", `translate(0, ${vis.height})`);

    vis.yAxisG = vis.svg.append("g");

    // add labels
    vis.svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + 35)
      .attr("text-anchor", "middle")
      .text("Months from Today");

    vis.svg.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -vis.height / 2)
      .attr("text-anchor", "middle")
      .text("Average Cortisol Level (ng/dL)");
    
    // add title
    vis.svg.append("text")
      .attr("class", "title")
      .attr("x", vis.width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .text("Cortisol Levels Over Time");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // update scales and axes
    vis.xScale.domain(d3.extent(vis.data, d => d.month));
    vis.yScale.domain([0, d3.max(vis.data, d => d.cortisol)]).nice();

    vis.xAxisG.call(d3.axisBottom(vis.xScale));
    vis.yAxisG.call(d3.axisLeft(vis.yScale));

    // draw line
    const lineSelection = vis.svg.selectAll(".line-path")
      .data([vis.data]);

    lineSelection.exit().remove();

    const lineEnter = lineSelection.enter()
      .append("path")
      .attr("class", "line line-path");

    lineEnter.merge(lineSelection)
      .transition()
      .duration(1000)
      .attr("d", vis.lineGenerator)
      .attr("stroke", "blue");

    // add circles for each data point
    const circles = vis.svg.selectAll(".dot")
      .data(vis.data, d => d.month);

    circles.exit().remove();

    circles.enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 3)
      .merge(circles)
      .transition()
      .duration(1000)
      .attr("cx", d => vis.xScale(d.month))
      .attr("cy", d => vis.yScale(d.cortisol));

    // insert annotations
    const annotationGroup = vis.svg.selectAll(".annotation-group")
      .data(vis.annotations);

    annotationGroup.exit().remove();

    const annotationEnter = annotationGroup.enter()
      .append("g")
      .attr("class", "annotation-group");

    annotationEnter.append("text")
      .attr("class", "annotation")
      .attr("text-anchor", "start")
      .merge(annotationGroup.select("text"))
      .attr("x", d => vis.xScale(d.month) + 2)
      .attr("y", d => vis.yScale(d.cortisol) + 3)
      .text(d => d.label);
  }
}