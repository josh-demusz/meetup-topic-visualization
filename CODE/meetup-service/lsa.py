#!/usr/bin/env python
# coding: utf-8

from sklearn.decomposition import TruncatedSVD
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sqlite3
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from meetup_dao import find_events_for_clustering, find_groups_for_clustering
# In[9]:


# # Create a SQL connection to our SQLite database
# con = sqlite3.connect("./meetup.db")

# # Load the data into a DataFrame
# topics = pd.read_sql_query("SELECT * from topics", con)
# groups_topics = pd.read_sql_query("SELECT topic_name, topic_id from groups_topics", con)
# business_groups = pd.read_sql_query("select category_name, group_name, g.description, group_name || ' ' || g.description name_desc, count(distinct event_id) num_events, count(*) total "                            "from events e inner join groups g using (group_id) inner join categories c using (category_id)"                            "where category_id = 2 group by group_id order by num_events desc;", con)


# # In[10]:


# documents = business_groups['name_desc']
# print("# of Business Groups: {}".format(len(documents)))


    
# Preprocessing
def clean(docs):
    # nltk.download('stopwords')
    import re
    stop_words = stopwords.words('english')
    ps = PorterStemmer() 
         
    df = pd.DataFrame({'document': docs})
    
    regex = re.compile('(<p>)|(</p>)|(<span>)|(</span>)|(<b>)|(</b>)|(<br>)|(<blockquote>)|'\
                       '(http)|(www)|(&nbsp)|(.com)|(href)|(<a)|(</a>)', re.S)
    df['clean_doc'] = df['document'].astype(str).apply(lambda x: re.sub(regex, ' ', x))
    
    # remove special characters
    df['clean_doc'] = df['clean_doc'].str.replace("[^a-zA-Z#]", " ")
    
    
    # remove short words
#     df['clean_doc'] = df['clean_doc'].apply(lambda x: ' '.join([w for w in x.split() if len(w)>1]))
    
    # make all text lowercase
    df['clean_doc'] = df['clean_doc'].apply(lambda x: x.lower())
    
    # tokenization
    tokenized_doc = df['clean_doc'].apply(lambda x: x.split())
    
    # remove stop words and stemming
    tokenized_doc = tokenized_doc.apply(lambda x: [ps.stem(item) for item in x if item not in stop_words])
    
    # de-tokenization
    detokenized_doc = []
    for i in range(len(df)):
        t = ' '.join(tokenized_doc[i])        
        detokenized_doc.append(t)
    
    df['clean_doc'] = detokenized_doc
    return df

# df = clean(documents)
# df.head(15)


# In[12]:






# print("Document-term matrix shape: {}".format(X.shape))
# X.data


# In[13]:


def run_lsa(city: str, category: str, topic: str, use_name: bool, use_desc: bool):
    documents = find_groups_for_clustering(city, category, topic, use_name, use_desc)
    
    # Preprocess document
    df = clean(documents)

    # Create document-term matrix (tf-idf)
    vectorizer = TfidfVectorizer(stop_words='english',
                                 max_features= 500, # keep top 1000 terms
                                max_df = 0.5,
                                smooth_idf=True)

    X = vectorizer.fit_transform(df['clean_doc'])

    # Compute SVD from document-term matrix
    svd_model = TruncatedSVD(n_components=10, algorithm='randomized', n_iter=100, random_state=122)

    svd_model.fit(X)

    terms = vectorizer.get_feature_names()
    export = []
    for i, comp in enumerate(svd_model.components_):
        terms_comp = zip(terms, comp)
        sorted_terms = sorted(terms_comp, key=lambda x: x[1], reverse=True)
        sorted_terms_df = pd.DataFrame(sorted_terms[:5], columns=['term', 'weight'])     
        export.append(sorted_terms_df.to_json(orient='records'))
        # title = "Topic "+str(i)+": " + " ".join(sorted_terms_df['term'][:10])
    return export
    #     for t in sorted_terms:
    #         print(t[0] + " ")
        # plt.figure()
        # sns.barplot(x="weight", y="term", data=sorted_terms_df[:10], color='g').set_title(title)

    # with open('sample_lsa_result.json', 'w') as outfile:
    #     json.dump(export, outfile)


    # In[148]:


    # Be sure to close the connection
    # con.close()

