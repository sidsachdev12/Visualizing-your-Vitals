class HeatMap {
  constructor(config) {
    this.parentElement = config.parentElement;
    this.data = config.data;
    this.margin = { top: 30, right: 50, bottom: 50, left: 60 };

    this.initVis();
  }

  initVis() {
    const vis = this;

    // Calculate width and height based on parent element
    vis.width =
      document.getElementById(vis.parentElement).getBoundingClientRect().width -
      vis.margin.left -
      vis.margin.right;
    vis.height =
      document.getElementById(vis.parentElement).getBoundingClientRect()
        .height -
      vis.margin.top -
      vis.margin.bottom;

    // Clear any existing SVG
    d3.select("#" + vis.parentElement)
      .select("svg")
      .remove();

    // Create SVG with appropriate dimensions
    vis.svg = d3
      .select("#" + vis.parentElement)
      .append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

    // x axis scale (now using the full width dynamically)
    vis.xScale = d3
      .scaleLinear()
      .domain([90, 120]) // Blood pressure range
      .range([0, vis.width]);

    // Create x-axis
    vis.xAxisGroup = vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${vis.height - vis.margin.bottom})`);

    // x axis label
    vis.svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", vis.width / 2)
      .attr("y", vis.height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Blood Pressure (mmHg)");

    // bubble size (dynamic based on visualization height)
    vis.sizeScale = d3
      .scaleSqrt()
      .domain([50, 120])
      .range([vis.height / 15, vis.height / 6]);

    // Create container for circles
    vis.circlesGroup = vis.svg.append("g").attr("class", "circles");

    // Create container for legend
    vis.legendGroup = vis.svg.append("g").attr("class", "legend");

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    // update fields
    vis.data.forEach((d) => {
      d.Age = +d.Age;
      d["Sleep Duration"] = +d["Sleep Duration"];
      d["Quality of Sleep"] = +d["Quality of Sleep"];
      d["Physical Activity Level"] = +d["Physical Activity Level"];
      d["Stress Level"] = +d["Stress Level"];

      if (d["Blood Pressure"]) {
        const parts = d["Blood Pressure"].split("/");
        d["Blood Pressure"] = (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
      } else {
        d["Blood Pressure"] = 0;
      }

      d["Heart Rate"] = +d["Heart Rate"];
      d["Daily Steps"] = +d["Daily Steps"];
      d.Cortisol = +d.Cortisol;

      // Normal Weight + Normal should be considered the same BMI category
      if (d["BMI Category"] === "Normal Weight") {
        d["BMI Category"] = "Normal";
      }
    });

    // aggregate the data
    const aggregate = {};
    vis.data.forEach((d) => {
      const bmi = d["BMI Category"];
      if (!aggregate[bmi]) {
        aggregate[bmi] = { count: 0, bpSum: 0, hrSum: 0, stepsSum: 0 };
      }
      aggregate[bmi].count++;
      aggregate[bmi].bpSum += d["Blood Pressure"];
      aggregate[bmi].hrSum += d["Heart Rate"];
      aggregate[bmi].stepsSum += d["Daily Steps"];
    });

    // calculate averages
    const avgData = [];
    for (const bmi in aggregate) {
      avgData.push({
        category: bmi,
        avgBloodPressure: aggregate[bmi].bpSum / aggregate[bmi].count,
        avgHeartRate: aggregate[bmi].hrSum / aggregate[bmi].count,
        avgDailySteps: aggregate[bmi].stepsSum / aggregate[bmi].count,
      });
    }

    vis.processedData = [
      {
        category: "Normal",
        bp:
          avgData.find((d) => d.category === "Normal")?.avgBloodPressure || 100,
        size: aggregate["Normal"]?.count || 50,
        color: "green",
      },
      {
        category: "Overweight",
        bp:
          avgData.find((d) => d.category === "Overweight")?.avgBloodPressure ||
          105,
        size: aggregate["Overweight"]?.count || 70,
        color: "orange",
      },
      {
        category: "Obese",
        bp:
          avgData.find((d) => d.category === "Obese")?.avgBloodPressure || 110,
        size: (aggregate["Obese"]?.count || 90) + 20,
        color: "red",
      },
    ];

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // Update x-axis
    const xAxis = d3.axisBottom(vis.xScale).ticks(5);
    vis.xAxisGroup.call(xAxis);

    // Calculate vertical center for circles
    const circleY = (vis.height - vis.margin.bottom) / 2;

    // Update circles with data binding pattern
    const circles = vis.circlesGroup
      .selectAll("circle")
      .data(vis.processedData);

    // Remove old circles
    circles.exit().remove();

    // Create new circles
    const circlesEnter = circles
      .enter()
      .append("circle")
      .attr("class", "data-point");

    // Update all circles (new and existing)
    circles
      .merge(circlesEnter)
      .transition()
      .duration(500)
      .attr("cx", (d) => vis.xScale(d.bp))
      .attr("cy", circleY)
      .attr("r", (d) => vis.sizeScale(d.size))
      .attr("fill", (d) => d.color)
      .style("opacity", 0.7)
      .style("stroke", "#333")
      .style("stroke-width", 1);

    // Position legend at right side of vis
    const legendX = vis.width - 120;
    const legendY = 20;

    // Clear old legend
    vis.legendGroup.selectAll("*").remove();

    // Create new legend
    vis.processedData.forEach((d, i) => {
      const legendItem = vis.legendGroup
        .append("g")
        .attr("transform", `translate(${legendX}, ${legendY + i * 15})`);

      legendItem
        .append("circle")
        .attr("r", 8)
        .attr("fill", d.color)
        .style("opacity", 0.7)
        .style("stroke", "#333")
        .style("stroke-width", 0.5);

      legendItem
        .append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text(() => {
          if (d.category === "Normal") return "Normal: 18.5–24.9 kg/m²";
          else if (d.category === "Overweight")
            return "Overweight: 25–29.9 kg/m²";
          else if (d.category === "Obese") return "Obese: >=30 kg/m²";
        })
        .style("font-size", "12px");
    });

    // Add tooltip functionality
    vis.circlesGroup
      .selectAll("circle")
      .on("mouseover", function (event, d) {
        // Get position of current circle
        const [x, y] = d3.pointer(event);

        // Show tooltip with BP value
        d3.select("#" + vis.parentElement)
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
          .style("background-color", "rgba(255, 255, 255, 0.9)")
          .style("border", "1px solid #ddd")
          .style("border-radius", "4px")
          .style("padding", "5px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .html(
            `<strong>${d.category}</strong><br>Blood Pressure: ${d.bp.toFixed(
              1
            )} mmHg<br>Count: ${d.size}`
          );

        // Highlight current circle
        d3.select(this).style("stroke-width", 2).style("opacity", 1);
      })
      .on("mouseout", function () {
        // Remove tooltip
        d3.select("#" + vis.parentElement)
          .selectAll(".tooltip")
          .remove();

        // Reset circle style
        d3.select(this).style("stroke-width", 1).style("opacity", 0.7);
      });
  }
}
