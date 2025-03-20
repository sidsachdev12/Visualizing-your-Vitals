// src/DailyHeartRateRange.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
// import "./DailyHeartRateRange.css"; // Optional CSS for styling

function DailyHeartRateRange({ data, onDayClick }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !containerRef.current) return;
    d3.select(containerRef.current).select("svg").remove();

    // Group data by day (using YYYY-MM-DD)
    const dailyData = Array.from(
      d3.group(data, (d) => d3.timeFormat("%Y-%m-%d")(d.timestamp)),
      ([key, values]) => ({
        day: new Date(key),
        min: d3.min(values, (d) => d.heart_rate),
        max: d3.max(values, (d) => d.heart_rate),
        avg: d3.mean(values, (d) => d.heart_rate),
      })
    );

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const containerHeight = containerRef.current.getBoundingClientRect().height;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale (time scale for days)
    const x = d3
      .scaleTime()
      .domain(d3.extent(dailyData, (d) => d.day))
      .range([0, width]);
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeDay.every(1))
          .tickFormat(d3.timeFormat("%b %d"))
      );

    // Y scale (heart rate)
    const y = d3
      .scaleLinear()
      .domain([
        d3.min(dailyData, (d) => d.min) - 5,
        d3.max(dailyData, (d) => d.max) + 5,
      ])
      .range([height, 0]);
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // Draw a vertical line (bar) for each day representing the range
    svg
      .selectAll("line.range")
      .data(dailyData)
      .enter()
      .append("line")
      .attr("class", "range")
      .attr("x1", (d) => x(d.day))
      .attr("x2", (d) => x(d.day))
      .attr("y1", (d) => y(d.min))
      .attr("y2", (d) => y(d.max))
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      // When clicking on a day, call the onDayClick callback with the day
      .on("click", (event, d) => {
        if (onDayClick) onDayClick(d.day);
      });

    // Draw a circle at the average heart rate
    svg
      .selectAll("circle.avg")
      .data(dailyData)
      .enter()
      .append("circle")
      .attr("class", "avg")
      .attr("cx", (d) => x(d.day))
      .attr("cy", (d) => y(d.avg))
      .attr("r", 4)
      .attr("fill", "orange");
  }, [data, onDayClick]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "500px" }}></div>
  );
}

export default DailyHeartRateRange;
