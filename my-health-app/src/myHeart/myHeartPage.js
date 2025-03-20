// // src/HeartRateScatterContainer.js
// import React, { useEffect, useState } from "react";
// import * as d3 from "d3";
// import HeartRateScatter from "./HeartRateScatter";

// // Define a parser for the timestamp using d3.timeParse
// const parseTime = d3.timeParse("%Y-%m-%d %H:%M");

// function HeartRateScatterContainer() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     // Load the CSV file. The CSV should be placed in the public/data folder.
//     d3.csv("/data/heart_rate_data.csv", function (row) {
//       // Parse the timestamp and convert heart_rate to a number.
//       row.timestamp = parseTime(row.timestamp);
//       row.heart_rate = +row.heart_rate;
//       return row;
//     }).then((csvData) => {
//       setData(csvData);
//     });
//   }, []);

//   if (!data) return <div>Loading...</div>;
//   return <HeartRateScatter data={data} />;
// }

// export default HeartRateScatterContainer;
// src/HeartRateDashboard.js

import React, { useState } from "react";
import DailyHeartRateRange from "./DailyHeartRange";
import HeartRateScatter from "./HeartRateScatter";

function HeartRateDashboard({ data }) {
  const [mode, setMode] = useState("daily"); // "daily" or "hourly"
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setMode("hourly");
  };

  const handleBackToDaily = () => {
    setMode("daily");
    setSelectedDay(null);
  };

  return (
    <div>
      {mode === "daily" ? (
        <DailyHeartRateRange data={data} onDayClick={handleDayClick} />
      ) : (
        <HeartRateScatter
          data={data}
          selectedDay={selectedDay}
          onBack={handleBackToDaily}
        />
      )}
    </div>
  );
}

export default HeartRateDashboard;
