import pytest
from rest_framework import status
from rest_framework.test import APIClient
from model_bakery import baker
from store.models import Product


def find_cart_item_id_from_product_id(json_array, product_id):
    for json_object in json_array:
        if json_object.get('product', {}).get('id') == product_id:
            item_id = json_object.get('id')
            assert item_id is not None, "The 'id' for the product should not be None."
            return item_id
    assert False, "Product ID not found in the list."


@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_cart(api_client, authenticate):
    authenticate()
    return api_client.post('/store/carts/')


@pytest.mark.django_db
class TestCreateCart:
    def test_create_cart(self, create_cart):
        response = create_cart
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data and response.data['id']


    def test_retrieve_carts(self, api_client, create_cart):
        response = create_cart
        cart_id = response.data['id']
        response = api_client.get(f'/store/carts/{cart_id}/items/')
        assert response.status_code == status.HTTP_200_OK
   
        
    def test_add_product_to_cart_if_data_invalid(self, api_client, create_cart):
        product = baker.make(Product)
        response = create_cart
        cart_id = response.data['id']
        response = api_client.post(
            f'/store/carts/{cart_id}/items/', 
            {
                'product_id': product.id,
                'quantity': -1
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        
    def test_add_product_to_cart_if_data_valid(self, api_client, create_cart):
        product = baker.make(Product)
        response = create_cart
        cart_id = response.data['id']
        response_item_added = api_client.post(
            f'/store/carts/{cart_id}/items/', 
            {
                'product_id': product.id,
                'quantity': 10
            }
        )
        assert response_item_added.status_code == status.HTTP_201_CREATED
        assert response_item_added.data['product_id'] == product.id
        assert response_item_added.data['quantity'] == 10
        
        
    def test_delete_item_from_cart(self, api_client, create_cart):
        product = baker.make(Product)
        response = create_cart
        cart_id = response.data['id']
        response_item_added = api_client.post(
            f'/store/carts/{cart_id}/items/', 
            {
                'product_id': product.id,
                'quantity': 10
            }
        )
        response_item_added = api_client.get(f'/store/carts/{cart_id}/items/')
        assert len(response_item_added.data) > 0, "Cart list should not be empty."
        cart_item_id = find_cart_item_id_from_product_id(response_item_added.data, product.id)
        response_item_deleted = api_client.delete(f'/store/carts/{cart_id}/items/{cart_item_id}/')
        assert response_item_deleted.status_code == status.HTTP_204_NO_CONTENT