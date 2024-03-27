from store.models import Collection, Product, Review, Customer, Order, OrderItem
from core.models import User
from rest_framework import status
from rest_framework.test import APIClient
import pytest
from model_bakery import baker
from rest_framework.test import force_authenticate

from django.contrib.auth.models import User
from store.models import Product, Order, OrderItem, Review
from django.contrib.auth import get_user_model


@pytest.mark.django_db
class TestReviews:

    # for getting our (customized) user model
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
    def product(self):
        product = baker.make(Product)
        return product

    # for placing an order for the user
    @pytest.fixture
    def order(self, user, product):
        order = baker.make(Order, customer=user.customer)
        baker.make(OrderItem, order=order, product=product)
        return order

    @pytest.fixture
    def review_data(self, product):
        return {
            "product": product.id,
            "name": "Test User",
            "rating": "4.5",
            "description": "This is a test review.",
        }

    @pytest.fixture
    def api_client(self):
        return APIClient()

    # anyone can read reviews unlogged in
    def test_reading_reviews_of_product(self, product, api_client, customer):
        review = baker.make(Review, product=product, customer=customer)
        # Retrieve the reviews of the product
        url = f"/store/products/{product.id}/reviews/"
        response = api_client.get(url)
        # Check if the request was successful
        assert response.status_code == status.HTTP_200_OK
        # Check if the retrieved reviews match the expected review
        assert len(response.data) == 1
        # assert response.data[0]['name'] == review.name
        assert response.data[0]["rating"] == review.rating
        assert response.data[0]["description"] == review.description

    # but can't post reviews unlogged in
    def test_create_review_unlogged_in(self, api_client, product, review_data):
        url = f"/store/products/{product.id}/reviews/"
        response = api_client.post(url, review_data, format="json")
        # unable to review if user unlogged in
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert Review.objects.filter(product=product).count() == 0

    # can only post reviews if logged in and bought the product
    def test_create_review_with_ordered_product(
        self, user, product, order, api_client, review_data
    ):
        # Forced authenticate to log-in
        api_client.force_authenticate(user=user)
        # Attempt to create a review
        url = f"/store/products/{product.id}/reviews/"
        response = api_client.post(url, review_data, format="json")
        # Check if the review was created successfully
        assert response.status_code == status.HTTP_201_CREATED
        assert Review.objects.filter(product=product).exists()

    # can't post reviews if logged in but did not order product
    def test_create_review_did_not_order_product(
        self, user, product, api_client, review_data
    ):
        # Forced authenticate to log-in
        api_client.force_authenticate(user=user)
        # Attempt to create a review
        url = f"/store/products/{product.id}/reviews/"
        response = api_client.post(url, review_data, format="json")
        # Check if the review was not created successfully
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Review.objects.filter(product=product).count() == 0
