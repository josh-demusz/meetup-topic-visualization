import sqlite3, json

def byCategory(city, category):
    conn = sqlite3.connect('../data/meetup.db')
    query = "select polarity_analysis as sentiment, "\
        "emotion_analysis as emotion, intent_analysis as intent, "\
        "sarcasm_analysis as sarcasm, abuse_analysis as abuse "\
        "from text_analysis join groups on groups.group_id = text_analysis.group_id "\
        "where groups.city='"+city+"' and groups.category_name='"+category+"'"

    txt_analysis_rs = conn.execute(query)

    response = {}
    for tar in txt_analysis_rs:
        response.update(json.loads(tar[0]))
        response.update(json.loads(tar[1]))
        response.update(json.loads(tar[2]))
        response['sarcasm'] = json.loads(tar[3])
        response['abuse'] = json.loads(tar[4])

    return response

def byEvent(city, category, event_name):
    conn = sqlite3.connect('../data/meetup.db')
    query = "select polarity_analysis as sentiment, "\
        "emotion_analysis as emotion, intent_analysis as intent, "\
        "sarcasm_analysis as sarcasm, abuse_analysis as abuse "\
        "from text_analysis join events on events.event_id = text_analysis.event_id "\
        "join groups on groups.group_id = text_analysis.group_id "\
        "where groups.city='"+city+"' and groups.category_name='"+category+"' "\
        "and events.event_name like '%"+event_name+"%'"

    txt_analysis_rs = conn.execute(query)

    response = {}
    for tar in txt_analysis_rs:
        response.update(json.loads(tar[0]))
        response.update(json.loads(tar[1]))
        response.update(json.loads(tar[2]))
        response['sarcasm'] = json.loads(tar[3])
        response['abuse'] = json.loads(tar[4])

    return response

def byCluster(city, category, cluster):
    conn = sqlite3.connect('../data/meetup.db')
    query = "select polarity_analysis as sentiment, "\
        "emotion_analysis as emotion, intent_analysis as intent, "\
        "sarcasm_analysis as sarcasm, abuse_analysis as abuse "\
        "from text_analysis join events on events.event_id = text_analysis.event_id "\
        "join groups on groups.group_id = text_analysis.group_id "\
        "where groups.city='"+city+"' and events.category='"+category+"' "\
        "and events.event_name like '%"+cluster+"%' or events.event_description like '%"+cluster+"%""'"

    txt_analysis_rs = conn.execute(query)

    response = {}
    for tar in txt_analysis_rs:
        response.update(json.loads(tar[0]))
        response.update(json.loads(tar[1]))
        response.update(json.loads(tar[2]))
        response['sarcasm'] = json.loads(tar[3])
        response['abuse'] = json.loads(tar[4])

    return response

def byGroup(city, category, group):
    conn = sqlite3.connect('../data/meetup.db')
    query = "select polarity_analysis as sentiment, "\
        "emotion_analysis as emotion, intent_analysis as intent, "\
        "sarcasm_analysis as sarcasm, abuse_analysis as abuse "\
        "from text_analysis join groups on groups.group_id = text_analysis.group_id "\
        "where groups.city='"+city+"' and groups.category_name='"+category+"' "\
        "and groups.group_name like '%"+ group +"%' or groups.group_url like '%"+ group +"%'"

    txt_analysis_rs = conn.execute(query)

    response = {}
    for tar in txt_analysis_rs:
        response.update(json.loads(tar[0]))
        response.update(json.loads(tar[1]))
        response.update(json.loads(tar[2]))
        response['sarcasm'] = json.loads(tar[3])
        response['abuse'] = json.loads(tar[4])

    return response