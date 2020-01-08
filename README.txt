Data and Visual Analytics: Visual Analysis of Meetup Topics
Code deliverable of CS6242's final research project

Authors:
- Alejandro Ardila
- Jashua Thejas Arul Dhas
- Joshua Demusz
- Justin Lewis
- Khan Tran
- Tri Nguyen

DESCRIPTION:

Event marketing is an attractive research opportunity due to emerging technologies that are narrowing the gap between offline social interactions and online event hosting. According to the latest Event Marketing Benchmarks and Trends report, over-performing companies and organizations invest between 20% to 50% of the marketing budget in hosting live events. Thus, hosting an event is one of the most effective channels for accomplishing business goals. Thanks to data available from event-based social networks like Meetup, event organizers can gain valuable insights about their audiences in order to grow and improve their events.
We created a tool that uses Meetup's information to give a set of visualizations that aim for interpreting the current status of an event topic in the San Francisco area.

Project Scaffolding
The project is divided in 4 main modules:
- `extractor` module: Includes a tool that automatically connects to Meetup's private API and downloads all the extracted data into a `meetup.db` SQLite3 file.
- `meetup-service` module: Python Flask back-end that connects to `meetup.bd`'s file and reads provides the extracted data.
- `meetup-topics-ui` module: Angular 8 front-end that uses D3.js to properly visualize the queried data.

INSTALLATION & EXECUTION

For a successful deployment, the computer must have python|pip version 3.7.X installed and for the frontend,
node version >= 10.9 and npm must be installed as well. 

* python3 installation guide: https://djangocentral.com/how-to-install-python-3-and-set-up-a-local-programming-environment-on-mac-os/
* node v10.9 installation guide: https://www.npmjs.com/get-npm

For a quick installation guide, unzip the project folder and refer to: https://youtu.be/sJUB8Roe8nM

The `extractor` module
Requirements
- python 3.7.X
- requests python library
- requests_oauthlib python library
- pandas library
- figlet library
To run the extractor

Execute the file `meetup-data-extractor.py` in the following form:
python meetup-data-extractor.py --client <meetup_client_id> --secret <meetup_secret_key> path/to/output.db'

Where the `client` and `secret` arguments are private Meetup secrets that can be obtained by creating an account 
in meetup.com and registering an OAuth 2.0 consumer. For more information on how to do this,
please go to [Meetup's API Documentation](https://www.meetup.com/meetup_api/docs/ "Meetup's API Documentation").

The `meetup-service` module
Requirements
- python 3.7.X
- flask
- gensim
- nltk
- pandas
- sklearn
- matplotlib
- seaborn

To run the back-end:
Go into the meetup-service directory and execute the following commands:
`pip install -r requirements.txt`
`env FLASK_APP=meetup_controller.py flask run`

The `meetup-topics-ui` module
Requirements
- node v10.9 or grater
- npm
- @angular/cli npm library

To run the front-end:
npm install -g @angular/cli
npm install
ng serve
Then go to a browser and access `localhost:4200`

WHEN APP IS DEPLOYED:

* Bar chart visualization: Select San Francisco City, the Tech category and click the  "Show Results" button.
* Bubble chart visualization: Click on one of the bars in the bar chart to look at the topic distribution for that specific category.
* Pie chart: Click on the comment analysis tab and select the Category filter.

Edge cases when running:
- Some searches do not have comments under them. If pie chart does not show up, try a different search.
