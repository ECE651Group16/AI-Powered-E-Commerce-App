import pandas as pd
import numpy as np
from .models import Product
from django.db.models import F
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def get_all_products():
    products = Product.objects.all()
    return products

#calculates the most similar products of a given product
#currently using item title and collection id for recommendation
def get_similar_products(input_title: str, collection_id, vectorizer: TfidfVectorizer, tfidf_matrix, num_to_recommend):
    # Transform the input title into tfidf vector
    input_features = vectorizer.transform([input_title])

    # Calculate cosine similarity
    sim_score = cosine_similarity(tfidf_matrix, input_features)

    # A penalty is applied to products from different collections
    # to favor products in the same collection
    penalty_coefficient = 0.25
    collection_penalty = F('collection_id') != collection_id
    sim_score_w_penalty = sim_score * (1 - penalty_coefficient * collection_penalty)
    sim_score_w_penalty = sim_score_w_penalty.flatten()
    # Find the indices of the highest scores
    #the if-else prevents when products in database less than num_to_recommend
    if (len(sim_score_w_penalty) > num_to_recommend):
        # Exclude the index of the product itself (product with the highest cosine score)
        highest_score_index = np.argmax(sim_score_w_penalty)
        sim_score_w_penalty[highest_score_index] = -np.inf
        ind = np.argpartition(sim_score_w_penalty.flatten(), sim_score_w_penalty.size -num_to_recommend)[-num_to_recommend:]
    else:
        return Product.objects
    # Convert int64 indices to Python integers (to prevent errors)
    ind = [int(i) for i in ind]

    # Extract primary keys (PKs) of recommended products
    recommended_pks = [Product.objects.all()[i].pk for i in ind]

    # Filter the queryset using the extracted PKs
    return Product.objects.filter(pk__in=recommended_pks)

#calls the fn. above, returns the most similar products of a given product 
def recommend(item_title, num_to_recommend = 6):
    # Load our_products data
    products = get_all_products()

    # Define a TF-IDF Vectorizer Object
    vectorizer = TfidfVectorizer(stop_words='english')
    # #Replace NaN with an empty string
    all_titles = [product.title for product in products]
    tfidf_matrix = vectorizer.fit_transform(all_titles)

    # # Construct the TF-IDF matrix
    tfidf_matrix = vectorizer.fit_transform(all_titles)

    # Find the matching product and its collection_id
    matching_products = products.filter(title=item_title)
    if not matching_products.exists():
        raise ValueError("Error: Item '{}' not found in the dataset.".format(item_title))
    matching_product = matching_products.first()
    item_collection_id = matching_product.collection

    recomm_items = get_similar_products(item_title, item_collection_id, vectorizer, tfidf_matrix, num_to_recommend)
    #print(recomm_items['collection_id'],recomm_items['title'])
    return recomm_items
