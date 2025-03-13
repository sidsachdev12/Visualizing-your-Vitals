// init global variables, switches, helper functions
let sleepViz;
let sleep_data;

function updateAllVisualizations() {
  sleepViz.wrangleData();
}

// Parse a date string in the format "YYYY-MM-DD" into a JavaScript Date object
let parseDate = d3.timeParse("%Y-%m-%d");

// Format a JavaScript Date object into a string in the format "YYYY-MM-DD"
let formatDate = d3.timeFormat("%Y-%m-%d");

async function loadSleepData() {
  return d3.csv("data/sleep_data.csv", (row) => {
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
  });
}

async function initVisualizations() {
  sleep_data = await loadSleepData();
  sleepViz = new sleepAreaChart("sleepAreaChart", sleep_data); // Initialize visualization
}

initVisualizations();
