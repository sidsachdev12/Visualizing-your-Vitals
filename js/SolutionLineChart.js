class SolutionLineChart {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            width: _config.width || 700,
            height: _config.height || 400,
            margin: _config.margin || { top: 100, right: 30, bottom: 50, left: 60 },
        };
        this.data = _config.data;
        this.annotations = _config.annotations;
        this.initVis();
    }

    initVis() {
        const vis = this;

        vis.width =
            document.getElementById(vis.config.parentElement).getBoundingClientRect()
                .width - vis.config.margin.left - vis.config.margin.right;
        vis.height =
            document.getElementById(vis.config.parentElement).getBoundingClientRect()
                .height - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3
            .select("#" + vis.config.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
            .append("g")
            .attr(
                "transform",
                `translate(${vis.config.margin.left},${vis.config.margin.top})`
            );

        vis.xScale = d3.scaleLinear().range([0, vis.width]);

        vis.yScale = d3.scaleLinear().range([vis.height, 0]);

        vis.lineGenerator = d3
            .line()
            .x((d) => vis.xScale(d.month))
            .y((d) => vis.yScale(d.cortisol))
            .curve(d3.curveMonotoneX);

        vis.xAxisG = vis.svg
            .append("g")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisG = vis.svg.append("g");

        vis.svg
            .append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 35)
            .attr("text-anchor", "middle")
            .text("Months from Today");

        vis.svg
            .append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -30)
            .attr("x", -vis.height / 2)
            .attr("text-anchor", "middle")
            .text("Average Cortisol Level");

        // add title
        vis.svg
            .append("text")
            .attr("class", "title")
            .attr("x", vis.width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("font-size", 24)
            .text("Projected Cortisol Levels Over Time by Activity");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.workingData = vis.data.filter((d) => d.activity === "nochange");
        vis.physData = vis.data.filter((d) => d.activity === "physact");
        vis.meditatingData = vis.data.filter((d) => d.activity === "meditating");
        vis.bothData = vis.data.filter((d) => d.activity === "both");

        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        vis.xScale.domain(d3.extent(vis.workingData, (d) => d.month));
        vis.yScale.domain([0, d3.max(vis.workingData, (d) => d.cortisol)]).nice();

        vis.xAxisG.call(d3.axisBottom(vis.xScale));
        vis.yAxisG.call(d3.axisLeft(vis.yScale));

        const lineSelectionworking = vis.svg
            .selectAll(".line-path-working")
            .data([vis.workingData]);

        lineSelectionworking.exit().remove();

        const lineEnterworking = lineSelectionworking
            .enter()
            .append("path")
            .attr("class", "line line-path");

        lineEnterworking
            .merge(lineSelectionworking)
            .transition()
            .duration(1000)
            .attr("d", vis.lineGenerator)
            .attr("stroke", "red")
            .attr("fill", "none");

        const lineSelectionPhys = vis.svg
            .selectAll(".line-path-phys")
            .data([vis.physData]);

        lineSelectionPhys.exit().remove();

        const lineEnterPhys = lineSelectionPhys
            .enter()
            .append("path")
            .attr("class", "line line-path dash");

        lineEnterPhys
            .merge(lineSelectionPhys)
            .transition()
            .duration(1000)
            .attr("d", vis.lineGenerator)
            .attr("stroke", "blue")
            .attr("fill", "none");

        const lineSelectionMeditating = vis.svg
            .selectAll(".line-path-meditating")
            .data([vis.meditatingData]);

        lineSelectionMeditating.exit().remove();

        const lineEnterMeditating = lineSelectionMeditating
            .enter()
            .append("path")
            .attr("class", "line line-path dash");

        lineEnterMeditating
            .merge(lineSelectionMeditating)
            .transition()
            .duration(1000)
            .attr("d", vis.lineGenerator)
            .attr("stroke", "green")
            .attr("fill", "none");

        const lineSelectionBoth = vis.svg
            .selectAll(".line-path-Both")
            .data([vis.bothData]);

        lineSelectionBoth.exit().remove();

        const lineEnterBoth = lineSelectionBoth
            .enter()
            .append("path")
            .attr("class", "line line-path dash");

        lineEnterBoth
            .merge(lineSelectionBoth)
            .transition()
            .duration(1000)
            .attr("d", vis.lineGenerator)
            .attr("stroke", "gray")
            .attr("fill", "none");

        // add legend
        let legend = vis.svg.select(".legend");
        if (legend.empty()) {
            const legendData = [
                { name: "No Change", color: "red" },
                { name: "Physical Activity", color: "blue" },
                { name: "Meditating", color: "green" },
                { name: "Both", color: "gray" },
            ];

            legend = vis.svg
                .append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${vis.width - 150}, 10)`);

            legend
                .selectAll("rect")
                .data(legendData)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => i * 20)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", (d) => d.color);

            legend
                .selectAll("text")
                .data(legendData)
                .enter()
                .append("text")
                .attr("x", 15)
                .attr("y", (d, i) => i * 20 + 9)
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .text((d) => d.name);
        }
    }
}
