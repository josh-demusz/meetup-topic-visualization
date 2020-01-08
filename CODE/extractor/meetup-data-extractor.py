import requests, json, csv, argparse, pandas as pd, sqlite3
from tqdm import tqdm
from requests_oauthlib import OAuth2Session
from pyfiglet import Figlet

redirect_uri = 'https://github.gatech.edu/pages/aardila3/DVA-team08/'

def extract(client, secret):
  conn = sqlite3.connect('meetup.db')
  code = ask_for_code(client, secret)
  token_info = access_meetup(client, secret, code)
  headers = {
    'authorization': "Bearer " + token_info['access_token'],
    'content-type': "application/json",
  }
  
  group_resp = pd.DataFrame()
  topic_resp = pd.DataFrame()
  categories_resp = pd.DataFrame()
  group_topic_resp = pd.DataFrame()
  group_urls = set()
  
  with open('sanfran.csv') as location_csv:
      csv_reader = csv.reader(location_csv, delimiter=',')
      line_count= 0
      loc_pbar = tqdm(csv_reader, unit='location')
      for row in loc_pbar:
          if line_count > 0:
              lat = row[0]
              lon = row[1]

              loc_pbar.set_description('Querying Meetup groups')
              loc_pbar.set_postfix(lat=lat, lon=lon)
              (urls, groups_categories, groups, categories) = query_meetup_groups(lat, lon, headers)
              group_urls |= set(urls)
              group_resp = group_resp.append(pd.DataFrame(groups))
              categories_resp = categories_resp.append(pd.DataFrame(categories))

              loc_pbar.set_description('Querying Meetup topics')
              (topic_ids, topics) = query_meetup_topics(lat, lon, headers)
              topic_resp = topic_resp.append([t for tops in topics for t in tops])
              top_ids = [t for tops in topic_ids for t in tops]

              group_topic_resp = group_topic_resp.append(pd.DataFrame(get_groups_topics(top_ids, groups_categories)))
          line_count += 1
     
      print('Done !')
      group_resp.to_sql('groups', conn, index=False, if_exists='replace')
      topic_resp.to_sql('topics', conn, index=False, if_exists='replace')
      categories_resp.to_sql('categories', conn, index=False, if_exists='replace')
      group_topic_resp.to_sql('groups_topics', conn, index=False, if_exists='replace')

  # Query events and comments
  events_resp = pd.DataFrame()
  comments_resp = pd.DataFrame()
  g_pbar = tqdm(group_urls, desc='Querying Meetup events')

  for url in g_pbar:
    g_pbar.set_postfix(group_url=url)
    (event_ids, events) = query_meetup_events(url, headers)
    events_resp = events_resp.append(pd.DataFrame(events))
    evt_pbar = tqdm(event_ids, desc=f'Querying Meetup comments', unit='groups')
    for evt in event_ids:
      evt_pbar.set_postfix(group_url=url, event_id=evt)
      comments = query_meetup_comments(url, evt, headers)
      comments_resp = comments_resp.append(pd.DataFrame(comments))

  events_resp.to_csv('events.csv', headers=True, index=False)
  comments_resp.to_csv('events_comments.csv', headers=True, index=False)
  events_resp.to_sql('events', conn, index=False, if_exists='replace')
  comments_resp.to_sql('events_comments', conn, index=False, if_exists='replace')
 

  print('Done!')
      



def query_meetup_groups(lat, lon, headers):
  groups = requests.get(f'https://api.meetup.com/find/groups?&sign=true&photo-host=public&lon={lon}&radius=1&lat={lat}&order=most_active&page=1000&omit=score,untranslated_city,localized_country_name,localized_location,region2,member_pay_fee,organizer,group_photo,key_photo,next_event,meta_category', headers=headers)
  mapped_groups = [parse_group(g) for g in groups.json()]
  
  return [g[0] for g in mapped_groups], [g[1] for g in mapped_groups], [g[2] for g in mapped_groups], [g[3] for g in mapped_groups]

def parse_group(g):
  cat = g.pop('category', {})

  return [
    g['urlname'], 
    {
      'group_id': g['id'],
      'category_id': cat['id'] if bool(cat) else -1,
    },
    {
      'group_id': g['id'],
      'category_id': cat['id'] if bool(cat) else -1,
      'city': g['city'],
      'country': g['country'],
      'description': g['description'],
      'join_mode': g['join_mode'],
      'lat': g['lat'],
      'link': g['link'],
      'lon': g['lon'],
      'members': g['members'],
      'group_name': g['name'],
      'state': g['state'],
      'timezone': g['timezone'],
      'urlname': g['urlname'], 
      'visibility': g['visibility'],
      'who': g['who']
    },
    {
      'category_id': cat['id'],
      'category_name': cat['name'],
      'shortname': cat['shortname'],
      'sort_name': cat['sort_name'],
    } if bool(cat) else {}]

def query_meetup_topics(lat, lon, headers):
  topics = requests.get(f'https://api.meetup.com/find/topic_categories?&sign=true&photo-host=public&lon={lon}&fields=best_topics&radius=1&lat={lat}', headers=headers)
  mapped_topics = [parse_topic(t) for t in topics.json()]

  return [t[0] for t in mapped_topics], [t[1] for t in mapped_topics]

def parse_topic(json_topic):
  # no members field in query
  topics = []
  ids = []
  best_topics = json_topic['best_topics']

  
  for ci in json_topic['category_ids']:
      # Create parent topic
      ids.append({
        'topic_id': json_topic['id'],
        'topic_key': json_topic['shortname'],
        'topic_name': json_topic['name'],
        'category_id': ci
      })
      topics.append({
        'topic_id': json_topic['id'],
        'topic_name': json_topic['name'],
        'urlkey': json_topic['shortname'],
        'main_topic_id': -1
      })

      # Create child topics
      for t in best_topics:
        ids.append({
          'topic_id': t['id'],
          'topic_key': t['urlkey'],
          'topic_name': t['name'],  
          'category_id': ci
        })
        topics.append({
          'topic_id': t['id'],
          'topic_name': t['name'],
          'urlkey': t['urlkey'],
          'main_topic_id': json_topic['id']
        })
  
  return [ids, topics]

def get_groups_topics(topic_ids, groups):
  topics_df = pd.DataFrame(topic_ids)
  group_cat_df = pd.DataFrame(groups)
  result = pd.merge(topics_df, group_cat_df, on=['category_id'])
  del result['category_id']
  return result

def query_meetup_events(group_url, headers):
  event_resp = requests.get(f'https://api.meetup.com/{group_url}/events?&sign=true&photo-host=public&page=100', headers=headers)
  return [[e['id'] for e in event_resp.json()], [{'event_id': e['id'], 'event_name': e['name']} for e in event_resp.json()]]

def query_meetup_comments(group_url, event_id, headers):
  comments = requests.get(f'https://api.meetup.com/{group_url}/events/{event_id}/comments?&sign=true&photo-host=public&page=50', headers=headers)
  coms = []
  for c in comments.json():
    if c != 'errors':
      coms.append({'group_url': group_url, 'event_id': event_id , 'comment_id': c['id'], 'comment': c['comment']})
  return coms

def ask_for_code(client, secret):
  oauth = OAuth2Session(client, redirect_uri=redirect_uri)
  authorization_url, state = oauth.authorization_url('https://secure.meetup.com/oauth2/authorize')
  print(f'Please go to {authorization_url} and copy the "code" query param from the URL')
  return input('Enter the code here: ')

def access_meetup(client, secret, code):
  access_url = f'https://secure.meetup.com/oauth2/access?client_id={client}&client_secret={secret}&grant_type=anonymous_code&redirect_uri={redirect_uri}&code={code}'
  return requests.post(access_url).json()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='sample command:  python meetup-data-extractor.py --client <meetup_client_id> --secret <meetup_secret_key> path/to/output')
    #parser.add_argument("filepath", help="path of the files containing geo polygons to fetch")

    parser.add_argument("-c", "--client", dest="client", required=True,
                        help="specify the client key obtained by creating an OAuth consumer")

    parser.add_argument("-s", "--secret", dest="secret",
                        help="specify client secret key obtained by creating an OAuth consumer",
                        required=True)

    args = parser.parse_args()

    custom_fig = Figlet(font='standard')
    print(custom_fig.renderText('DVA Meetup Extractor'))

    extract(args.client, args.secret)