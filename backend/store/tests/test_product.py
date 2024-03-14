from decimal import ROUND_HALF_UP, Decimal
import os
from store.models import Collection, Product
from rest_framework import status
from rest_framework.test import APIClient
import pytest
from model_bakery import baker
from django.core.files.uploadedfile import SimpleUploadedFile
import os
import glob

@pytest.fixture
def create_product(api_client):
    def do_create_product(product):
        return api_client.post('/store/products/', product)
    return do_create_product

@pytest.fixture
def upload_image(api_client):
    def _upload_image(product_id, image_path):
        #authenticate(is_staff=True)  # Authenticate as a staff user
        with open(image_path, 'rb') as img:
            data = {'image': SimpleUploadedFile(name='test_image.jpg', content=img.read(), content_type='image/jpeg')}
            return api_client.post(f'/store/products/{product_id}/images/', data, format='multipart')
    return _upload_image


@pytest.mark.django_db
class TestUploadImage:
    def test_image_upload_for_product(self, upload_image, authenticate, create_product):
        authenticate(is_superuser=True)
        collection = Collection.objects.create(title="Test Collection")
        product_data = {
            "title": "asdf",
            "description": "adsf",
            "slug": "-",
            "inventory": 10,
            "total_sells": 10,
            "unit_price": 10,
            "collection": collection.id
        }
        # Assuming create_product correctly returns a product ID
        response = create_product(product_data)
        response_data = response.json()  # Parse the JSON response body to a Python dict
        product_id =  response_data['id']
        image_path = './media/liuliu.jpg'  # Ensure this path is correct and accessible

        response = upload_image(product_id, image_path)
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_image_upload_invalid_file_for_product(self, upload_image, authenticate, create_product):
        authenticate(is_superuser=True)
        collection = Collection.objects.create(title="Test Collection")
        product_data = {
            "title": "asdf",
            "description": "adsf",
            "slug": "-",
            "inventory": 10,
            "total_sells": 10,
            "unit_price": 10,
            "collection": collection.id
        }
        # Assuming create_product correctly returns a product ID
        response = create_product(product_data)
        response_data = response.json()  # Parse the JSON response body to a Python dict
        product_id =  response_data['id']
        image_path = './media/testing.pdf'  # Ensure this path is correct and accessible

        response = upload_image(product_id, image_path)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_image_upload_staff_permission(self, upload_image, authenticate, create_product):
        authenticate(is_staff=True)
        collection = Collection.objects.create(title="Test Collection")
        product_data = {
            "title": "asdf",
            "description": "adsf",
            "slug": "-",
            "inventory": 10,
            "total_sells": 10,
            "unit_price": 10,
            "collection": collection.id
        }
        # Assuming create_product correctly returns a product ID
        response = create_product(product_data)
        response_data = response.json()  # Parse the JSON response body to a Python dict
        product_id =  response_data['id']
        image_path = './media/liuliu.jpg'  # Ensure this path is correct and accessible

        response = upload_image(product_id, image_path)
        assert response.status_code == status.HTTP_201_CREATED



@pytest.mark.django_db
# @pytest.mark.skip
class TestCreateproduct:
    def test_if_user_is_anonymous_returns_401(self, create_product):
        # client = APIClient()
        # response = client.post('/store/products/',{'title':'a'})

        response = create_product({'title': 'a'})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_user_is_not_admin_returns_403(self, authenticate, create_product):
        authenticate()

        response = create_product({'title': 'a'})

        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_if_user_is_staff_returns_291(self, authenticate, create_product):
        authenticate(is_staff=True)
        collection = Collection.objects.create(title="Test Collection")
        response = create_product({
                                    "title": "asdf",
                                    "description": "adsf",
                                    "slug": "-",
                                    "inventory": 10,
                                    "total_sells": 10,
                                    "unit_price": 10,
                                    "collection": collection.id 
                                })

        assert response.status_code == status.HTTP_201_CREATED

    def test_if_data_is_invalid_returns_400(self, authenticate, create_product):
        authenticate(is_staff=True)

        response = create_product({'title': ''})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['title'] is not None

    def test_if_data_is_admin_returns_201(self, authenticate, create_product):
        authenticate(is_superuser=True)
        collection = Collection.objects.create(title="Test Collection")
        response = create_product({
                                    "title": "asdf",
                                    "description": "adsf",
                                    "slug": "-",
                                    "inventory": 10,
                                    "total_sells": 10,
                                    "unit_price": 10,
                                    "collection": collection.id 
                                })
        print(response.data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['id'] > 0


@pytest.mark.django_db
class TestRetrieveproduct:
    def test_if_product_exists_returns_200(self, api_client):
        product = baker.make(Product)
        # baker.make(Product, product-product, _quantity=10)
        response = api_client.get(f'/store/products/{product.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data == {
            'id': product.id,
            'title': product.title,
            'description': product.description,
            "slug": product.slug,
            "inventory": product.inventory,
            "total_sells": product.total_sells,
            "collection": product.collection.id,  # Assuming you want the collection ID
            "images": [],  # Include if your response expects an images list
            "unit_price": product.unit_price,  # Convert Decimal to string
            "price_with_tax": round(product.unit_price * Decimal(1.1),2),  # Convert calculation result to string
            'average_rating': None, 
            'total_reviews': 0,
            'reviews': [],
}




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

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_images():
    # Setup: can be used to initialize database, etc.
    # In this case, nothing to setup before tests, so pass
    yield  # this yields control to the test case
    
    # Teardown: code here is executed after all tests are done
    pattern = './media/store/images/test_*.jpg'
    test_images = glob.glob(pattern)
    for image in test_images:
        os.remove(image)
    print("All test_*.jpg images have been removed.")
