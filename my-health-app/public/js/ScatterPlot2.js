class ScatterPlot2 {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            width: _config.width || 800,
            height: _config.height || 400,
            margin: _config.margin || { top: 30, right: 30, bottom: 50, left: 60 }
        };
        this.data = _config.data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

        // create svg
        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.width)
            .attr("height", vis.config.height)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // axis groups
        vis.xAxisG = vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisG = vis.svg.append("g");

        // axis labels
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 35)
            .attr("text-anchor", "middle")
            .text("Height");

        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -vis.height / 2)
            .attr("text-anchor", "middle")
            .text("Weight");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        console.log(vis.data);

        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // update scales and axes
        vis.xScale.domain([d3.min(vis.data, d => d.height) - 10, d3.max(vis.data, d => d.height) + 10]);
        vis.yScale.domain([d3.min(vis.data, d => d.weight) - 10, d3.max(vis.data, d => d.weight) + 10]);

        vis.xAxisG.call(d3.axisBottom(vis.xScale));
        vis.yAxisG.call(d3.axisLeft(vis.yScale));

        let bmis = [18.5, 25]
        bmis.forEach(b => {
            let lineData = d3.range(d3.min(vis.data, d => d.height) - 10, d3.max(vis.data, d => d.height) + 10)
            lineData = lineData.map(d => {
                let w = b * (d / 100) * (d / 100);
                return {"h": d, "w": w}
            });
            let line = d3.line()
                .x(d => vis.xScale(d.h))
                .y(d => vis.yScale(d.w));
            vis.svg.append("path")
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .attr("stroke", "blue")
                .attr("d", line(lineData));

            vis.svg.append("text")
                .attr("x", vis.xScale(lineData[lineData.length - 1].h))
                .attr("y", vis.yScale(lineData[lineData.length - 1].w) - 10)
                .attr("text-anchor", "middle")
                .text(`BMI ${b}`);
        })

        // draw circles
        const circles = vis.svg.selectAll("c")
            .data(vis.data);

        circles.exit().remove();

        circles.enter()
            .append("circle")
            .attr("class", "c")
            .attr("r", d => d.rhr / 7)
            .attr("fill", d => {
                if (d.rhr < 75) return "#7BB662"
                else if (d.rhr < 90) return "#FFD301";
                else return "#D61F1F";
            })
            .attr("opacity", 0.6)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .merge(circles)
            // .transition()
            // .duration(1000)
            .attr("cx", d => vis.xScale(d.height))
            .attr("cy", d => vis.yScale(d.weight));
    }

}
