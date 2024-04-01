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

    def test_addresses_list_authorized_user(self, api_client, customer):

        api_client.force_authenticate(user=customer.user)
        url = f"/store/customers/{customer.id}/addresses/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
    def test_addresses_list_anonymous_user(self, api_client, customer):
        url = f"/store/customers/{customer.id}/addresses/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_addresses_list_unauthorized_user(self, api_client, user_model):
        user_1 = baker.make(user_model)
        user_2 = baker.make(user_model)
        
        customer_2, created = Customer.objects.get_or_create(user=user_2)
        
        api_client.force_authenticate(user=user_1)
        url = f"/store/customers/{customer_2.id}/addresses/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
    def test_addresses_list_admin_user(self, api_client, user_model):
        user_1 = user_model.objects.create_superuser("admin", "admin@example.com", "password123")
        user_2 = baker.make(user_model)
        
        customer_2, created = Customer.objects.get_or_create(user=user_2)
        
        api_client.force_authenticate(user=user_1)
        url = f"/store/customers/{customer_2.id}/addresses/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
    
    def test_addresses_instance_can_post(self, api_client, customer):
        api_client.force_authenticate(user=customer.user)
        url = f"/store/customers/{customer.id}/addresses/"
        address_details = {
            "street": "200 University Ave W",
            "city": "Waterloo",
            "zip": "N2L 3G1"
        }
        response = api_client.post(url, address_details)
        assert response.status_code == status.HTTP_201_CREATED
        
    def test_addresses_instance_can_patch(self, api_client, customer):
        #first create address
        api_client.force_authenticate(user=customer.user)
        url = f"/store/customers/{customer.id}/addresses/"
        address_details = {
            "street": "200 University Ave W",
            "city": "Waterloo",
            "zip": "N2L 3G1"
        }
        response = api_client.post(url, address_details)
        assert response.status_code == status.HTTP_201_CREATED
        #update address
        address_id = response.data["id"]
        updated_address_details = {
            "street": "1280 Main St W",
            "city": "Hamilton",
            "zip": "L8S 4L8"
        }
        url = f"/store/customers/{customer.id}/addresses/{address_id}/"
        response = api_client.patch(url, updated_address_details)
        assert response.status_code == status.HTTP_200_OK
        
    def test_addresses_instance_can_delete(self, api_client, customer):
        #first create address
        api_client.force_authenticate(user=customer.user)
        url = f"/store/customers/{customer.id}/addresses/"
        address_details = {
            "street": "200 University Ave W",
            "city": "Waterloo",
            "zip": "N2L 3G1"
        }
        response = api_client.post(url, address_details)
        assert response.status_code == status.HTTP_201_CREATED
        #delete address
        address_id = response.data["id"]
        url = f"/store/customers/{customer.id}/addresses/{address_id}/"
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        
   
    

   

        
        
        
        

