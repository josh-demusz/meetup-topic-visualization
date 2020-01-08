import json

from flask import Flask, Response, Request
from meetup_dao import find_cities, find_categories, find_groups, find_events, find_num_groups_by_topic_for_city_category, find_groups_by_topic, find_groups_for_clustering
from topic_extractor_service import get_clusters, run_experiment
from lsa import run_lsa
from text_analysis_service import text_metrics
from meetup_util import remove_duplicates

app = Flask(__name__)

@app.route('/get_cities', methods=['GET'])
def get_cities():

    cities = find_cities()

    response = Response(json.dumps(cities), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response #Response(json.dumps(cities), mimetype='application/json')


@app.route('/get_categories', methods=['GET'])
def get_categories():

    categories = find_categories();

    response = Response(json.dumps(categories), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response #Response(json.dumps(categories), mimetype='application/json')

@app.route('/get_num_groups_by_topic_for_city_category/<city>/<category>/<size>/<order>', methods=['GET'])
def get_num_groups_by_topic_for_city_category(city, category, size, order):
    # city = Request.args.get('city', default='', type=str)
    # category = Request.args.get('category', default='', type=str)
    print(city+" "+category)

    num_groups_by_topic_for_city_category = find_num_groups_by_topic_for_city_category(city, category, size, order)

    response = Response(json.dumps(num_groups_by_topic_for_city_category), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/groups/<city_name>/<category_name>/<group_search>', methods=['GET'])
def get_groups(category_name, city_name, group_search):

    groups = find_groups(category_name, city_name, group_search)

    response = Response(json.dumps(groups), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response #Response(json.dumps(categories), mimetype='application/json')

@app.route('/events/<city_name>/<category_name>/<event_search>', methods=['GET'])
def get_events(category_name, city_name, event_search):

    events = find_events(category_name, city_name, event_search);

    response = Response(json.dumps(events), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response #Response(json.dumps(categories), mimetype='application/json')

@app.route('/clusters/<string:city>/<string:category>/<string:level_type>/<int:num_clusters>/<int:num_words>/<int:min_word_length>/<string:use_name>/<string:use_desc>', methods=['GET'])
def get_clusters_for_group_event(city: str, category: str, level_type: str, num_clusters: int, num_words: int, min_word_length: int, use_name: str, use_desc: str):

    use_name = bool(use_name)
    use_desc = bool(use_desc)

    [clusters, lda_model, corpus, tokenized_items, dictionary_LDA] = get_clusters(city, category, level_type, num_clusters, num_words, min_word_length, use_name, use_desc)

    clusters = remove_duplicates(clusters)

    response = Response(json.dumps(clusters), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/text-metrics/<string:city>/<string:category>/<string:level_type>/<string:selection>', methods=['GET'])
def get_text_metrics(city: str, category: str, level_type: str, selection: str):
    
    metrics = text_metrics(city, category, level_type, selection)

    # metrics = {}
    # metrics['sentiment'] = {'negative': 0.234, 'neutral': 0.157, 'positive': 0.609}
    # metrics['emotion'] = {'Angry': 0.075469798, 'Happy': 0.5655819433, 'Excited': 0.2855230979, 'Fear': 0.0502375179, 'Sad': 0.0075975849, 'Bored': 0.0155900579}
    # metrics['intent'] = {'news': 0.11, 'query': 0.094, 'spam': 0.142, 'marketing': 0.2, 'feedback': {'score': 0.454, 'tag': {'complaint': 0.078, 'suggestion': 0.826, 'appreciation': 0.096}}}
    # metrics['sarcasm'] = {'Sarcastic': 0.4945215805, 'Non-Sarcastic': 0.5054784195}
    # metrics['abuse'] = {'abusive': 0.9772409797, 'hate_speech': 0.0198874939, 'neither': 0.0028715532}

    response = Response(json.dumps(metrics), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/run-topic-extractor-experiment/<int:num_iterations>', methods=['GET'])
def run_topic_extractor_experiment(num_iterations: int):
    run_experiment(num_iterations)

    response = Response('Done', mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/get_groups_by_topic/<city>/<category>/<topic>/<size>/<order>', methods=['GET'])
def get_groups_by_topic(city, category, topic, size, order):
    # city = Request.args.get('city', default='', type=str)
    # category = Request.args.get('category', default='', type=str)
    # print(city+" "+category)

    groups_by_topic = find_groups_by_topic(city, category, topic, size, order)

    response = Response(json.dumps(groups_by_topic), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/lsa_clusters/<string:city>/<string:category>/<string:topic>/<string:use_name>/<string:use_desc>', methods=['GET'])
def get_group_clusters(city: str, category: str, topic: str,  use_name: str, use_desc: str):
    # city = Request.args.get('city', default='', type=str)
    # category = Request.args.get('category', default='', type=str)
    # print(city+" "+category)

    result = run_lsa(city, category, topic, use_name, use_desc)
    # result = find_groups_for_clustering(city, category, topic, use_name, use_desc)

    response = Response(json.dumps(result), mimetype='application/json')
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response
