import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TextAnalysisSelectionDialogComponent, TextAnalysisSelectionData } from '../text-analysis-selection-dialog/text-analysis-selection-dialog.component';
import { MeetupService } from '../meetup.service';
import * as d3 from "d3";
import { PieChartComponent } from '../pie-chart/pie-chart.component';

@Component({
  selector: 'app-text-analysis',
  templateUrl: './text-analysis.component.html',
  styleUrls: [ './text-analysis.component.css' ]
})
export class TextAnalysisComponent implements OnInit {

  // User input
  type: string;
  eventName: string;

  // Control variables
  showAnalysisOptions: boolean;
  selectedAnalysis: string;
  userSelection: TextAnalysisSelectionData;
  textMetrics: {};
  selectedCity: string;

  // Services
  meetupService: MeetupService;

  @ViewChild(TextAnalysisSelectionDialogComponent, { static: true })
  private textAnalysisSelectionDialogComponent: TextAnalysisSelectionDialogComponent;

  @ViewChild(PieChartComponent, { static: false })
  private pieChartComponent: PieChartComponent;
  selectedCategory: any;
  visualizationType: string;
  categoryName: any;

  constructor(public dialog: MatDialog, meetupService: MeetupService) {
    this.showAnalysisOptions = false;

    this.meetupService = meetupService;
  }

  ngOnInit() {
  }

  displayTextAnalysis(selectedCity, selectedCategory) {
    this.selectedCity = selectedCity;
    this.selectedCategory = selectedCategory;

    this.visualizationType = "text analysis";

    this.openTextAnalysisDialog()
  }

  openTextAnalysisDialog(): void {


    const dialogRef = this.dialog.open(TextAnalysisSelectionDialogComponent, {
      width: '550px',
      data: { type: this.type, event_name: this.eventName, categoryName: this.selectedCategory, cityName: this.selectedCity }
    });

    dialogRef.afterClosed().subscribe(data => {
      console.log('The dialog was closed');
      console.log(data);
      this.userSelection = data
      // this.cityName = data.cityName;
      // this.categoryName = data.categoryName;
      this.eventName = data.event_name;
      this.type = data.type;

      if (data != null) {
        // Get text metric data
        var endpoint = '/text-metrics/' + this.selectedCity + '/' + this.selectedCategory + '/' + this.type + '/' + (this.eventName || this.categoryName);
        this.meetupService.sendGetRequest(endpoint).subscribe(res => {
          console.log(res);

          this.textMetrics = res;

          // Default to 'sentiment' button
          this.showTextMetricsVisualization('sentiment')
        })

        // Display options
        this.showAnalysisOptions = true
      }
    });
  }
  getTextAnalysisData() {

  }

  showTextMetricsVisualization(type) {
    console.log(type);

    this.selectedAnalysis = type;

    var data = [];

    if (this.isSentimentSelected()) {
      data = [
        { name: "positive", value: this.textMetrics[ 'sentiment' ][ 'positive' ], abs: Math.abs(this.textMetrics[ 'sentiment' ][ 'positive' ]) },
        { name: "negative", value: this.textMetrics[ 'sentiment' ][ 'negative' ], abs: Math.abs(this.textMetrics[ 'sentiment' ][ 'negative' ]) },
        { name: "neutral", value: this.textMetrics[ 'sentiment' ][ 'neutral' ], abs: Math.abs(this.textMetrics[ 'sentiment' ][ 'neutral' ]) }
      ]
    } else if (this.isEmotionSelected()) {
      data = [
        { name: "angry", value: this.textMetrics[ 'emotion' ][ 'Angry' ], abs: Math.abs(this.textMetrics[ 'emotion' ][ 'Angry' ]) },
        { name: "bored", value: this.textMetrics[ 'emotion' ][ 'Bored' ], abs: Math.abs(this.textMetrics[ 'emotion' ][ 'Bored' ]) },
        { name: "excited", value: this.textMetrics[ 'emotion' ][ 'Excited' ], abs: Math.abs(this.textMetrics[ 'emotion' ][ 'Excited' ]) },
        { name: "fear", value: this.textMetrics[ 'emotion' ][ 'Fear' ], abs: Math.abs(this.textMetrics[ 'emotion' ][ 'Fear' ]) },
        { name: "happy", value: this.textMetrics[ 'emotion' ][ 'Happy' ], abs: Math.abs(this.textMetrics[ 'emotion' ][ 'Happy' ]) },
        { name: "sad", value: this.textMetrics[ 'emotion' ][ 'Sad' ], abs: Math.abs(this.textMetrics[ 'emotion' ][ 'Sad' ]) },
      ]
    } else if (this.isIntentSelected()) {
      data = [
        { name: "feedback", value: this.textMetrics[ 'intent' ][ 'feedback' ][ 'score' ], abs: Math.abs(this.textMetrics[ 'intent' ][ 'feedback' ][ 'score' ]) },
        { name: "marketing", value: this.textMetrics[ 'intent' ][ 'marketing' ], abs: Math.abs(this.textMetrics[ 'intent' ][ 'marketing' ]) },
        { name: "news", value: this.textMetrics[ 'intent' ][ 'news' ], abs: Math.abs(this.textMetrics[ 'intent' ][ 'news' ]) },
        { name: "query", value: this.textMetrics[ 'intent' ][ 'query' ], abs: Math.abs(this.textMetrics[ 'intent' ][ 'query' ]) },
        { name: "spam", value: this.textMetrics[ 'intent' ][ 'spam' ], abs: Math.abs(this.textMetrics[ 'intent' ][ 'spam' ]) }
      ]
    } else if (this.isSarcasmSelected()) {
      data = [
        { name: "Non-Sarcastic", value: this.textMetrics[ 'sarcasm' ][ 'Non-Sarcastic' ], abs: Math.abs(this.textMetrics[ 'sarcasm' ][ 'Non-Sarcastic' ]) },
        { name: "Sarcastic", value: this.textMetrics[ 'sarcasm' ][ 'Sarcastic' ], abs: Math.abs(this.textMetrics[ 'sarcasm' ][ 'Sarcastic' ]) }
      ]
    } else if (this.isAbuseSelected()) {
      data = [
        { name: "abuse", value: this.textMetrics[ 'abuse' ][ 'abusive' ], abs: Math.abs(this.textMetrics[ 'abuse' ][ 'abusive' ]) },
        { name: "hate_speech", value: this.textMetrics[ 'abuse' ][ 'hate_speech' ], abs: Math.abs(this.textMetrics[ 'abuse' ][ 'hate_speech' ]) },
        { name: "neither", value: this.textMetrics[ 'abuse' ][ 'neither' ], abs: Math.abs(this.textMetrics[ 'abuse' ][ 'neither' ]) }
      ]
    }

    // var data = [
    //   {name: "positive", value: .4, abs: Math.abs(.4)},
    //   {name: "negative", value: .5, abs: Math.abs(.5)},
    //   {name: "neutral", value: .1, abs: Math.abs(.1)}
    // ]

    console.log(data)

    this.pieChartComponent.drawPieChartTwice(data)
    // this.showPieChart(data)
  }

  isSentimentSelected() {
    return this.selectedAnalysis == 'sentiment';
  }

  isEmotionSelected() {
    return this.selectedAnalysis == 'emotion';
  }

  isIntentSelected() {
    return this.selectedAnalysis == 'intent';
  }

  isSarcasmSelected() {
    return this.selectedAnalysis == 'sarcasm';
  }

  isAbuseSelected() {
    return this.selectedAnalysis == 'abuse';
  }

  textMetricSelected() {
    return (this.userSelection && this.userSelection.type);
  }

  getSelectedName() {
    if (this.userSelection.type == 'Category') {
      return this.userSelection.categoryName;
    } else if (this.userSelection.type == 'Cluster') {
      return this.userSelection.clusterName;
    } else if (this.userSelection.type == 'Group') {
      return this.userSelection.groupName;
    } else if (this.userSelection.type == 'Event') {
      return this.userSelection.eventName;
    } else {
      return '';
    }

  }

  // showPieChart(data){
  //   const width = 540;
  //   const height = 540;
  //   const radius = Math.min(width, height) / 2;

  //   const svg = d3.select("#pie-chart")
  //       .append("svg")
  //           .attr("width", width)
  //           .attr("height", height)
  //       .append("g")
  //           .attr("transform", `translate(${width / 2}, ${height / 2})`);

  //   const color = d3.scaleOrdinal(["#66c2a5","#fc8d62","#8da0cb",
  //        "#e78ac3","#a6d854","#ffd92f"]);

  //   const pie = d3.pie()
  //       .value(d => d.percentage)
  //       .sort(null);

  //   const arc = d3.arc()
  //       .innerRadius(0)
  //       .outerRadius(radius);

  //   function type(d) {
  //       d.apples = Number(d.apples);
  //       d.oranges = Number(d.oranges);
  //       return d;
  //   }

  //   function arcTween(a) {
  //       const i = d3.interpolate(this._current, a);
  //       this._current = i(1);
  //       return (t) => arc(i(t));
  //   } 
  //       // d3.selectAll("input")
  //       //     .on("change", update);

  //       function update() {
  //           // Join new data
  //           const path = svg.selectAll("path")
  //               .data(pie(data));

  //           // Update existing arcs
  //           path.transition().duration(200).attrTween("d", arcTween);

  //           // Enter new arcs
  //           path.enter().append("path")
  //               .attr("fill", (d, i) => color(i))
  //               .attr("d", arc)
  //               .attr("stroke", "white")
  //               .attr("stroke-width", "6px")
  //               .each(function(d) { this._current = d; });
  //       }

  //       update();

  // }

}