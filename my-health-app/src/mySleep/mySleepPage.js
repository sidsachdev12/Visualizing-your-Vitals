// src/SleepVizContainer.js
import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import SleepAreaChart from "./sleepAreaChart";

const parseDate = d3.timeParse("%Y-%m-%d");

function SleepVizContainer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    d3.csv("/data/sleep_data.csv", (row) => {
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
    }).then((csvData) => {
      setData(csvData);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  return <SleepAreaChart data={data} />;
}

export default SleepVizContainer;
