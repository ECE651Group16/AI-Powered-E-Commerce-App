import pytest
from rest_framework import status
from rest_framework.test import APIClient
from store.models import Customer, Order, OrderItem, Product
from django.contrib.auth import get_user_model
from model_bakery import baker


@pytest.mark.django_db
class TestRecommendation:
    @pytest.fixture
    def api_client():
        return APIClient()

    @pytest.fixture
    def user_model(self):
        return get_user_model()

    @pytest.fixture
    def user(self, user_model):
        user = baker.make(user_model)
        return user

    @pytest.fixture
    def customer(self, user):
        # Ensure a single Customer instance is created per User
        customer, created = Customer.objects.get_or_create(user=user)
        return customer

    @pytest.fixture
    def api_client(self):
        return APIClient()

    def test_recommendation_anonymous_user(self, api_client):
        url = f"/store/recommendation/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_recommendation_authenticated_user_no_order(self, api_client, customer):
        api_client.force_authenticate(user=customer.user)
        url = f"/store/recommendation/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_recommendation_authenticated_user_with_order(self, api_client, customer):
        order, created = Order.objects.get_or_create(customer=customer)
        product = baker.make(Product)
        orderitem, created = OrderItem.objects.get_or_create(
            order=order, quantity=1, product=product
        )
        api_client.force_authenticate(user=customer.user)
        url = f"/store/recommendation/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
