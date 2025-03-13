// Sample data
const data = [
  { category: "A", group1: 30, group2: 20, group3: 10 },
  { category: "B", group1: 40, group2: 10, group3: 20 },
  { category: "C", group1: 10, group2: 30, group3: 30 },
];

// Dimensions and margins
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG container
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// X scale (categories)
const x = d3
  .scaleBand()
  .domain(data.map((d) => d.category))
  .range([0, width])
  .padding(0.2);

// Y scale (values)
const y = d3
  .scaleLinear()
  .domain([0, 60]) // Adjust domain to include negative values
  .range([height, 0]);

// Color scale (groups)
const color = d3
  .scaleOrdinal()
  .domain(["group1", "group2", "group3"])
  .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

// Stack the data
const stack = d3.stack().keys(["group1", "group2", "group3"]);

let stackedData = stack(data);

// Draw bars
const bars = svg
  .selectAll(".category")
  .data(stackedData)
  .enter()
  .append("g")
  .attr("fill", (d) => color(d.key)) // Color based on the group key
  .selectAll("rect")
  .data((d) => {
    // Add the group key to each data point
    return d.map((point) => ({ ...point, key: d.key }));
  })
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", (d) => x(d.data.category))
  .attr("y", (d) => y(d[1]))
  .attr("height", (d) => y(d[0]) - y(d[1]))
  .attr("width", x.bandwidth());

// Add X axis
svg
  .append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x));

// Add Y axis
svg.append("g").call(d3.axisLeft(y));

// Create legend
const legend = d3
  .select("#legend")
  .selectAll("div")
  .data(color.domain())
  .enter()
  .append("div")
  .attr("class", "legend")
  .style("color", (d) => color(d))
  .text((d) => d)
  .on("click", function (event, selectedGroup) {
    // Find the index of the selected group
    const selectedIndex = color.domain().indexOf(selectedGroup);

    // Update the y-position and height of each bar
    bars
      .transition()
      .duration(500)
      .attr("y", (d) => {
        const groupIndex = color.domain().indexOf(d.key);
        if (groupIndex < selectedIndex) {
          // Move groups below the selected group below the x-axis
          return y(d[1] - 60); // Adjust offset as needed
        } else if (groupIndex === selectedIndex) {
          // Place the selected group on the x-axis
          return y(0) - (y(d[0]) - y(d[1])); // Adjust y-position to snap to x-axis
        } else {
          // Keep groups above the selected group in their original positions
          return y(d[1]);
        }
      })
      .attr("height", (d) => {
        const groupIndex = color.domain().indexOf(d.key);
        if (groupIndex < selectedIndex) {
          // Adjust height for groups below the selected group
          return y(d[0] - 60) - y(d[1] - 60);
        } else if (groupIndex === selectedIndex) {
          // Keep the height of the selected group the same
          return y(d[0]) - y(d[1]);
        } else {
          // Keep the height for groups above the selected group
          return y(d[0]) - y(d[1]);
        }
      });
  });

// Initial highlight (optional)
d3.select(".legend").dispatch("click");
