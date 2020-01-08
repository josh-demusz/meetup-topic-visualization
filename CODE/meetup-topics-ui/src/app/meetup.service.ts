import { Injectable, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { City, Category } from './app.component';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TopicFrequency } from './visualization/visualization.component';

@Injectable({
  providedIn: 'root'
})
export class MeetupService {

  private REST_API_SERVER = "http://127.0.0.1:5000";

  constructor(private httpClient: HttpClient) {
    this.getCities();
    this.getCategories();

    this.numTopicsByCityCategory = [];
  }

  cities: City[];
  categories: Category[];

  numTopicsByCityCategory: TopicFrequency[];

  getCities() {
    var endpoint = '/get_cities'

    var cities = [];

    return this.sendGetRequest(endpoint)
  }

  getCategories() {
    var endpoint = '/get_categories'

    var categories = [];

    return this.sendGetRequest(endpoint).subscribe(res => {

      for (var index in res) {
        var categoryName = res[ index ];
        var category = { value: categoryName, viewValue: categoryName };

        categories.push(category);
      }

      this.categories = categories;
    })
  }

  getNumTopicsByCityCategory() {
    var endpoint = '/get_num_groups_by_topic_for_city_category'

    var numTopicsByCityCategory = [];

    this.sendGetRequest(endpoint).subscribe(res => {
      for (var index in res) {
        var topic = res[ index ][ 1 ];
        var frequency = res[ index ][ 0 ];

        var category = { topic: topic, frequency: frequency };

        numTopicsByCityCategory.push(category);
      }

      this.numTopicsByCityCategory = numTopicsByCityCategory;
    })

    return numTopicsByCityCategory
  }


  public sendGetRequest(endpoint) {
    return this.httpClient.get(this.REST_API_SERVER + endpoint);
  }

  getGroupsByTopic(city, category, topic, size, sort) {
    let endpoint = '/get_groups_by_topic'
    endpoint += '/' + encodeURIComponent(city)
    endpoint += '/' + encodeURIComponent(category)
    endpoint += '/' + encodeURIComponent(topic)
    endpoint += '/' + encodeURIComponent(size)
    endpoint += '/' + encodeURIComponent(sort)
    return this.sendGetRequest(endpoint)
  }

  getGroupClusters(city, category, topic) {
    // var endpoint = '/clusters/' + cityName + '/' + categoryName + '/group/10/1/6/true/true';
    var endpoint = '/lsa_clusters/' + city + '/' + category + '/' + topic + '/' + true + '/' + true;

    console.log(endpoint);

    return this.sendGetRequest(endpoint)
  }

}
