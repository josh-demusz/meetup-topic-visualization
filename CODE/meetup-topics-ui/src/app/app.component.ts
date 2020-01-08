import { Component, OnInit } from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';
import { VisualizationComponent } from './visualization/visualization.component';
import { MeetupService } from './meetup.service';
import { TextAnalysisComponent } from './text-analysis/text-analysis.component';
import { MessageService } from 'primeng/api';

export interface City {
  value: string;
  viewValue: string;
}

export interface Category {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {
  cities: any[] = []
  // categories: any[] = []
  ngOnInit(): void {
    this.meetupService.getCities().subscribe(res => {

      for (var index in res) {
        var city = { value: res[ index ][ 0 ], viewValue: res[ index ][ 0 ] };

        this.cities.push(city);
      }

      // this.cities = cities;
    })
  }
  // cities: City[];// = [ {value: "San Francisco", viewValue: "San Francisco"} ];
  categories: Category[];// = [ {value: "Food", viewValue: "Food"}, {value: "Tech", viewValue: "Tech"} ];
  selectedCity: string;
  selectedCategory: string;
  index = 0
  constructor(meetupService: MeetupService, private messageService: MessageService) {
    this.meetupService = meetupService;
  }
  title = 'meetup-topics-ui';

  // cities: City[];// = [ {value: "San Francisco", viewValue: "San Francisco"} ];
  // categories: Category[];// = [ {value: "Food", viewValue: "Food"}, {value: "Tech", viewValue: "Tech"} ];

  meetupService: MeetupService;

  @ViewChild(VisualizationComponent, { static: false })
  private visualizationComponent: VisualizationComponent;

  @ViewChild(TextAnalysisComponent, { static: false })
  private textAnalysisComponent: TextAnalysisComponent;


  showMsg(type, title, msg) {
    this.messageService.add({ severity: type, summary: title, detail: msg });
  }

  displayGeneralBarChart() {
    console.log("User selection: " + this.selectedCity + " " + this.selectedCategory);
    if (!this.selectedCity && !this.selectedCategory) {
      this.showMsg("error", "Missing required input", "Select a city and category to continue")
      return
    }
    this.visualizationComponent.displayGeneralBarChart(this.selectedCity, this.selectedCategory);
  }

  displaySaturationBarChart() {
    this.visualizationComponent.displaySaturationBarChart();
  }

  displayTextAnalysis() {
    if (!this.selectedCity && !this.selectedCategory) {
      this.showMsg("error", "Missing required input", "Select a city and category to continue")
      return
    }
    this.textAnalysisComponent.displayTextAnalysis(this.selectedCity, this.selectedCategory);
  }

  getCategories() {

  }

  displayResult(event?) {
    this.index = event ? event.index : this.index
    if (this.index === 0) { this.displayGeneralBarChart() }
    else if (this.index === 1) { this.displayTextAnalysis() }
  }

}
