# #need to pip install pandas and scikit-learn
# import pandas as pd
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import linear_kernel
# import re

# # # Load Movies Metadata

# our_products = pd.read_csv('data/our_store_products.csv', low_memory=False)

# #--------Preprocessing: data cleaning--------
# # # Function to remove 
# # def remove_spaces(data):
# #     return data.replace(" ", "")
# # Function for converting into lower case
# def make_lower_case(text):
#     return text.lower()
# # Function for removing punctuation and spaces
# def remove_punctuation_spaces(text):
#     pattern = r'[^\w]|\s'
#     # Tokenize a string using the regular expression pattern
#     tokens = re.split(pattern, text)
#     text = "".join(tokens)
#     return text
# # Function for removing the html tags
# def remove_html(text):
#     html_pattern = re.compile('<.*?>')
#     return html_pattern.sub(r'', text)

        
# # Apply clean_data function to desired features  
# features = ['title']
# # for feature in features:
# #     our_products[feature] = our_products[feature].apply(remove_html)
# #     our_products[feature] = our_products[feature].apply(make_lower_case)
# #     our_products[feature] = our_products[feature].apply(remove_punctuation_spaces)


# print("the products are:", our_products['title'])


# #Define a TF-IDF (Term Frequency-Inverse Document Frequency) Vectorizer Object. 
# #Remove all english stop words such as 'the', 'a'
# tfidf = TfidfVectorizer(stop_words='english')

# # #Replace NaN with an empty string
# # # currently can only title since our description is Lorem Ipsum
# # our_products['title'] = our_products['title'].fillna('')

# #Construct the required TF-IDF matrix by fitting and transforming the data
# tfidf_matrix = tfidf.fit_transform(our_products['title'])

# #Output the shape of tfidf_matrix
# #each row is one item, each column is one word that appeared in all item titles
# print("tfidf matrix:", tfidf_matrix.shape,"is:\n", tfidf_matrix[1][0])

# print(tfidf.get_feature_names_out()[800:820])

# # Compute the cosine similarity matrix
# cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
# #compute a reverse map of indices and item titles. Will be used when getting recommendations
# indices = pd.Series(our_products.index, index=our_products['title']).drop_duplicates()

# # Function that takes in item title as input and outputs most similar products
# def get_recommendations(item_title, num_to_recomm = 5, cosine_sim=cosine_sim):
#     print("hii")
#     #Get the index of the items that matches the title
#     idx = indices[item_title]
#     #Get the pairwsie similarity scores of all items
#     sim_scores = list(enumerate(cosine_sim[idx])) 
#     #Sort the products based on the similarity scores
#     sim_scores = sorted(sim_scores, key=lambda x: x[1],    reverse=True)
#     #Only get the scores of the n most similar items
#     sim_scores = sim_scores[1:num_to_recomm+1]
#     print(sim_scores)
#     # Item indicies, Get the items indices
#     shop_indices = [i[0] for i in sim_scores]
   
     
    
#     print(our_products['title'].iloc[shop_indices])
# get_recommendations('Pepsi - 600ml')




# #need to pip install pandas and scikit-learn and nltk 
import nltk
# nltk.download('punkt')
# nltk.download('stopwords')
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Load our_products data
our_products = pd.read_csv('data/our_store_products.csv', low_memory=False)

# Function for preprocessing text
def preprocess_text(text):
    # Convert text to lowercase
    text = text.lower()
    # Tokenize text
    tokens = word_tokenize(text)
    # Remove stop words
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words]
    # Join tokens back into text
    text = ''.join(tokens)
    return text

# Apply preprocessing to the 'title' column
our_products['title'] = our_products['title'].apply(preprocess_text)

# Define a TF-IDF Vectorizer Object
tfidf = TfidfVectorizer()

# Construct the TF-IDF matrix
tfidf_matrix = tfidf.fit_transform(our_products['title'])

# Compute the cosine similarity matrix
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

def get_recommendations(item_title, num_to_recomm=5, cosine_sim=cosine_sim):
    matching_indices = our_products[our_products['title'] == item_title].index
    if len(matching_indices) == 0:
        print("Item '{}' not found in the dataset.".format(item_title))
        return
    idx = matching_indices[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:num_to_recomm+1]
    shop_indices = [i[0] for i in sim_scores]
    print(our_products['title'].iloc[shop_indices])

#2nd try. 
def get_recommendations2(TITLE,Tags="", cosine_sim=cosine_sim):
    #Get the index of the items that matches the title
    indices = pd.Series(our_products.index, index=our_products['title']).drop_duplicates()
    idx = indices[TITLE]
    #Get the pairwsie similarity scores of all items
    sim_scores = list(enumerate(cosine_sim[idx])) # Sort the items
    #Sort the products based on the similarity scores
    sim_scores = sorted(sim_scores, key=lambda x: x[1],    reverse=True)
    #Get the scores of the 5 most similar items
    sim_scores = sim_scores[1:5]# Item indicies, Get the items indices
    shop_indices = [i[0] for i in sim_scores]
    return our_products['title'].iloc[shop_indices]
   
     
   

title = 'Muffin Puck Ww Carrot' #item title
#title.apply(preprocess_text)
# title= map(preprocess_text, title)
# print("title:", title)
print(get_recommendations2(title))