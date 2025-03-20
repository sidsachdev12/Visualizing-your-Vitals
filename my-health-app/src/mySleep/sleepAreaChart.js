// src/SleepAreaChart.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./mySleepPage.css"; // Ensure your CSS is imported

// Define date parsing/formatting functions
const parseDate = d3.timeParse("%Y-%m-%d");
const formatDate = d3.timeFormat("%b %d, %y");

function SleepAreaChart({ data }) {
  const containerRef = useRef(null);

  let startDate = parseDate("2023-1-02");
  let endDate = parseDate("2023-1-08");

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Clear any previous SVG (for re-renders)
    d3.select(containerRef.current).select("svg").remove();

    // Set up dimensions based on container size
    const container = containerRef.current;
    const margin = { top: 20, right: 100, bottom: 40, left: 50 };
    const containerWidth = container.getBoundingClientRect().width;
    const containerHeight = container.getBoundingClientRect().height;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create the SVG and a group element for margin translation
    const svg = d3
      .select(container)
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define an initial date range
    let filteredData = data.filter(
      (d) => d.date >= startDate && d.date <= endDate
    );

    // Create scales for the x and y axes
    const x = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.date))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear().domain([0, 12]).range([height, 0]);

    // Color scale for the different sleep phases
    const color = d3
      .scaleOrdinal()
      .domain(["deep", "core", "rem", "awake"])
      .range(["#1f77b4", "#ff7f0e", "#ff8292", "#2ca02c"]);

    // Append the X axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(formatDate));

    // Append the Y axis
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // Set up the left/right arrow button event handlers
    d3.select(container)
      .select("#left-arrow")
      .on("click", () => updateDates(false));
    d3.select(container)
      .select("#right-arrow")
      .on("click", () => updateDates(true));

    // Create a stack layout for the sleep phases
    const stack = d3.stack().keys(["deep", "core", "rem", "awake"]);
    let stackedData = stack(filteredData);
    stackedData.forEach((layer) => {
      layer.forEach((d) => {
        d.key = layer.key; // Store the sleep phase in each data point
      });
    });

    // Function to update the visualization
    function updateViz() {
      x.domain(filteredData.map((d) => d.date));
      y.domain([0, 12]);

      svg.select(".x-axis").call(d3.axisBottom(x).tickFormat(formatDate));

      // Bind the data to the bar elements
      const bars = svg.selectAll(".bar").data(stackedData.flat());

      bars.exit().remove();

      // Update existing bars
      bars
        .attr("x", (d) => x(d.data.date))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("fill", (d) => color(d.key));

      // Append new bars
      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.data.date))
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("fill", (d) => color(d.key));

      // Create/update legend
      d3.select(container)
        .select("#legend")
        .selectAll("div")
        .data(color.domain())
        .join("div")
        .attr("class", "legend")
        .style("color", (d) => color(d))
        .html((d) => `<span style="background-color:${color(d)}"></span> ${d}`)
        .on("click", function (event, selectedGroup) {
          const selectedIndex = color.domain().indexOf(selectedGroup);
          svg
            .selectAll(".bar")
            .transition()
            .duration(500)
            .attr("y", (d) => {
              const barHeight = y(d[0]) - y(d[1]);
              const groupIndex = color.domain().indexOf(d.key);
              if (groupIndex < selectedIndex) {
                return y(d[1] - 60);
              } else if (groupIndex === selectedIndex) {
                return y(0) - barHeight;
              } else {
                return y(d[1]);
              }
            })
            .attr("height", (d) => {
              const groupIndex = color.domain().indexOf(d.key);
              if (groupIndex < selectedIndex) {
                return y(d[0] - 60) - y(d[1] - 60);
              } else {
                return y(d[0]) - y(d[1]);
              }
            });
        });

      // Trigger an initial legend click for a highlight effect
      d3.select(container).select(".legend").dispatch("click");
    }

    // Function to update the date range and re-filter data
    function updateDates(future) {
      const offset = future ? 7 : -7;
      startDate = d3.timeDay.offset(startDate, offset);
      endDate = d3.timeDay.offset(endDate, offset);
      filteredData = data.filter(
        (d) => d.date >= startDate && d.date <= endDate
      );
      stackedData = stack(filteredData);
      stackedData.forEach((layer) => {
        layer.forEach((d) => {
          d.key = layer.key;
        });
      });
      updateViz();
    }

    // Initial render of the visualization
    updateViz();
  }, [startDate, endDate]);

  return (
    <div id="sleepAreaChart" ref={containerRef} style={{ height: "100vh" }}>
      <div id="legend"></div>
      <div id="chart-container">
        <button id="left-arrow">&larr;</button>
        <div id="chart"></div>
        <button id="right-arrow">&rarr;</button>
      </div>
    </div>
  );
}

export default SleepAreaChart;
