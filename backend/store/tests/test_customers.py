import pytest
from rest_framework import status
from rest_framework.test import APIClient
from store.models import Customer
from django.contrib.auth import get_user_model
from model_bakery import baker


@pytest.mark.django_db
class TestCustomerCreation:
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

    def test_customer_list_authenticated_user(self, api_client, customer):
        # Create a regular customer linked to the regular user
        api_client.force_authenticate(user=customer.user)
        url = f"/store/customers/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_customer_list_anonymous_user(self, api_client, customer):
        url = f"/store/customers/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_customer_instance_authorized_user(self, api_client, customer):
        # Create a regular customer linked to the regular user
        api_client.force_authenticate(user=customer.user)
        url_1 = f"/store/customers/{customer.id}/"
        response_1 = api_client.get(url_1)
        assert response_1.status_code == status.HTTP_200_OK

        url_2 = f"/store/customers/me/"
        response_2 = api_client.get(url_2)
        assert response_2.status_code == status.HTTP_200_OK
        assert response_2.data["id"] == customer.id

    def test_customer_instance_unauthorized_user(self, api_client, user_model):
        user_1 = baker.make(user_model)
        user_2 = baker.make(user_model)

        customer_2, created = Customer.objects.get_or_create(user=user_2)

        api_client.force_authenticate(user=user_1)
        url = f"/store/customers/{customer_2.id}/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_customer_instance_admin_user(self, api_client, user_model):
        user_1 = user_model.objects.create_superuser(
            "admin", "admin@example.com", "password123"
        )
        user_2 = baker.make(user_model)

        customer_2, created = Customer.objects.get_or_create(user=user_2)

        api_client.force_authenticate(user=user_1)
        url = f"/store/customers/{customer_2.id}/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_customer_instance_anonymous_user(self, api_client, customer):
        url = f"/store/customers/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
