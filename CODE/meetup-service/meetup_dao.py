import sqlite3

def find_cities():
    conn = sqlite3.connect('../data/meetup.db')
    kaggle_sql = "select * from cities;"
    api_sql = "select distinct(city) from groups;"

    cities_rs = conn.execute(api_sql)

    cities = []
    for city in cities_rs:
        cities.append(city)

    return cities

def find_categories():
    conn = sqlite3.connect('../data/meetup.db')
    categories_rs = conn.execute("select distinct(category_name) from groups;")

    kaggle_sql = "select * from categories;"
    api_sql = "select distinct(category_name) from groups;"

    categories_rs = conn.execute(api_sql)

    categories = []
    for category in categories_rs:
        categories.append(category[0])

    return categories

def find_groups(category_name, city_name, group_name):
    # sql = "select groups_topics.topic_name, groups.group_name, categories.category_name from groups " \
	#         "inner join categories on groups.category_id = categories.category_id " \
	#         "inner join groups_topics on groups.group_id = groups_topics.group_id " \
	#         "inner join topics on groups_topics.topic_id = topics.topic_id " \
	#         "where categories.category_name like '"+category_name+"' and groups.city like '%"+city_name+"%' and groups.group_name like '%"+group_name+"%' " \
    #         "and topics.topic_name like '%"+group_name+"%' "\
	#         "group by groups.group_name;"
    sql = "select groups.group_id, groups.group_name "\
        "from groups "\
        "where (groups.group_name like '%"+group_name+"%' "\
        "or groups.description like '%"+group_name+"%') "\
        "and groups.category_name like '%"+category_name+"%' "\
        "and groups.city='"+city_name+"';"

    conn = sqlite3.connect('../data/meetup.db')
    groups_rs = conn.execute(sql)

    groups = []
    for group in groups_rs:
        groups.append(group)

    return groups

def find_events(category_name, city_name, event_name):
    # sql = "select groups_topics.topic_name, events.event_name, categories.category_name from groups " \
    #             "inner join categories on groups.category_id = categories.category_id " \
    #             "inner join groups_topics on groups.group_id = groups_topics.group_id " \
    #             "inner join topics on groups_topics.topic_id = topics.topic_id " \
    #             "inner join events on groups.group_id = events.group_id " \
    #             "where categories.category_name like '"+category_name+"' and groups.city like '%"+city_name+"%' and events.event_name like '%"+event_name+"%' " \
    #             "group by events.event_name;"

    kaggle_sql = "select groups_topics.topic_name, events.event_name, categories.category_name from groups " \
                "inner join categories on groups.category_id = categories.category_id " \
                "inner join groups_topics on groups.group_id = groups_topics.group_id " \
                "inner join topics on groups_topics.topic_id = topics.topic_id " \
                "inner join events on groups.group_id = events.group_id " \
                "where categories.category_name like '"+category_name+"' and groups.city like '%"+city_name+"%' and events.event_name like '%"+event_name+"%' " \
                "group by events.event_name;"

    api_sql = "select events.event_id, events.event_name from groups " \
            "inner join events on groups.group_id = events.group_id " \
            "where groups.category_name like '"+category_name+"' and groups.city like '%"+city_name+"%' and events.event_name like '%"+event_name+"%' " \
            "group by events.event_name;"

    # print(api_sql);
    conn = sqlite3.connect('../data/meetup.db')
    events_rs = conn.execute(api_sql)
    events = []

    for event in events_rs:
        events.append(event)

    return events

def find_num_groups_by_topic_for_city_category(city, category, size, order): #city, category
    api_sql = "select count(*) as frequency, groups_topics.topic_name from groups " \
              "inner join groups_topics on groups.group_id = groups_topics.group_id " \
              "inner join topics on groups_topics.topic_id = topics.topic_id " \
              "where groups.city like '"+city+"' and groups.category_name like '"+category+"' " \
              "group by groups.city, groups.category_name, groups_topics.topic_name " \
              "order by frequency "+order+" " \
              "limit "+size+";"

    kaggle_sql = "select count(*) as frequency, groups_topics.topic_name from groups " \
              "inner join categories on groups.category_id = categories.category_id " \
              "inner join groups_topics on groups.group_id = groups_topics.group_id " \
              "inner join topics on groups_topics.topic_id = topics.topic_id " \
              "where groups.city like '"+city+"' and groups.category_name like '"+category+"' " \
              "group by groups.city, groups.category_name, groups_topics.topic_name " \
              "order by frequency "+order+" " \
              "limit "+size+";"

    conn = sqlite3.connect('../data/meetup.db')
    num_groups_by_topic_for_city_category_rs = conn.execute(api_sql)

    num_groups_by_topic_for_city_category = []

    for num_group_by_topic_for_city_category in num_groups_by_topic_for_city_category_rs:
        num_groups_by_topic_for_city_category.append(num_group_by_topic_for_city_category)

    return num_groups_by_topic_for_city_category

def find_events_for_clustering(city, category, use_name, use_desc):
    conn = sqlite3.connect('../data/meetup.db')
    api_sql = "select events.event_name, events.event_description from groups " \
            "inner join events on groups.group_id = events.group_id " \
            "where groups.category_name like '%"+category+"%' and groups.city='"+city+"' " \
            "group by events.event_name limit 100;"

    kaggle_sql = "select events.event_name, events.description from groups " \
            "inner join categories on groups.category_id = categories.category_id " \
            "inner join groups_topics on groups.group_id = groups_topics.group_id " \
            "inner join topics on groups_topics.topic_id = topics.topic_id " \
            "inner join events on groups.group_id = events.group_id " \
            "where categories.category_name like '%"+category+"%' and groups.city='"+city+"' " \
            "group by events.event_name;"

    events_rs = conn.execute(api_sql)

    events = []
    for event in events_rs:
        event_details = ""
        if use_name:
            event_details = list(event)[0]+" "
        if use_desc:
            event_details = event_details + list(event)[1]

        events.append(event_details)

    return events


def find_groups_for_clustering(city, category, topic, use_name, use_desc):
    # conn = sqlite3.connect('meetup.db');
    conn = sqlite3.connect('../data/meetup.db');

    # print(category)

    kaggle_sql = "select groups.group_name, groups.description, group_concat(distinct groups_topics.topic_name) topics " \
            "from groups " \
            "inner join categories on groups.category_id = categories.category_id " \
            "inner join groups_topics on groups.group_id = groups_topics.group_id " \
            "inner join topics on groups_topics.topic_id = topics.topic_id " \
            "where categories.category_name like '%"+category+"%' and groups.city='"+city+"' " \
            "group by groups.group_name "
    kaggle_sql += "having topics like '%{}%'".format(topic) if topic is not None else ""

    api_sql = "select groups.group_name, groups.description from groups " \
                 "inner join groups_topics on groups.group_id = groups_topics.group_id " \
                 "inner join topics on groups_topics.topic_id = topics.topic_id " \
                 "where groups.category_name like '%" + category + "%' and groups.city='" + city + "' " \
                "group by groups.group_name;"

    # print(kaggle_sql)

    groups_rs = conn.execute(api_sql);

    groups = []

    for group in groups_rs:
        # print(event)
        # print(list(event)[0])
        # print(list(event)[1])
        group_details = ""
        if use_name:
            group_details = list(group)[0]+" "
        if use_desc:
            group_details = group_details + list(group)[1]

        groups.append(group_details)

    # print(events)

    return groups
    
def find_groups_by_topic(city, category, topic, size, order): #city, category
    whereClause = "where category_name = '{category}'".format(category=category)
    whereClause += "and city = '{}' ".format(city) if city is not None else ""
    print("whereClause: ", whereClause)
    query_1 = "select category_name, group_name, g.description group_description, members, " \
            "group_concat(distinct topic_name) topics " \
            "from groups g left join groups_topics gt using (group_id)  " + whereClause + "group by group_id "
    query_1 += "having topics like '%{}%'".format(topic) if topic is not None else ""

    print(query_1)
    conn = sqlite3.connect('../data/meetup.db');
    # conn = sqlite3.connect('meetup.db');

    groups_by_topic_rs = conn.execute(query_1);

    groups_by_topic = []

    for g in groups_by_topic_rs:
        groups_by_topic.append(g)

    return groups_by_topic