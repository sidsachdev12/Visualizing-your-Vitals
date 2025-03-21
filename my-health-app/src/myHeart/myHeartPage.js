import React, { useState, useEffect } from "react";
import * as d3 from "d3";

import DailyHeartRateRange from "./DailyHeartRange";
import HeartRateScatter from "./HeartRateScatter";

// Define a parser for the timestamp using d3.timeParse
const parseTime = d3.timeParse("%Y-%m-%d %H:%M");

function HeartRateDashboard() {
  const [mode, setMode] = useState("daily"); // "daily" or "hourly"
  const defaultDate = new Date(1, 0, 2023);
  const [selectedDay, setSelectedDay] = useState(defaultDate);

  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    // Load the CSV file. The CSV should be placed in the public/data folder.
    d3.csv("/data/heart_rate_data.csv", function (row) {
      // Parse the timestamp and convert heart_rate to a number.
      row.timestamp = parseTime(row.timestamp);
      row.heart_rate = +row.heart_rate;
      return row;
    }).then((csvData) => {
      setData(csvData);
    });
  }, []);

  const handleHourClick = (day) => {
    setSelectedDay(day);
    setMode("hourly");

    const hourlyData = data.filter(
      (d) =>
        d.timestamp.getFullYear() === day.getFullYear() &&
        d.timestamp.getMonth() === day.getMonth() &&
        d.timestamp.getDate() === day.getDate()
    );

    setFilteredData(hourlyData);
  };

  const handleBackToDaily = () => {
    setMode("daily");
    setSelectedDay(null);
  };

  return (
    <div>
      {mode === "daily" ? (
        <DailyHeartRateRange data={data} onHourClick={handleHourClick} />
      ) : (
        <HeartRateScatter
          data={filteredData}
          selectedHour={selectedDay.getHours()}
          onBack={handleBackToDaily}
        />
      )}
    </div>
  );
}

export default HeartRateDashboard;
