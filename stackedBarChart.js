class Visualization {
  constructor(data) {
    this.data = data;
    this.initViz();
    this.wrangleData();
  }

  // 1. Initialize the visualization
  initViz() {
    const viz = this;

    // Set up SVG container, scales, axes, etc.
    viz.margin = { top: 20, right: 30, bottom: 40, left: 40 };
    viz.width = 600 - viz.margin.left - viz.margin.right;
    viz.height = 400 - viz.margin.top - viz.margin.bottom;

    viz.svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", viz.width + viz.margin.left + viz.margin.right)
      .attr("height", viz.height + viz.margin.top + viz.margin.bottom)
      .append("g")
      .attr("transform", `translate(${viz.margin.left},${viz.margin.top})`);

    // X scale (days of the week)
    viz.x = d3.scaleBand().range([0, viz.width]).padding(0.2);

    // Y scale (total sleep duration in hours)
    viz.y = d3.scaleLinear().range([viz.height, 0]);

    // Color scale for sleep phases
    viz.color = d3
      .scaleOrdinal()
      .domain(["awake", "rem", "core", "deep"])
      .range(["#1f77b4", "#ff7f0e", "#ff8292", "#2ca02c"]);

    // Add X axis
    viz.svg
      .append("g")
      .attr("transform", `translate(0,${viz.height})`)
      .call(d3.axisBottom(viz.x));

    // Add Y axis
    viz.svg.append("g").call(d3.axisLeft(viz.y));
  }

  // 2. Process the data
  wrangleData() {
    const viz = this;

    // Stack the data by sleep phases
    viz.stack = d3.stack().keys(["awake", "rem", "core", "deep"]);
    viz.stackedData = viz.stack(viz.data);

    viz.updateViz();
  }

  // 3. Update the visualization
  updateViz() {
    const viz = this;

    // Update scales
    viz.x.domain(viz.data.map((d) => d.day)); // Days of the week
    viz.y.domain([0, d3.max(viz.stackedData, (d) => d3.max(d, (d) => d[1]))]); // Total sleep duration

    // Draw bars
    const bars = viz.svg.selectAll(".bar").data(viz.stackedData);

    bars
      .enter()
      .append("g")
      .attr("fill", (d) => viz.color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => viz.x(d.data.day))
      .attr("y", (d) => viz.y(d[1]))
      .attr("height", (d) => viz.y(d[0]) - viz.y(d[1]))
      .attr("width", viz.x.bandwidth());

    // Add labels for sleep phases
    bars
      .selectAll("text")
      .data((d) => d)
      .enter()
      .append("text")
      .attr("x", (d) => viz.x(d.data.day) + viz.x.bandwidth() / 2)
      .attr("y", (d) => (viz.y(d[0]) + viz.y(d[1])) / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) => d.key.toUpperCase());
  }
}

// Example data (replace this with your actual data)
const data = [
  { day: "Mon", awake: 1, rem: 6, deep: 5 },
  { day: "Tue", awake: 2, rem: 5, deep: 5 },
  { day: "Wed", awake: 1, rem: 6, deep: 5 },
  { day: "Thu", awake: 1, rem: 6, deep: 5 },
  { day: "Fri", awake: 2, rem: 5, deep: 5 },
  { day: "Sat", awake: 1, rem: 6, deep: 5 },
  { day: "Sun", awake: 1, rem: 6, deep: 5 },
];

// Create the visualization
const viz = new Visualization(data);
