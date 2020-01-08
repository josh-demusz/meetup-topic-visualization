import text_analysis_dao as tad


def text_metrics(city: str, category: str, level_type: str, selection: str):
    sentiment = {}
    if level_type == 'Category':
        sentiment = tad.byCategory(city, category)
    elif level_type == 'Event':
        sentiment = tad.byEvent(city, category, selection)
    elif level_type == 'Cluster':
        sentiment = tad.byCluster(city, category, selection)
    elif level_type == 'Group':
        sentiment = tad.byGroup(city, category, selection)
    else:
        print('Error: select correct level type')

    return sentiment
