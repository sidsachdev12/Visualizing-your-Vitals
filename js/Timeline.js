class Timeline {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            width: _config.width || 800,
            height: _config.height || 300,
            margin: _config.margin || { top: 50, right: 30, bottom: 50, left: 60 },
        };
        this.data = _config.data;

        this.brushed = _config.brushed || (() => { });
        this.initVis();
        this.initResetButton();
    }

    initResetButton() {
        const vis = this;
        d3.select('#reset-brush')
            .on('click', function () {
                vis.brushG.call(vis.brush.move, null);
                vis.brushed(null);
            });
    }

    initVis() {
        const vis = this;
        // vis properties
        vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom - 10;

        // add the vis
        vis.svg = d3.select('#' + vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);
        vis.g = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // scales and axes
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.xAxisG = vis.g.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // brushing
        vis.brushG = vis.g.append('g')
            .attr('class', 'brush');
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on('brush', function (event) {
                // find the boundaries
                if (event.selection) {
                    const [x0, x1] = event.selection;
                    const selectedRange = [
                        vis.xScale.invert(x0),
                        vis.xScale.invert(x1)
                    ];
                    vis.brushed(selectedRange); // callback
                }
            });
        // add brush to group
        vis.brushG.call(vis.brush);

        this.updateVis();
    }

    updateVis() {
        const vis = this;
        // match the scale to scatterplot2
        vis.xScale.domain([
            d3.min(vis.data, (d) => d.height) - 10,
            d3.max(vis.data, (d) => d.height) + 10,
        ]);

        // update x axis
        vis.xAxisG.call(vis.xAxis)
            .selectAll('text')
            .attr('font-size', '10px');

        // xaxis label
        vis.g.selectAll('.x-axis-label').remove();
        vis.g.append('text')
            .attr('class', 'x-axis-label')
            .attr('text-anchor', 'middle')
            .attr('x', vis.width / 2)
            .attr('y', vis.height + 30)
            .text('Height (cm)');

        // redraw brush
        vis.brushG.call(vis.brush.move, null);
        vis.brushG.call(vis.brush);
    }
}