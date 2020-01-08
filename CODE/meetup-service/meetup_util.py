def remove_duplicates(list):
    new_list = []
    added_topics = []

    for item in list:
        print(item)
        if item[0] not in added_topics:
            added_topics.append(item[0])
            new_list.append(item)

    return new_list