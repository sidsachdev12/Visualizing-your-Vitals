// vis 1
d3.csv("./data/cortisol_trend_dataset.csv").then((data) => {
  data.forEach((d) => {
    d.month = +d.month;
    d.cortisol = +d.cortisol;
  });

  const annotations = [
    // { month: -24, cortisol: 24, label: "Exercising" },
    // { month: -12, cortisol: 14, label: "Meditation" }
  ];

  const lineChart = new LineChart({
    parentElement: "#lineChart",
    width: 800,
    height: 400,

    data: data,
    annotations: annotations,
  });
});

// vis 2
d3.csv("./data/ai_healthcare_dataset.csv").then((data) => {
  data.forEach((d) => {
    d.Age = +d.Age;
    d.Heart_Rate = +d.Heart_Rate;
  });

  const annotations = [];

  const scatterPlot = new ScatterPlot({
    parentElement: "#scatterPlot",
    width: 800,
    height: 400,
    data: data,
    variable: "Heart_Rate", // or a different variable if needed
  });

  // Listen for input changes
  document.getElementById("numInput").addEventListener("input", function () {
    // Get the current value from the input (make sure to convert it to a number)
    const userValue = +this.value;

    // Call the updateLine method to draw/update the line at the user-defined position
    scatterPlot.updateLine(userValue);
  });
});

// vis 3 – Using resting heart rate instead of entropy_heart
d3.csv("./data/sleep_lifestyle_dataset.csv").then((data) => {
  const heatMap = new HeatMap({
    parentElement: "#heatMap",
    data: data,
    width: 800,
    height: 500,
  });
});

// vis 4
d3.csv("./data/applewatch_fitbit_dataset.csv").then((data) => {
  data = data.map((d) => {
    return {
      height: +d.height,
      weight: +d.weight,
      rhr: +d.resting_heart_rate,
    };
  });
  const scatPlot = new ScatterPlot2({
    parentElement: "#scatter-plot-w",
    data: data,
    width: 800,
    height: 500,
  });
});

/// Your other code remains the same...

// Vis 4 - My Heart Rate
let mode = "daily"; // "daily" or "hourly"
let defaultDate = new Date(2023, 0, 1);
let selectedDay = defaultDate;
let selectedHour = selectedDay.getHours();
let heartDailyVis = null; // Store daily visualization instance
let heartScatterVis = null; // Store scatter visualization instance

// Define a parser for the timestamp using d3.timeParse
const parseTime = d3.timeParse("%Y-%m-%d %H:%M");

d3.csv("./data/heart_rate_data.csv", function (row) {
  // Parse the timestamp and convert heart_rate to a number.
  row.timestamp = parseTime(row.timestamp);
  row.heart_rate = +row.heart_rate;
  return row;
}).then((data) => {
  // Initial visualization
  MyHeartVisualizations();

  // Set up event listener for the back button
  document.getElementById("backBtn").addEventListener("click", () => {
    if (mode === "hourly") {
      mode = "daily";
    } else {
    }
    MyHeartVisualizations();
  });

  document.getElementById("prevHourBtn").addEventListener("click", () => {
    if (mode === "daily") {
      selectedDay = d3.timeDay.offset(selectedDay, -1);
    } else {
      selectedHour = selectedDay.getHours();
      selectedDay.setHours(selectedHour - 1);
    }
    MyHeartVisualizations();
  });

  document.getElementById("nextHourBtn").addEventListener("click", () => {
    if (mode === "daily") {
      selectedDay = d3.timeDay.offset(selectedDay, +1);
    } else {
      selectedHour = selectedDay.getHours();
      selectedDay.setHours(selectedHour + 1);
    }
    MyHeartVisualizations();
  });

  function MyHeartVisualizations() {
    if (mode === "daily") {
      document.getElementById("backBtn").hidden = true;
      // Callback function to handle ellipse click
      const onHourClick = (hourData) => {
        selectedDay = hourData.hour; // Store the selected day/hour
        mode = "hourly"; // Switch to hourly view
        MyHeartVisualizations(); // Redraw the visualization
      };

      if (selectedDay === defaultDate) {
        document.getElementById("prevHourBtn").hidden = true;
      } else {
        document.getElementById("prevHourBtn").hidden = false;
      }

      // Create daily range visualization with the callback and tooltip config
      heartDailyVis = new MyHeartDailyRange(
        "heart-scatter",
        data,
        selectedDay,
        onHourClick
      );

      // Clear reference to scatter visualization
      heartScatterVis = null;
    } else {
      document.getElementById("backBtn").hidden = false;

      if (selectedDay.getHours() === 23) {
        document.getElementById("nextHourBtn").hidden = true;
      } else {
        document.getElementById("nextHourBtn").hidden = false;
      }

      if (selectedDay.getHours() === 0) {
        document.getElementById("prevHourBtn").hidden = true;
      } else {
        document.getElementById("prevHourBtn").hidden = false;
      }

      // Filter data for the selected day/hour
      const hourlyData = data.filter(
        (d) =>
          d.timestamp.getFullYear() === selectedDay.getFullYear() &&
          d.timestamp.getMonth() === selectedDay.getMonth() &&
          d.timestamp.getDate() === selectedDay.getDate() &&
          d.timestamp.getHours() === selectedDay.getHours()
      );

      // Create hourly visualization with tooltip config
      heartScatterVis = new MyHeartScatter(
        "heart-scatter",
        hourlyData,
        selectedDay.getHours(),
        null // onBack callback not needed since we have a button
      );

      // Clear reference to daily visualization
      heartDailyVis = null;
    }
  }
});

// Parse a date string in the format "YYYY-MM-DD" into a JavaScript Date object
let parseDate = d3.timeParse("%Y-%m-%d");

// Format a JavaScript Date object into a string in the format "YYYY-MM-DD"
let formatDate = d3.timeFormat("%Y-%m-%d");

d3.csv("data/sleep_data.csv", (row) => {
  row.date = parseDate(row.date);
  row.total_sleep = +row.total_sleep / 60;
  row.awake = +row.awake / 60;
  row.rem = +row.rem / 60;
  row.core = +row.core / 60;
  row.deep = +row.deep / 60;
  row.awake_pct = +row.awake_pct;
  row.rem_pct = +row.rem_pct;
  row.core_pct = +row.core_pct;
  row.deep_pct = +row.deep_pct;

  return row;
}).then((data) => {
  sleepViz = new sleepAreaChart("sleep-chart", data); // Initialize visualization
});
