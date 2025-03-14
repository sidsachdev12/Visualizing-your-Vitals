// line chart
d3.csv("data/cortisol_trend_dataset.csv").then(data => {
  data.forEach(d => {
    d.month = +d.month;
    d.cortisol = +d.cortisol;
  });

  const annotations = [
    { month: -24, cortisol: 24, label: "Exercising" },
    { month: -12, cortisol: 14, label: "Meditation" }
  ];

  const lineChart = new LineChart({
    parentElement: '#lineChart',
    width: 800,
    height: 400,

    data: data,
    annotations: annotations
  });
}
);

// line chart 2
d3.csv("data/ai_healthcare_dataset.csv").then(data => {
  data.forEach(d => {
    d.Age = +d.Age;
    d.Heart_Rate = +d.Heart_Rate;
  });

  const annotations = [
  ];

  const scatterPlot = new ScatterPlot({
    parentElement: '#scatterPlot',
    width: 800,
    height: 400,
    data: data,
    variable: 'Heart_Rate' // or a different variable if needed
  });
}
);