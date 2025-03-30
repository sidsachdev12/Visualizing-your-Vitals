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
let selectedHourData = null; // Variable to store the clicked hour data
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
    } else if (mode === "daily") {
      // If you want to go back to a previous state or do something else
      // Add your logic here
    }

    MyHeartVisualizations();
  });

  // Set up tooltip theme selectors
  setupTooltipThemeSelectors();

  function MyHeartVisualizations() {
    if (mode === "daily") {
      // Callback function to handle ellipse click
      const onHourClick = (hourData) => {
        console.log("Hour clicked in main.js:", hourData);
        selectedDay = hourData.hour; // Store the selected day/hour
        selectedHourData = hourData; // Store the hour data
        mode = "hourly"; // Switch to hourly view
        MyHeartVisualizations(); // Redraw the visualization
      };

      // Create daily range visualization with the callback and tooltip config
      heartDailyVis = new MyHeartDailyRange(
        "heart-scatter",
        data,
        onHourClick,
        tooltipThemes[currentTooltipTheme] // Pass current tooltip theme
      );

      // Clear reference to scatter visualization
      heartScatterVis = null;
    } else {
      // Filter data for the selected day/hour
      const hourlyData = data.filter(
        (d) =>
          d.timestamp.getFullYear() === selectedDay.getFullYear() &&
          d.timestamp.getMonth() === selectedDay.getMonth() &&
          d.timestamp.getDate() === selectedDay.getDate() &&
          (selectedHourData
            ? d.timestamp.getHours() === selectedDay.getHours()
            : true)
      );

      // Create hourly visualization with tooltip config
      heartScatterVis = new MyHeartScatter(
        "heart-scatter",
        hourlyData,
        selectedDay.getHours(),
        null, // onBack callback not needed since we have a button
        tooltipThemes[currentTooltipTheme] // Pass current tooltip theme
      );

      // Clear reference to daily visualization
      heartDailyVis = null;
    }
  }

  // Function to set up tooltip theme selector event listeners
  function setupTooltipThemeSelectors() {
    // If you have radio buttons or dropdown for tooltip themes
    const themeSelector = document.getElementById("tooltip-theme-selector");
    if (themeSelector) {
      themeSelector.addEventListener("change", function () {
        currentTooltipTheme = this.value;
        updateTooltipTheme();
      });
    }

    // If you have individual buttons for each theme
    const themeButtons = document.querySelectorAll(".tooltip-theme-btn");
    themeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const themeName = this.dataset.theme;
        currentTooltipTheme = themeName;

        // Highlight active button
        themeButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        updateTooltipTheme();
      });
    });
  }

  // Function to update tooltip theme for active visualization
  function updateTooltipTheme() {
    if (heartDailyVis && mode === "daily") {
      heartDailyVis.updateTooltipConfig(tooltipThemes[currentTooltipTheme]);
    } else if (heartScatterVis && mode === "hourly") {
      heartScatterVis.updateTooltipConfig(tooltipThemes[currentTooltipTheme]);
    }
  }
});
