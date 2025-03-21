import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./DailyHeartRange.css"; // optional styling

function HeartRateDailyOvals({ data, onHourClick }) {
  const containerRef = useRef(null);

  const currDate = new Date(2023, 0, 1);
  const [today, setToday] = useState(currDate);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Clear any existing chart
    d3.select(containerRef.current).select("svg").remove();

    // Format the selected day as "YYYY-MM-DD"
    const selectedDateStr = d3.timeFormat("%Y-%m-%d")(today);

    // Filter the full data array to only include records from the selected day.
    const filteredData = data.filter(
      (d) => d3.timeFormat("%Y-%m-%d")(d.timestamp) === selectedDateStr
    );

    // Group the filtered data by hour
    const hourlyData = Array.from(
      d3.group(filteredData, (d) => d3.timeHour.floor(d.timestamp)),
      ([hour, values]) => ({
        hour, // Date object representing the hour (e.g., 2023-03-20 07:00)
        min: d3.min(values, (v) => v.heart_rate),
        max: d3.max(values, (v) => v.heart_rate),
      })
    ).sort((a, b) => a.hour - b.hour);

    // Basic dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const containerHeight = containerRef.current.getBoundingClientRect().height;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Append an SVG
    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Find overall min & max heart rate for y-scale
    const globalMin = d3.min(hourlyData, (d) => d.min) || 40;
    const globalMax = d3.max(hourlyData, (d) => d.max) || 120;

    // x-scale: from earliest hour to the next day’s hour
    // Or just 0–24 if you always show a full day
    const startOfDay = d3.timeDay.floor(hourlyData[0].hour);
    const endOfDay = d3.timeDay.offset(startOfDay, 1); // +1 day

    const x = d3
      .scaleTime()
      .domain([startOfDay, endOfDay]) // midnight to midnight
      .range([0, width]);

    // y-scale: min to max heart rate (with some padding)
    const y = d3
      .scaleLinear()
      .domain([globalMin - 5, globalMax + 5])
      .range([height, 0]);

    // x-axis: maybe tick every 2 or 3 hours
    const xAxis = d3
      .axisBottom(x)
      .ticks(d3.timeHour.every(3))
      .tickFormat(d3.timeFormat("%-I %p")); // e.g. "12 AM"
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    // y-axis: a few ticks
    const yAxis = d3.axisLeft(y).ticks(5);
    svg.append("g").attr("class", "y-axis").call(yAxis);

    // For each hour, draw an ellipse covering min..max
    // Ellipse center: ( x(hour + half?), y(midpoint of min & max) )
    // Ellipse rx: a small fixed horizontal radius
    // Ellipse ry: half the vertical distance between min & max
    const ellipseRx = 8; // horizontal radius in pixels
    svg
      .selectAll("ellipse.hour")
      .data(hourlyData)
      .join("ellipse")
      .attr("class", "hour-oval")
      .attr("cx", (d) => {
        // center at the hour + half hour offset if you prefer
        // But Apple Health typically centers at the hour
        return x(d.hour);
      })
      .attr("cy", (d) => {
        const mid = (d.min + d.max) / 2;
        return y(mid);
      })
      .attr("rx", ellipseRx)
      .attr("ry", (d) => {
        const minY = y(d.min);
        const maxY = y(d.max);
        const halfSpan = Math.abs(maxY - minY) / 2;
        return halfSpan;
      })
      .attr("fill", "#ff2d55") // Apple Health–like pink
      .attr("opacity", 0.6)
      .on("click", (event, d) => {
        if (onHourClick) {
          onHourClick(d.hour);
        }
      });

    // Optional: add a small dot for the min or max, or label text
  }, [data, today]);

  function handlePrevDay() {
    const nextDate = d3.timeDay.offset(today, 1);
    setToday(nextDate);
  }
  function handleNextDay() {
    const prevDate = d3.timeDay.offset(today, -1);
    setToday(prevDate);
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "400px", background: "#000" }}
    >
      <button onClick={handleNextDay}>&larr;</button>
      <span style={{ margin: "0 10px", fontSize: "18px", color: "#333" }}>
        {today.toLocaleDateString()}
      </span>
      <button onClick={handlePrevDay}>&rarr;</button>
    </div>
  );
}

export default HeartRateDailyOvals;
