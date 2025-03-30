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
d3.csv("./data/sleep_lifestyle_dataset.csv").then(data => {
  const heatMap = new HeatMap({
    parentElement: "#heatMap",
    data: data,
    width: 800,
    height: 500
  });
});


// vis 4
d3.csv("./data/applewatch_fitbit_dataset.csv").then(data => {
  data = data.map(d => {
    return {
      height: +d.height,
      weight: +d.weight,
      rhr: +d.resting_heart_rate
    }
  })
  const scatPlot = new ScatterPlot2({
    parentElement: "#scatter-plot-w",
    data: data,
    width: 800,
    height: 500
  })
})
