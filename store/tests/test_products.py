from store.models import Collection, Product
from rest_framework import status
from rest_framework.test import APIClient
import pytest
from model_bakery import baker


@pytest.fixture
def create_product(api_client):
    def do_create_collection(collection):
        return api_client.post('/store/products/', collection)

    return do_create_collection


@pytest.mark.django_db
class TestProducts:
    def test_if_user_is_anonymous_returns_401(self, create_product):
        response = create_product({'title': 'a'})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_user_is_not_admin_returns_403(self, authenticate, create_product):
        authenticate()

        response = create_product({'title': 'a'})

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_if_data_is_invalid_returns_400(self, authenticate, create_product):
        authenticate(is_staff=True)

        response = create_product({'title': ''})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['title'] is not None

    def test_if_data_is_valid_returns_201(self, authenticate, create_product):
        authenticate(is_staff=True)
        collection = baker.make('Collection')
        response = create_product({'title': 'a',
                                   'slug': 'a',
                                   'unit_price': 0.01,
                                   'inventory': 1,
                                   'collection': collection.id})
        print(response)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['id'] > 0


@pytest.mark.django_db
class TestRetrieveCollection:
    def test_if_product_exists_returns_200(self, api_client):
        product = baker.make(Product)
        # baker.make(Product, collection-collection, _quantity=10)
        response = api_client.get(f'/store/products/{product.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == product.id
        assert response.data['title'] == product.title
