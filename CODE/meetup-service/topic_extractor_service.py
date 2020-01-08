from meetup_dao import find_events_for_clustering, find_groups_for_clustering
from gensim import corpora, models
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag
import nltk
import matplotlib, matplotlib.pyplot as plt
matplotlib.use('Agg')

def get_clusters(city: str, category: str, level_type: str, num_clusters: int, num_words: int, min_word_length: int, use_name: bool, use_desc: bool):

    if level_type == 'group':
        items = find_groups_for_clustering(city, category, use_name, use_desc)
    elif level_type == 'event':
        items = find_events_for_clustering(city, category, use_name, use_desc)
    else:
        print('Error: select correct level type.')
        items = []

    # Get cleaned/tokenized items
    tokenized_items = clean_and_preprocess(items, min_word_length)

    # Setup topic extraction model
    dictionary_LDA = corpora.Dictionary(tokenized_items)
    dictionary_LDA.filter_extremes(no_below=1)
    corpus = [dictionary_LDA.doc2bow(tokenized_event) for tokenized_event in tokenized_items]

    print(corpus)

    # Run topic extraction model
    lda_model = models.LdaModel(corpus, num_topics=num_clusters, \
                                id2word=dictionary_LDA, \
                                passes=10, alpha=[0.01] * num_clusters, \
                                eta=[0.01] * len(dictionary_LDA.keys()))

    clusters = []

    for i, topic in lda_model.show_topics(formatted=True, num_topics=num_clusters, num_words=num_words):
        split_cluster = topic.split("*")

        cluster = [split_cluster[1].strip('\"'), split_cluster[0]]
        if not cluster in clusters:
            clusters.append(cluster)

    return [clusters, lda_model, corpus, tokenized_items, dictionary_LDA] #[['kafka', .65], ['spark', .13]]

def clean_and_preprocess(items, min_word_length):
    tokenized_items = []

    for item in items:
        #     print(event)
        tokenized_event = word_tokenize(item)

        # Clean string:
        # Remove punctuation
        tokenized_event = [word.lower() for word in tokenized_event if word.isalpha()]
        # Remove if word is < X letters
        tokenized_event = [word for word in tokenized_event if len(word) >= min_word_length]
        # Remove stop words
        tokenized_event = [word for word in tokenized_event if word not in stopwords.words('english')]
        # Only keep nouns
        tags = pos_tag(tokenized_event)
        tokenized_event = [tag[0] for index, tag in enumerate(tags) if
                           (tag[1] == 'NN' or tag[1] == 'NNP' or tag[1] == 'NNS' or tag[1] == 'NNPS')]

        tokenized_items.append(tokenized_event)

    return tokenized_items

def run_experiment(num_iterations):
    iterations = num_iterations;
    max_number_words = 10;
    min_word_length = 3;

    city = 'San Francisco'
    category = 'Arts & Culture'

    perplexities_name = []
    coherence_scores_name = []
    perplexities_descr = []
    coherence_scores_descr = []
    perplexities_name_descr = []
    coherence_scores_name_descr = []

    for number_words in range(max_number_words):
        perplexities_name.append(0)
        coherence_scores_name.append(0)
        perplexities_descr.append(0)
        coherence_scores_descr.append(0)
        perplexities_name_descr.append(0)
        coherence_scores_name_descr.append(0)

    for iteration in range(iterations):
        print("Iteration: " + str(iteration));
        for number_words in range(max_number_words):
            print("Num words: "+str(number_words))

            # USE NAME
            # Get model
            [clusters, lda_model, corpus, tokenized_items, dictionary_LDA] = get_clusters(city, category, 'event', 10,
                                                                          number_words+1, min_word_length, True,
                                                                          False)
            # Compute perplexity of model
            perplexity = lda_model.log_perplexity(corpus)

            # Compute coherence score of model
            coherence_model_lda = models.CoherenceModel(model=lda_model, texts=tokenized_items, dictionary=dictionary_LDA, coherence='c_v')
            coherence = coherence_model_lda.get_coherence()

            # Aggregate scores
            perplexities_name[number_words] += perplexity
            coherence_scores_name[number_words] += coherence

            # USE DESCRIPTION
            # Get model
            [clusters, lda_model, corpus, tokenized_items, dictionary_LDA] = get_clusters(city, category, 'event', 10,
                                                                                          number_words + 1,
                                                                                          min_word_length, False,
                                                                                          True)
            # Compute perplexity of model
            perplexity = lda_model.log_perplexity(corpus)

            # Compute coherence score of model
            coherence_model_lda = models.CoherenceModel(model=lda_model, texts=tokenized_items,
                                                        dictionary=dictionary_LDA, coherence='c_v')
            coherence = coherence_model_lda.get_coherence()

            # Aggregate scores
            perplexities_descr[number_words] += perplexity
            coherence_scores_descr[number_words] += coherence

            # USE BOTH
            # Get model
            [clusters, lda_model, corpus, tokenized_items, dictionary_LDA] = get_clusters(city, category, 'event', 10,
                                                                                          number_words + 1,
                                                                                          min_word_length, True,
                                                                                          True)
            # Compute perplexity of model
            perplexity = lda_model.log_perplexity(corpus)

            # Compute coherence score of model
            coherence_model_lda = models.CoherenceModel(model=lda_model, texts=tokenized_items,
                                                        dictionary=dictionary_LDA, coherence='c_v')
            coherence = coherence_model_lda.get_coherence()

            # Aggregate scores
            perplexities_name_descr[number_words] += perplexity
            coherence_scores_name_descr[number_words] += coherence




    # Average the scores
    perplexities_name = [perplexities_name[number_words]/iterations for number_words in range(max_number_words)]
    coherence_scores_name = [coherence_scores_name[number_words]/iterations for number_words in range(max_number_words)]
    perplexities_descr = [perplexities_descr[number_words]/iterations for number_words in range(max_number_words)]
    coherence_scores_descr = [coherence_scores_descr[number_words]/iterations for number_words in range(max_number_words)]
    perplexities_name_descr = [perplexities_name_descr[number_words]/iterations for number_words in range(max_number_words)]
    coherence_scores_name_descr = [coherence_scores_name_descr[number_words]/iterations for number_words in range(max_number_words)]

    num_words = [number_words + 1 for number_words in range(max_number_words)]

    # Print graphs containing results
    plt.xlabel('Number of words')
    plt.ylabel('Perplexity')
    plt.title('Perplexity vs Number of Words in Topic')
    plt.plot(num_words, perplexities_name, label='Use name')
    plt.plot(num_words, perplexities_descr, label='Use description')
    plt.plot(num_words, perplexities_name_descr, label='Use both')
    plt.legend(loc='upper right')
    plt.savefig('perplexity.png')

    plt.clf()

    plt.xlabel('Number of words')
    plt.ylabel('Coherence score')
    plt.title('Coherence score vs Number of Words in Topic')
    plt.plot(num_words, coherence_scores_name, label='Use name')
    plt.plot(num_words, coherence_scores_descr, label='Use description')
    plt.plot(num_words, coherence_scores_name_descr, label='Use both')
    plt.legend(loc='upper right')
    plt.savefig('coherence_score.png')

    # print(perplexities)
    # print(coherence_scores)

    return
