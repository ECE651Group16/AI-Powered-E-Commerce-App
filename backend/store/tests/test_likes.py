import pytest
from rest_framework import status
from rest_framework.test import APIClient
from model_bakery import baker
from store.models import Product

# Function to find a liked item ID in a JSON array based on a given product ID.
def find_liked_item_id_from_product_id(json_array, product_id):
    for json_object in json_array:
        # Check if the current object's product ID matches the given product ID.
        if json_object.get('product', {}).get('id') == product_id:
            item_id = json_object.get('id')
            # Ensure that the item ID is not None.
            assert item_id is not None, "The 'id' for the product should not be None."
            return item_id
    # If product ID is not found, raise an assertion error.
    assert False, "Product ID not found in the list."


# Pytest fixture to create an API client.
@pytest.fixture
def api_client():
    return APIClient()

# Pytest fixture to create a 'likes' via POST request.
@pytest.fixture
def create_likes(api_client, authenticate):
    authenticate()
    return api_client.post('/store/likes/')

# Test class for creating likes using Django's database.
@pytest.mark.django_db
class TestCreateLikes:
    # Test case for creating likes and checking if it's successful.
    def test_create_likes(self, create_likes):
        response = create_likes
        # Assert that the response status is 201 (Created) and 'id' is in response data.
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data and response.data['id']

    # Test case for retrieving likes.
    def test_retrieve_likes(self, api_client, create_likes):
        response = create_likes
        likes_id = response.data['id']
        # Retrieving the likes using the like_id.
        response = api_client.get(f'/store/likes/{likes_id}/items/')
        # Assert that the response status is 200 (OK).
        assert response.status_code == status.HTTP_200_OK

    # Test case for adding a product to likes with invalid data.
    def test_add_product_to_likes_if_data_invalid(self, api_client, create_likes):
        response = create_likes
        likes_id = response.data['id']
        # Attempting to add a product with invalid product ID ('a').
        response = api_client.post(f'/store/likes/{likes_id}/items/', {"product_id": 'a'})
        # Assert that the response status is 400 (Bad Request).
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Test case for adding a product to likes with valid data.
    def test_add_product_to_likes_if_data_valid(self, api_client, create_likes):
        product = baker.make(Product)
        response = create_likes
        likes_id = response.data['id']
        # Adding a valid product to likes.
        response_item_added = api_client.post(f'/store/likes/{likes_id}/items/', {'product_id': product.id})
        # Assert that the response status is 201 (Created).
        assert response_item_added.status_code == status.HTTP_201_CREATED

    # Test case for deleting a liked item from likes with valid data.
    def test_delete_product_from_likes(self, api_client, create_likes):
        product = baker.make(Product)
        response = create_likes
        likes_id = response.data['id']
        api_client.post(f'/store/likes/{likes_id}/items/', {'product_id': product.id})
        response_item_added = api_client.get(f'/store/likes/{likes_id}/items/')
        # Assert that the liked items list is not empty.
        assert len(response_item_added.data) > 0, "Liked item list should not be empty."
        # Find the ID of the liked item to be deleted.
        liked_item_id = find_liked_item_id_from_product_id(response_item_added.data, product.id)
        # Deleting the liked item.
        response_item_deleted = api_client.delete(f'/store/likes/{likes_id}/items/{liked_item_id}/')
        # Assert that the response status is 204 (No Content).
        assert response_item_deleted.status_code == status.HTTP_204_NO_CONTENT
