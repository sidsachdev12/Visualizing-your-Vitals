class MyHeartScatter {
  constructor(parentElement, data, selectedHour, onBack) {
    this.parentElement = parentElement;
    this.data = data;
    this.selectedHour = selectedHour;
    this.onBack = onBack;

    this.filteredData = [];

    this.initVis();
  }

  initVis() {
    const vis = this;

    document.getElementById("prevHourBtn").addEventListener("click", () => {
      vis.selectedHour =
        vis.selectedHour > 0 ? vis.selectedHour - 1 : vis.selectedHour;

      vis.wrangleData();
    });

    document.getElementById("nextHourBtn").addEventListener("click", () => {
      vis.selectedHour =
        vis.selectedHour < 23 ? vis.selectedHour + 1 : vis.selectedHour;

      vis.wrangleData();
    });

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

    // X scale: minutes in the hour (0 to 60)
    vis.x = d3.scaleLinear().domain([0, 55]).range([0, vis.width]);
    vis.xAxis = d3
      .axisBottom(vis.x)
      .ticks(12)
      .tickFormat((d) => d + " min");
    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(vis.xAxis);

    vis.y = d3.scaleLinear().domain([60, 120]).range([vis.height, 0]);
    vis.yAxis = d3.axisLeft(vis.y);
    vis.svg.append("g").attr("class", "y-axis").call(vis.yAxis);

    vis.wrangleData();
  }

  wrangleData() {
    const vis = this;

    vis.filteredData = vis.data.filter(
      (d) => d.timestamp.getHours() === vis.selectedHour
    );

    // Y scale: based on heart_rate values with padding.
    vis.yMin = d3.min(vis.filteredData, (d) => d.heart_rate) || 50;
    vis.yMax = d3.max(vis.filteredData, (d) => d.heart_rate) || 100;
    vis.newAvg = d3.mean(vis.filteredData, (d) => d.heart_rate) || 60;
    vis.roundedAvg = Math.round(vis.newAvg * 10) / 10;

    // Update avgHeartBeat display
    document.getElementById("avgHeartBeat").textContent = vis.roundedAvg;
    document.getElementById("heartIcon").style.animation = `beat ${
      60 / vis.roundedAvg
    }s infinite ease-in-out`;

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // Update the hour display
    document.getElementById("hourDisplay").textContent = `${
      vis.selectedHour
    }:00 - ${vis.selectedHour + 1}:00`;

    // Update y scale domain based on data range
    vis.y.domain([vis.yMin - 5, vis.yMax + 5]);

    // Update y-axis
    vis.svg.select(".y-axis").transition().duration(500).call(vis.yAxis);

    vis.svg
      .selectAll("text.heart")
      .data(vis.filteredData)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "heart")
            .attr("x", (d) => vis.x(d.timestamp.getMinutes()))
            .attr("y", (d) => vis.y(d.heart_rate))
            .attr("text-anchor", "middle")
            .attr("dy", ".35em") // Vertically center the text
            .text("❤")
            .attr("font-size", "25px")
            .attr("fill", "red")
            // Set animation duration based on heart_rate; for example:
            .style("animation", (d) => {
              // Apply logarithmic transformation for more dramatic visual effect
              // This makes fast heart rates appear much faster and slow rates appear slower
              const baseRate = 60 / d.heart_rate; // Standard calculation
              const logFactor = Math.log(d.heart_rate / 72) + 1; // Log transform centered around normal heart rate
              const adjustedRate = baseRate / logFactor;

              // Clamp to reasonable values (between 0.2s and 2s)
              const finalRate = Math.max(0.2, Math.min(2, adjustedRate));
              return `beat ${finalRate}s infinite ease-in-out`;
            }),
        (update) =>
          update
            .transition()
            .duration(500)
            .attr("x", (d) => vis.x(d.timestamp.getMinutes()))
            .attr("y", (d) => vis.y(d.heart_rate))
            .style("animation", (d) => {
              // Apply logarithmic transformation for more dramatic visual effect
              // This makes fast heart rates appear much faster and slow rates appear slower
              const baseRate = 60 / d.heart_rate; // Standard calculation
              const logFactor = Math.log(d.heart_rate / 72) + 1; // Log transform centered around normal heart rate
              const adjustedRate = baseRate / logFactor;

              // Clamp to reasonable values (between 0.2s and 2s)
              const finalRate = Math.max(0.2, Math.min(2, adjustedRate));
              return `beat ${finalRate}s infinite ease-in-out`;
            }),
        (exit) => exit.remove()
      );
  }
}
