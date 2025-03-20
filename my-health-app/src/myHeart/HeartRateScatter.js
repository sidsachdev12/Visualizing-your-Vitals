// src/HeartRateScatter.js
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./myHeartPage.css"; // Ensure your CSS (with keyframes) is imported

// Import the heart SVG as a React component (Create React App or Vite)
import { ReactComponent as HeartIcon } from "../assets/heart.svg";

const parseTime = d3.timeParse("%Y-%m-%d %H:%M");

function HeartRateScatter({ data }) {
  const containerRef = useRef(null);
  const [currentHour, setCurrentHour] = useState(11);
  const currentDay = new Date(2023, 0, 1); // January 1, 2023
  const [avgHeartBeat, setAvgHeartBeat] = useState(60);

  useEffect(() => {
    if (!data || !containerRef.current) return;
    d3.select(containerRef.current).select("svg").remove();

    const container = containerRef.current;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const containerWidth = container.getBoundingClientRect().width;
    const containerHeight = container.getBoundingClientRect().height;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter data: same day and hour equal to currentHour.
    const filteredData = data.filter(
      (d) =>
        d.timestamp.getFullYear() === currentDay.getFullYear() &&
        d.timestamp.getMonth() === currentDay.getMonth() &&
        d.timestamp.getDate() === currentDay.getDate() &&
        d.timestamp.getHours() === currentHour
    );

    // X scale: minutes in the hour (0 to 60)
    const x = d3.scaleLinear().domain([0, 55]).range([0, width]);
    const xAxis = d3
      .axisBottom(x)
      .ticks(12)
      .tickFormat((d) => d + " min");
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    // Y scale: based on heart_rate values with padding.
    const yMin = d3.min(filteredData, (d) => d.heart_rate) || 50;
    const yMax = d3.max(filteredData, (d) => d.heart_rate) || 100;
    const newAvg = d3.mean(filteredData, (d) => d.heart_rate) || 60;
    const roundedAvg = Math.round(newAvg * 10) / 10;
    setAvgHeartBeat(roundedAvg);

    const y = d3
      .scaleLinear()
      .domain([yMin - 5, yMax + 5])
      .range([height, 0]);
    const yAxis = d3.axisLeft(y);
    svg.append("g").attr("class", "y-axis").call(yAxis);

    // Plot beating hearts instead of dots.
    // Each heart gets its own animation duration based on its heart_rate value.
    svg
      .selectAll("text.heart")
      .data(filteredData)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "heart")
            .attr("x", (d) => x(d.timestamp.getMinutes()))
            .attr("y", (d) => y(d.heart_rate))
            .attr("text-anchor", "middle")
            .attr("dy", ".35em") // Vertically center the text
            .text("❤")
            .attr("font-size", "25px")
            .attr("fill", "red")
            // Set animation duration based on heart_rate; for example:
            .style(
              "animation",
              (d) => `beat ${60 / d.heart_rate}s infinite ease-in-out`
            ),
        (update) =>
          update
            .transition()
            .duration(500)
            .attr("x", (d) => x(d.timestamp.getMinutes()))
            .attr("y", (d) => y(d.heart_rate))
            .style(
              "animation",
              (d) => `beat ${60 / d.heart_rate}s infinite ease-in-out`
            ),
        (exit) => exit.remove()
      );
  }, [data, currentHour]);

  function handlePrevHour() {
    setCurrentHour((h) => (h > 0 ? h - 1 : h));
  }
  function handleNextHour() {
    setCurrentHour((h) => (h < 23 ? h + 1 : h));
  }

  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <button onClick={handlePrevHour}>&larr;</button>
        <span style={{ margin: "0 10px" }}>
          {currentHour}:00 - {currentHour + 1}:00
        </span>
        <button onClick={handleNextHour}>&rarr;</button>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "400px" }}></div>
      <div className="heart-container">
        <h3>Your Average Health this Hour was {avgHeartBeat}</h3>
        <HeartIcon
          className="heart-icon"
          style={{
            animation: `beat ${60 / avgHeartBeat}s infinite ease-in-out`,
          }}
        />
      </div>
    </div>
  );
}

export default HeartRateScatter;
