class MyHeartScatter {
  constructor(
    parentElement,
    data,
    selectedHour,
    onBack = null,
    tooltipConfig = {}
  ) {
    this.parentElement = parentElement;
    this.data = data;
    this.selectedHour = selectedHour;
    this.onBack = onBack;
    this.timeDisplay = document.getElementById("timeDisplay");

    this.tooltipConfig = {
      backgroundColor:
        tooltipConfig.backgroundColor || "rgba(255, 255, 255, 0.9)",
      textColor: tooltipConfig.textColor || "#333",
      borderColor: tooltipConfig.borderColor || "#ff2d55",
      borderWidth: tooltipConfig.borderWidth || 1,
      borderRadius: tooltipConfig.borderRadius || 4,
      padding: tooltipConfig.padding || 8,
      fontSize: tooltipConfig.fontSize || "12px",
      showTime:
        tooltipConfig.showTime !== undefined ? tooltipConfig.showTime : true,
      showHeartRate:
        tooltipConfig.showHeartRate !== undefined
          ? tooltipConfig.showHeartRate
          : true,
      showComparison:
        tooltipConfig.showComparison !== undefined
          ? tooltipConfig.showComparison
          : true,
      customFormat: tooltipConfig.customFormat || null,
    };

    this.filteredData = [];

    this.tooltip = d3.select("body").select(".heart-rate-tooltip");
    if (this.tooltip.empty()) {
      this.tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "heart-rate-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", this.tooltipConfig.backgroundColor)
        .style("color", this.tooltipConfig.textColor)
        .style(
          "border",
          `${this.tooltipConfig.borderWidth}px solid ${this.tooltipConfig.borderColor}`
        )
        .style("border-radius", `${this.tooltipConfig.borderRadius}px`)
        .style("padding", `${this.tooltipConfig.padding}px`)
        .style("font-size", this.tooltipConfig.fontSize)
        .style("pointer-events", "none")
        .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.1)")
        .style("z-index", "1000");
    }

    this.initVis();
  }

  initVis() {
    const vis = this;

    // Update the hour display
    vis.timeDisplay.innerText = `${vis.selectedHour}:00 - ${
      vis.selectedHour + 1
    }:00`;

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

    // Add axis labels
    vis.svg
      .append("text")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + vis.margin.bottom - 5)
      .attr("text-anchor", "middle")
      .text("Minutes");

    vis.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(vis.height / 2))
      .attr("y", -vis.margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Heart Rate (bpm)");

    // Add average line group
    vis.avgLineGroup = vis.svg.append("g").attr("class", "avg-line-group");

    vis.wrangleData();
  }

  wrangleData() {
    const vis = this;

    vis.filteredData = vis.data.filter(
      (d) => d.timestamp.getHours() === vis.selectedHour
    );

    vis.yMin = d3.min(vis.filteredData, (d) => d.heart_rate) || 50;
    vis.yMax = d3.max(vis.filteredData, (d) => d.heart_rate) || 100;
    vis.newAvg = d3.mean(vis.filteredData, (d) => d.heart_rate) || 60;
    vis.roundedAvg = Math.round(vis.newAvg * 10) / 10;

    // Update avgHeartBeat display
    document.getElementById(
      "avgHeartBeat"
    ).innerText = `Your Average Heart Rate during this hour was ${vis.roundedAvg} (accurate simulation)`;
    document.getElementById("heartIcon").style.animation = `beat ${
      60 / vis.roundedAvg
    }s infinite ease-in-out`;

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    vis.y.domain([vis.yMin - 5, vis.yMax + 5]);

    vis.svg.select(".y-axis").transition().duration(500).call(vis.yAxis);

    // Draw average line
    vis.avgLineGroup.selectAll(".avg-line").remove();
    vis.avgLineGroup.selectAll(".avg-label").remove();

    vis.avgLineGroup
      .append("line")
      .attr("class", "avg-line")
      .attr("x1", 0)
      .attr("y1", vis.y(vis.roundedAvg))
      .attr("x2", vis.width)
      .attr("y2", vis.y(vis.roundedAvg))
      .attr("stroke", "#ff2d55")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,5");

    vis.avgLineGroup
      .append("text")
      .attr("class", "avg-label")
      .attr("x", vis.width - 5)
      .attr("y", vis.y(vis.roundedAvg) - 5)
      .attr("text-anchor", "end")
      .attr("fill", "#ff2d55")
      .text(`Avg: ${vis.roundedAvg} bpm`);

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
            .attr("dy", ".35em")
            .text("❤")
            .attr("font-size", "25px")
            .attr("fill", (d) => {
              if (d.heart_rate > vis.roundedAvg + 10) return "#ff3b30";
              if (d.heart_rate > vis.roundedAvg) return "#ff9500";
              if (d.heart_rate < vis.roundedAvg - 10) return "#007aff";
              if (d.heart_rate < vis.roundedAvg) return "#5ac8fa";
              return "#ff2d55";
            })

            .style("animation", (d) => {
              const baseRate = 60 / d.heart_rate;
              const logFactor = Math.log(d.heart_rate / 72) + 1;
              const adjustedRate = baseRate / logFactor;

              const finalRate = Math.max(0.2, Math.min(2, adjustedRate));
              return `beat ${finalRate}s infinite ease-in-out`;
            })
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("font-size", "32px");

              let tooltipContent = "";

              if (vis.tooltipConfig.customFormat) {
                tooltipContent = vis.tooltipConfig.customFormat(
                  d,
                  vis.roundedAvg
                );
              } else {
                if (vis.tooltipConfig.showTime) {
                  const timeFormat = d3.timeFormat("%H:%M:%S");
                  tooltipContent += `<div><strong>${timeFormat(
                    d.timestamp
                  )}</strong></div>`;
                }

                if (vis.tooltipConfig.showHeartRate) {
                  tooltipContent += `<div>Heart Rate: <strong>${Math.round(
                    d.heart_rate
                  )} bpm</strong></div>`;
                }

                if (vis.tooltipConfig.showComparison) {
                  const diff = d.heart_rate - vis.roundedAvg;
                  const diffStr =
                    diff >= 0
                      ? `+${Math.round(diff * 10) / 10}`
                      : `${Math.round(diff * 10) / 10}`;
                  tooltipContent += `<div>Compared to average: <strong>${diffStr} bpm</strong></div>`;
                }
              }

              vis.tooltip
                .html(tooltipContent)
                .style("visibility", "visible")
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            })
            .on("mousemove", function (event) {
              vis.tooltip
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
            })
            .on("mouseout", function () {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("font-size", "25px");

              vis.tooltip.style("visibility", "hidden");
            }),
        (update) =>
          update
            .transition()
            .duration(500)
            .attr("x", (d) => vis.x(d.timestamp.getMinutes()))
            .attr("y", (d) => vis.y(d.heart_rate))
            .attr("fill", (d) => {
              // Color based on relation to average
              if (d.heart_rate > vis.roundedAvg + 10) return "#ff3b30";
              if (d.heart_rate > vis.roundedAvg) return "#ff9500";
              if (d.heart_rate < vis.roundedAvg - 10) return "#007aff";
              if (d.heart_rate < vis.roundedAvg) return "#5ac8fa";
              return "#ff2d55";
            })
            .style("animation", (d) => {
              const baseRate = 60 / d.heart_rate;
              const logFactor = Math.log(d.heart_rate / 72) + 1;
              const adjustedRate = baseRate / logFactor;

              const finalRate = Math.max(0.2, Math.min(2, adjustedRate));
              return `beat ${finalRate}s infinite ease-in-out`;
            }),
        (exit) => exit.remove()
      );
  }
}
