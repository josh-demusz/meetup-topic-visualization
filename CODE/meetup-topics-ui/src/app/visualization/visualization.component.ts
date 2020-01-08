import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { MeetupService } from '../meetup.service';
import { TextAnalysisComponent } from '../text-analysis/text-analysis.component';
import _ from 'lodash'
class Group {
  category_name = '';
  group_name = '';
  group_description = '';
  members = '';
  // created = "";
  topics = '';
  name_desc = '';

  constructor(category_name, group_name, group_description, members, topics, created?) {
    this.category_name = category_name;
    this.group_name = group_name;
    this.group_description = group_description;
    this.members = members;
    this.topics = topics;
    this.name_desc = group_name + ' ' + group_description;
    // this.created = created;

  }
}

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: [ './visualization.component.css' ]
})
export class VisualizationComponent implements OnInit {

  constructor(meetupService: MeetupService) {
    this.meetupService = meetupService;

    this.visualizationType = 'none';

    this.selectedSize = '10';
    this.selectedSort = 'DESC';
  }
  clusters: any[];
  cols = [
    { field: 'group_name', header: 'Group Name' },
    // { field: 'group_description', header: 'Group Description' },
    { field: 'members', header: '# of Members' },
    // { field: 'created', header: 'Created On' },
    // { field: 'category_name', header: 'Category' },
    { field: 'topics', header: 'Topics' }
  ];
  margin = { top: 40, right: 80, bottom: 100, left: 150 };

  meetupService: MeetupService;

  @Input()
  data: TopicFrequency[];
  groupsData: Group[];
  @ViewChild('topicmatrix', { static: false })
  private topicMatrixContainer: ElementRef;
  @ViewChild('chart', { static: false })
  private chartContainer: ElementRef;

  @ViewChild(TextAnalysisComponent, { static: false })
  private textAnalysisComponent: TextAnalysisComponent;
  selectedTopic: any;
  selectedGroups: any;

  selectedCity: string;
  selectedCategory: string;

  selectedSize: string;
  selectedSort: string;

  visualizationType: String;

  userSelectionTextAnalysis: {};

  ngOnInit() {
  }

  displayTextAnalysis(selectedCity, selectedCategory) {
    this.selectedCity = selectedCity;
    this.selectedCategory = selectedCategory;

    this.visualizationType = 'text analysis';
  }


  rebuildGeneralBarChart() {
    this.displayGeneralBarChart(this.selectedCity, this.selectedCategory);
  }

  displayGeneralBarChart(city, category) {
    this.selectedCity = city;
    this.selectedCategory = category;

    this.visualizationType = 'general bar chart';

    const endpoint = '/get_num_groups_by_topic_for_city_category/' + city + '/' + category + '/' + this.selectedSize + '/' + this.selectedSort;

    const numTopicsByCityCategory = [];

    this.meetupService.sendGetRequest(endpoint).subscribe(res => {
      for (const index in res) {
        const topic = res[ index ][ 1 ];
        const frequency = res[ index ][ 0 ];

        const category = { topic, frequency };

        numTopicsByCityCategory.push(category);
      }

      this.createBarChart(numTopicsByCityCategory);

      console.log(this.chartContainer);

      // this.meetupServicenumTopicsByCityCategory = numTopicsByCityCategory;
    });
  }

  displaySaturationBarChart() {
    this.visualizationType = 'saturation bar chart';
  }

  createBarChart(d: TopicFrequency[]) {
    const element = this.chartContainer.nativeElement;
    if (!element.offsetParent) { return; }

    const data = d;

    element.innerHTML = '';


    const w = element.offsetParent.clientWidth - this.margin.left - this.margin.right;
    const h = Math.min(element.offsetParent.clientHeight, 500);
    const svg = d3.select(element).append('svg')
      .attr('width', w)
      .attr('height', h);

    const contentWidth = w - this.margin.left;
    const contentHeight = element.offsetHeight - this.margin.top;

    const x = d3
      .scaleLinear()
      .range([ 0, contentWidth ])
      .domain([ 0, d3.max(data, d => d.frequency) ]);


    const y = d3
      .scaleBand()
      .rangeRound([ 0, contentHeight ])
      .padding(0.1)
      .domain(data.map(d => d.topic));


    const g = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + 0 + ')')
      .call(d3.axisTop(x))
      .selectAll('text');
    // .attr("y", 30)
    // .attr("x", 0)
    // .attr('transform', 'rotate(-90)');

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => 0)
      .attr('y', d => y(d.topic))
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.frequency))
      .style('fill', 'steelblue');

    const bars = svg.selectAll('.bar');
    bars.on('click', (d: any) => {

      this.selectedTopic = d.topic;
      this.getGroupsByTopic(d.topic);
    });

  }
  // createBarChart(d: TopicFrequency[]) {
  //   const element = this.chartContainer.nativeElement;
  //   const data = d;

  //   element.innerHTML = "";

  //   console.log(data);

  //   console.log(element.offsetWidth)
  //   console.log(element.offsetHeight)

  //   const svg = d3.select(element).append('svg')
  //     .attr('width', 2.7 * element.offsetWidth)
  //     .attr('height', 2.5 * element.offsetHeight);

  //   const contentWidth = element.offsetWidth - this.margin.left - this.margin.right;
  //   const contentHeight = element.offsetHeight - this.margin.top - this.margin.bottom;

  //   const x = d3
  //     .scaleBand()
  //     .rangeRound([ 0, contentWidth ])
  //     .padding(0.1)
  //     .domain(data.map(d => d.topic));

  //   const y = d3
  //     .scaleLinear()
  //     .rangeRound([ contentHeight, 0 ])
  //     .domain([ 0, d3.max(data, d => d.frequency) ]);

  //   const g = svg.append('g')
  //     .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  //   g.append('g')
  //     .attr('class', 'axis axis--x')
  //     .attr('transform', 'translate(0,' + contentHeight + ')')
  //     .call(d3.axisBottom(x))
  //     .selectAll('text')
  //     .attr("y", 30)
  //     .attr("x", -33)
  //     .attr('transform', 'rotate(-45)');

  //   g.append('g')
  //     .attr('class', 'axis axis--y')
  //     .call(d3.axisLeft(y))
  //     .append('text')
  //     .attr('y', 6)
  //     .attr('dy', '0.71em')
  //     .attr('text-anchor', 'end')
  //     .text('Frequency');

  //   g.selectAll('.bar')
  //     .data(data)
  //     .enter().append('rect')
  //     .attr('class', 'bar')
  //     .attr('x', d => x(d.topic))
  //     .attr('y', d => y(d.frequency))
  //     .attr('width', x.bandwidth())
  //     .attr('height', d => contentHeight - y(d.frequency))
  //     .style("fill", "steelblue")
  //     .on("click", (d) => {
  //       this.getGroupsByTopic(d.topic)
  //     });
  // }

  getGroupsByTopic(topic) {
    this.groupsData = [];
    this.meetupService.getGroupsByTopic(this.selectedCity, this.selectedCategory, topic, 100, this.selectedSort)
      .subscribe((res: any) => {
        res.map(g => this.groupsData.push(new Group(g[ 0 ], g[ 1 ], g[ 2 ], g[ 3 ], g[ 4 ], g[ 5 ])));
        console.log(this.groupsData);
        this.getGroupClusters(topic);
      });
  }

  getGroupClusters(topic) {
    this.clusters = [];
    this.meetupService.getGroupClusters(this.selectedCity, this.selectedCategory, topic)
      .subscribe((res: any) => {
        console.log('group clsuter', res);

        // Populate list
        res.map(index => {
          // console.log(res[index][0])
          this.clusters.push(JSON.parse(index));
        });

        console.log(this.clusters);
        // this.displayBubblePlot();
        this.displayTopicMatrix();

      });
  }
  displayBubblePlot() {
    if (this.clusters.length === 0) { return; }

    const element = this.topicMatrixContainer.nativeElement;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const f = d3.format('.2f');
    const margin = { top: 15, left: 20, right: 20, bottom: 15 };
    const w = element.offsetParent.clientWidth - margin.left - margin.right;
    const h = Math.min(element.offsetParent.clientHeight, 500);
    const diameter = w * 0.6;
    const bubble = d3.pack()
      .size([ diameter, diameter ])
      .padding(1.5);

    const contentWidth = w - margin.left;
    const contentHeight = element.offsetHeight - margin.top;
    const radius = d3.scaleLinear().domain([ 0, 1 ]).range([ 2, 20 ]);

    // Init SVG
    const svg = d3.select(element)
      .append('svg')
      .attr('width', diameter + this.margin.left + this.margin.right)
      .attr('height', diameter + this.margin.top)
      .attr('class', 'bubble')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('text')
      .attr('x', w / 2 - 2 * margin.left - margin.right)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(`Top 10 popular topics under ${this.selectedTopic}`);


    // Transform data
    const data = { children: [] };

    this.clusters.forEach((topic: any, index: number) => {
      topic.forEach((el: any) => {
        // if (data.children && !data.children.includes(el)) {
        el.topic = index;
        data.children.push(el);
        // }
      });
    });
    const nodes = d3.hierarchy(data).sum((d: any) => (d.weight));

    const node = svg.selectAll('.node')
      .data(bubble(nodes).descendants())
      .enter()
      .filter((d: any) => {
        return !d.children;
      })
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');

    node.append('title').text((d: any) => d.term + ': ' + d.weight);
    node.append('circle').attr('r', (d) => d.r)
      .style('fill', (d: any, i: any) => color(d.data.topic))
      .on('click', (d: any) => {
        // alert("clicked")
        this.filterGroupsByTopic(d.data.term);
      });

    node.append('text').attr('dy', '0.8em')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .text((d: any) => d.data.term).attr('fill', 'white');
    node.append('text').attr('dy', '2em')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .text((d: any) => f(d.data.weight)).attr('fill', 'white');

    const numTopics = d3.range(10);
    svg.selectAll('mydots')
      .data(numTopics)
      .enter()
      .append('circle')
      .attr('cx', diameter + 15)
      .attr('cy', function (d, i) { return 100 + i * 25; }) // 100 is where the first dot appears. 25 is the distance between dots
      .attr('r', 7)
      .style('fill', function (d: any) { return color(d); });

    // Add one dot in the legend for each name.
    svg.selectAll('mylabels')
      .data(numTopics)
      .enter()
      .append('text')
      .attr('x', diameter + 25)
      .attr('y', function (d, i) { return 100 + i * 25; }) // 100 is where the first dot appears. 25 is the distance between dots
      .style('fill', 'black')
      .text(function (d: any) { return 'Topic: ' + (d + 1); })
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle');

  }
  filterGroupsByTopic(topic) {
    this.selectedGroups = [];
    this.meetupService.getGroupsByTopic(this.selectedCity, this.selectedCategory, topic, 100, this.selectedSort)
      .subscribe((res: any) => {
        res.map(g => this.selectedGroups.push(new Group(g[ 0 ], g[ 1 ], g[ 2 ], g[ 3 ], g[ 4 ], g[ 5 ])));
        // this.getGroupClusters()
      });
  }

  displayTopicMatrix() {
    if (this.clusters.length === 0) {
      return;
    }

    const element = this.topicMatrixContainer.nativeElement;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const f = d3.format('.2f');
    const margin = { top: 15, left: 30, right: 30, bottom: 15 };
    const w = element.offsetParent.clientWidth - this.margin.left - this.margin.right;
    const h = Math.min(element.offsetParent.clientHeight, 500) - this.margin.top;
    const radius = d3.scaleLinear().domain([ 0, 1 ]).range([ 8, 32 ]);
    const x = d3.scaleBand().rangeRound([ 0, w ]);
    const y = d3.scaleBand().rangeRound([ 0, h - this.margin.top ]);



    // Init SVG
    const svg = d3.select(element)
      .append('svg')
      .attr('width', w + this.margin.left + this.margin.right)
      .attr('height', h + this.margin.top)
      .attr('class', 'matrix')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // Add title
    svg.append('text')
      .attr('x', w / 2)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .text(`Top 10 popular sub-topics under ${this.selectedCity} > ${this.selectedCategory} > ${this.selectedTopic} `);


    // Transform data
    let data = [];

    this.clusters.forEach((topic: any, index: number) => {
      topic.forEach((el: any) => {
        // if (data.children && !data.children.includes(el)) {
        el.topic = `Topic ${index + 1}`;
        data.push(el)
        // data.push({ topic: index, value: el });
        // }
      });
    });
    data = d3.nest()
      .key(function (d: any) { return d.topic; })
      .entries(data);
    data.map(el => {
      el.maxWeight = _.maxBy(el.values, 'weight').weight
    });
    data = _.orderBy(data, [ 'maxWeight' ], [ 'desc' ])
    y.domain(data.map((d: any) => {

      return d.key;
    }));
    const numTerms: any = 5
    const xDomain: any = []
    for (let i = 0; i < numTerms; i++) {
      xDomain.push(`Term ${i + 1}`)
    }
    x.domain(xDomain)
    console.log('Matrix term: ', x.domain());
    console.log('Sorted data: ', data);

    const rows = svg.selectAll('.row')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d: any) => 'translate(0,' + y(d.key) + ')');

    const cells = rows.selectAll('.cell')
      .data((d: any) => d.values)
      .enter()
      .append('g')
      .attr('transform', (d: any, i: any) => 'translate(' + i * x.bandwidth() + ',0)')
      .attr('class', 'cell');

    const circle = cells.append('circle')
      .style('fill', (d: any, i: any) => {
        return color(d.topic)
      })
      .attr('cx', x.bandwidth() / 2)
      .attr('cy', y.bandwidth() / 2)
      .attr('r', (d: any) => d.weight === 0 ? 0 : radius(d.weight));

    const weight = cells.append('text')
      .attr('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .attr('dx', x.bandwidth() / 2)
      .attr('dy', y.bandwidth() / 2 + 4)
      .style('font-size', '10px')
      .text((d: any) => { return d.weight !== 0 ? f(d.weight) : ''; });

    const term = cells.append('text')
      .attr('text-anchor', 'middle')
      .attr('dx', (d: any) => x.bandwidth() / 2 + (radius(d.weight) * 2 + 20))
      .attr('dy', y.bandwidth() / 2 + 4)
      .style('font-size', '10px')
      .text((d: any) => { return d.term });

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (h - this.margin.top) + ')')
      .call(d3.axisBottom(x));

    svg.append('g').attr('class', 'y aixs').call(d3.axisLeft(y));


  }


}


export class TopicFrequency {
  topic: string;
  frequency: number;
}
