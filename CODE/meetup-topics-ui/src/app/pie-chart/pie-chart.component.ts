import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PieChartComponent implements OnInit {
  get height(): number { return parseInt(d3.select('body').style('height').slice(0, -2), 10); }
  get width(): number { return parseInt(d3.select('#pie-chart-card').style('width').slice(0, -2)); }
  // radius: number;
  // Arcs & pie
  // private arc: any;
  // private outerArc: any;
  private pie: any; private slices: any;
  private color: any;
  // Drawing containers
  private svg: any; private mainContainer: any;
  private key: any;

  constructor() { }

  ngOnInit() {
    console.log("ng init");
    console.log(parseInt(d3.select('#pie-chart-card').style('width').slice(0, -2)))
    var width = parseInt(d3.select('#pie-chart-card').style('width').slice(0, -2)),
      height = 500,
      radius = Math.min(width, height) / 2;

    this.svg = d3.select("#pie")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    this.svg.append("g")
      .attr("class", "slices");
    this.svg.append("g")
      .attr("class", "labels");
    this.svg.append("g")
      .attr("class", "lines");

    this.pie = d3.pie()
      .sort(null)
      .value((d: any) => d.abs);

    this.svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    this.key = function (d) { return d.data.name; };
  }

  // Transitions aren't working currently, draw twice as a work around.
  drawPieChartTwice(data) {
    this.drawPieChart(data);
    this.drawPieChart(data);
  }

  drawPieChart(data) {
    console.log(data);
    // data = [
    //   { name: "negative", value: .5, abs: .5 },
    //   { name: "positive", value: .1, abs: .1 },
    //   { name: "neutral", value: .4, abs: .4 }
    // ]
    console.log(data);

    var width = 800,
      height = 500,
      radius = Math.min(width, height) / 2;

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var arc = d3.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    var outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    /* ------- PIE SLICES -------*/
    var slice = this.svg
      .select(".slices")
      .selectAll("path.slice")
      .data(this.pie(data), this.key);

    slice.exit()
      .remove();

    console.log(slice)

    slice.enter()
      .insert("path")
      .style("fill", function (d) { return color(d.data.name); })
      .attr("class", "slice");

    slice
      .transition().duration(1000)
      .attrTween("d", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          return arc(interpolate(t));
        };
      })

    /* ------- TEXT LABELS -------*/

    var text = this.svg.select(".labels")
      .selectAll("text")
      .data(this.pie(data), this.key);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function (d) {
        return (d.data.name + " | " + new Intl.NumberFormat('en-us', { minimumFractionDigits: 2 }).format(d.data.value * 100.0) + "%");
      });

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    text.transition().duration(1000)
      .attrTween("transform", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[ 0 ] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate(" + pos + ")";
        };
      })
      .styleTween("text-anchor", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start" : "end";
        };
      });

    text.exit()
      .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = this.svg.select(".lines")
      .selectAll("polyline")
      .data(this.pie(data), this.key);

    polyline.enter()
      .append("polyline")
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("stroke", "black")
      .style("opacity", "1");

    polyline.transition().duration(1000)
      .attrTween("points", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[ 0 ] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [ arc.centroid(d2), outerArc.centroid(d2), pos ];
        };
      });

    polyline.exit()
      .remove();
  };

  // ngOnInit() {
  // }

  //   drawPieChart(data) {
  //     this.svg = d3.select('#pie').select('svg');
  //     this.setSVGDimensions();
  //     this.color = d3.scaleOrdinal(d3.schemeCategory10);
  //     // console.log(this.radius)
  //     this.mainContainer = this.svg.append('g').attr('transform', `translate(${this.radius},${this.radius})`);
  //     this.pie = d3.pie().sort(null).value((d: any) => d.abs);
  //     this.draw(data);
  //   }

  //   private setSVGDimensions() {
  //     this.radius = (Math.min(this.width, this.height)) / 4;
  //     this.svg.attr('width', 2 * this.radius).attr('height', 2 * this.radius);
  //     this.svg.select('g').attr('transform', 'translate(' + this.radius + ',' + this.radius + ')');
  //   }
  //   private draw(data) {
  //     this.drawSlices(data);
  //   }

  //   private getArc() {
  //     return d3.arc()
  //       .outerRadius(this.radius)
  //       .innerRadius(this.radius * .75)
  //   }

  //   private drawSlices(data) {
  //     this.slices = this.mainContainer.selectAll('path')
  //       .remove().exit()
  //       .data(this.pie(data))
  //       .enter().append('g').append('path')
  //       .attr('d', this.getArc());

  //     this.slices
  //       .attr('fill', (d, i) => this.color(i));
  //   }
}


// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import * as d3 from 'd3';

// @Component({
//   selector: 'app-pie-chart',
//   templateUrl: './pie-chart.component.html',
//   encapsulation: ViewEncapsulation.None
// })
// export class PieChartComponent implements OnInit {
//   get height(): number { return parseInt(d3.select('body').style('height'), 10); }
//   get width(): number { return parseInt(d3.select('body').style('width'), 10); }
//   radius: number;
//   // Arcs & pie
//   private arc: any;  private pie: any;  private slices: any;
//   private color: any;
//   // Drawing containers
//   private svg: any;  private mainContainer: any;

//   constructor() {
//   }

//   ngOnInit() {
//   }

//   drawPieChart(data) {
//     this.svg = d3.select('#pie').select('svg');
//     this.setSVGDimensions();
//     this.color = d3.scaleOrdinal(d3.schemeCategory10);
//     // console.log(this.radius)
//     this.mainContainer = this.svg.append('g').attr('transform', `translate(${this.radius},${this.radius})`);
//     this.pie = d3.pie().sort(null).value((d: any) => d.abs);
//     this.draw(data);
//   }

//   private setSVGDimensions() {
//     this.radius = (Math.min(this.width, this.height)) / 4;
//     this.svg.attr('width', 2 * this.radius).attr('height', 2 * this.radius);
//     this.svg.select('g').attr('transform', 'translate(' + this.radius + ',' + this.radius + ')');
//   }
//   private draw(data) {
//     this.drawSlices(data);
//   }

//   private getArc() {
//     return d3.arc()
//     .outerRadius(this.radius)
//     .innerRadius(this.radius * .75)
//   }

//   private drawSlices(data) {
//     this.slices = this.mainContainer.selectAll('path')
//       .remove().exit()
//       .data(this.pie(data))
//       .enter().append('g').append('path')
//       .attr('d', this.getArc());

//     this.slices
//       .attr('fill', (d, i) => this.color(i));
//   }
// }
