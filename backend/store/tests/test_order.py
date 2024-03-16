import pytest
from rest_framework import status
from model_bakery import baker
from rest_framework.test import APIClient

from store.models import Order, Cart, CartItem
from django.contrib.auth import get_user_model


@pytest.mark.django_db
class TestCreateCollection:

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def user_model(self):
        return get_user_model()

    @pytest.fixture
    def user(self, user_model):
        user = baker.make(user_model)
        return user

    def test_if_user_is_anonymous_returns_401(self, user, api_client):
        response = api_client.post(
            '/store/orders/',
            {
                'cart_id': ''
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_data_is_invalid_returns_400(self, user, api_client):
        api_client.force_authenticate(user=user)

        response = api_client.post(
            '/store/orders/',
            {
                'cart_id': ''
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_if_data_is_valid_returns_200(self, user, api_client):
        api_client.force_authenticate(user=user)
        cart = baker.make(Cart, customer=user.customer)
        item = baker.make(CartItem, cart=cart, quantity=1)
        response = api_client.post(
            f'/store/orders/',
            {
                'cart_id': cart.id
            }
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['customer'] is not None

    def test_retrieve_orders(self, api_client, user):
        api_client.force_authenticate(user=user)
        cart = baker.make(Cart, customer=user.customer)
        item = baker.make(CartItem, cart=cart, quantity=1)
        response = api_client.post(
            f'/store/orders/',
            {
                'cart_id': cart.id
            }
        )
        order_id = response.data['id']
        response = api_client.get(f'/store/orders/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]['id'] == order_id
