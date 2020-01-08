import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError} from '@angular/material/dialog';
import { TextAnalysisComponent } from '../text-analysis/text-analysis.component';
import { MeetupService } from '../meetup.service';

@Component({
  selector: 'app-text-analysis-selection-dialog',
  templateUrl: './text-analysis-selection-dialog.component.html',
  styleUrls: ['./text-analysis-selection-dialog.component.css']
})
export class TextAnalysisSelectionDialogComponent {
  meetupService: MeetupService;

  clusters = [];
  events = [];
  groups = [];

  constructor(public dialogRef: MatDialogRef<TextAnalysisComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TextAnalysisSelectionData,
    meetupService: MeetupService) { 
      this.meetupService = meetupService;

      this.getClusters();
    }

    onNoClick(): void {
      console.log(this.data);

      this.dialogRef.close();
    }

    getClusters() {
      var endpoint = '/clusters/'+this.data.cityName+'/'+this.data.categoryName+'/event/10/1/6/true/true';
      this.meetupService.sendGetRequest(endpoint).subscribe(res => {

        // Populate list
        for(var index in res) {
          this.clusters.push(res[index][0]);
        }
      })
    }

    getGroups() {
      if(this.data.groupSearch != null && this.data.groupSearch.length > 0) {
        console.log('Entered a group name.')
      } else {
        console.log('Please enter a group name.')
      }

      // Service call
      var endpoint = '/groups/'+this.data.cityName+'/'+this.data.categoryName+'/'+this.data.groupSearch;
      this.meetupService.sendGetRequest(endpoint).subscribe(res => {
        // Populate list
        for(var index in res) {
          console.log(res[index])
          this.groups.push(res[index][1]);
        }
      })

    }

    getEvents() {
      if(this.data.eventSearch != null && this.data.eventSearch.length > 0) {
        console.log('Entered an event name.')
      } else {
        console.log('Please enter an event name.')
      }

      // Service call
      var endpoint = '/events/'+this.data.cityName+'/'+this.data.categoryName+'/'+this.data.eventSearch;
      this.meetupService.sendGetRequest(endpoint).subscribe(res => {
        // Populate list
        for(var index in res) {
          // console.log(res[index][0])
          this.events.push(res[index][1]);
        }
      })

      // this.events = [
      //   { "eventName": "Test Name", "descriptions": "Test Description", "category": "Test Category", "group": "Test Group"}
      // ]
    }

    eventsLoaded() {
      // console.log(this.data)
      // console.log(this.events)

      if(this.data.type == 'Event' && this.events != null && this.events.length > 0) {
        return true;
      }
      return false;
    }

    groupsLoaded() {
      if(this.data.type == 'Group' && this.groups != null && this.groups.length > 0) {
        return true;
      }
      return false;
    }

    isValidSelection() {
      if(this.data.type == 'Event' && this.data.eventName != null && this.data.eventName.length > 0) {
        return true;
      }

      if(this.data.type == 'Group' && this.data.groupName != null && this.data.groupName.length > 0) {
        return true;
      }

      if(this.data.type == 'Cluster' && this.data.clusterName != null && this.data.clusterName.length > 0) {
        return true;
      }

      if(this.data.type == 'Category' && this.data.categoryName != null && this.data.categoryName.length > 0) {
        return true;
      }

      return false;
    }

}

export interface TextAnalysisSelectionData {
  type: string;
  eventName: string;
  groupName: string;
  categoryName: string;
  cityName: string;
  clusterName: string;

  eventSearch: string;
  groupSearch: string;
  // cluster_details: {};
}
