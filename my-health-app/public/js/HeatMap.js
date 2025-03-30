class HeatMap {
    constructor(config) {
        this.parentElement = config.parentElement;
        this.data = config.data;
        this.width = config.width;
        this.height = config.height;
        this.margin = { top: 50, right: 50, bottom: 50, left: 50 };

        this.initVis();
    }

    initVis() {
        const vis = this;

        vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // x axis
        vis.xScale = d3.scaleLinear()
            .domain([90, 120]) // Blood pressure range
            .range([100, 700]);

        // x axis label
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)  // centered between 100 and 700
            .attr("y", vis.height - 40)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Blood Pressure (mmHg)");

        // bubble size
        vis.sizeScale = d3.scaleSqrt()
            .domain([50, 120])
            .range([20, 50]);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // update fields
        vis.data.forEach(d => {
            d.Age = +d.Age;
            d["Sleep Duration"] = +d["Sleep Duration"];
            d["Quality of Sleep"] = +d["Quality of Sleep"];
            d["Physical Activity Level"] = +d["Physical Activity Level"];
            d["Stress Level"] = +d["Stress Level"];

            if (d["Blood Pressure"]) {
                const parts = d["Blood Pressure"].split("/");
                d["Blood Pressure"] = (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
            } else {
                d["Blood Pressure"] = 0;
            }

            d["Heart Rate"] = +d["Heart Rate"];
            d["Daily Steps"] = +d["Daily Steps"];
            d.Cortisol = +d.Cortisol;

            // Normal Weight + Normal should be considered the same BMI category
            if (d["BMI Category"] === "Normal Weight") {
                d["BMI Category"] = "Normal";
            }
        });

        // aggregate the data
        const aggregate = {};
        vis.data.forEach(d => {
            const bmi = d["BMI Category"];
            if (!aggregate[bmi]) {
                aggregate[bmi] = { count: 0, bpSum: 0, hrSum: 0, stepsSum: 0 };
            }
            aggregate[bmi].count++;
            aggregate[bmi].bpSum += d["Blood Pressure"];
            aggregate[bmi].hrSum += d["Heart Rate"];
            aggregate[bmi].stepsSum += d["Daily Steps"];
        });

        // calculate averages
        const avgData = [];
        for (const bmi in aggregate) {
            avgData.push({
                category: bmi,
                avgBloodPressure: aggregate[bmi].bpSum / aggregate[bmi].count,
                avgHeartRate: aggregate[bmi].hrSum / aggregate[bmi].count,
                avgDailySteps: aggregate[bmi].stepsSum / aggregate[bmi].count
            });
        }

        vis.data = [
            { category: "Normal", bp: avgData[1].avgBloodPressure, size: aggregate["Normal"].count, color: "green" },
            { category: "Overweight", bp: avgData[2].avgBloodPressure, size: aggregate["Overweight"].count, color: "orange" },
            { category: "Obese", bp: avgData[0].avgBloodPressure, size: aggregate["Obese"].count + 20, color: "red" }
        ];

        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // insert x axis
        const xAxis = d3.axisBottom(vis.xScale).ticks(5);
        vis.svg.append("g")
            .attr("transform", `translate(0, 400)`)
            .call(xAxis);

        // draw circles
        vis.svg.selectAll("circle")
            .data(vis.data)
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", d => vis.xScale(d.bp))
            .attr("cy", 300)
            .attr("r", d => vis.sizeScale(d.size))
            .attr("fill", d => d.color)
            .style("opacity", 1);

        // legend
        const legend = vis.svg.selectAll(".legend")
            .data(vis.data)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(600, ${100 + i * 25})`);

        legend.append("circle")
            .attr("r", 10)
            .attr("fill", d => d.color);

        legend.append("text")
            .attr("x", 20)
            .attr("y", 5)
            .text(d => 
                {
                    if (d.category === "Normal") return "Normal: 18.5–24.9 kg/m²";
                    else if (d.category === "Overweight") return "Overweight: 25–29.9 kg/m²";
                    else if (d.category === "Obese") return "Obese: >=30 kg/m²";
                })
            .style("font-size", "14px");

        // title
        vis.svg.append("text")
            .attr("x", 300)
            .attr("y", 50)
            .text("Blood Pressure Given BMI")
            .style("font-size", "18px")
            .style("font-weight", "bold");
    }
}