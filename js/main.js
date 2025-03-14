// pull data from cortisol_trend_dataset.csv
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
      parentElement: '#chart',
      data: data,
      annotations: annotations
    });
  }
);
