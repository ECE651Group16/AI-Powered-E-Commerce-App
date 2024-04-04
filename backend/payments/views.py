from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.http import JsonResponse
from django.views import View
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.aggregates import Count
from django.db.models import Avg
from django.conf import settings
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import viewsets
from rest_framework.viewsets import ModelViewSet, GenericViewSet, ViewSet
from rest_framework.generics import ListAPIView
from rest_framework.mixins import (
    ListModelMixin,
    CreateModelMixin,
    RetrieveModelMixin,
    DestroyModelMixin,
)
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination
from rest_framework import permissions

from scipy.sparse.linalg import svds
from scipy.sparse import csr_matrix
import pandas as pd
import numpy as np

from store.filters import ProductFilter
from store.pagniation import DefaultPagination
from store.permission import (
    IsAdminOrReadOnly,
    IsNotAuthenticated,
    UploadProductImagePermission,
    ViewCustomerHistoryPermission,
    IsAdminOrOwnerForCustomer,
)
from store.models import (
    Cart,
    CartItem,
    Collection,
    Customer,
    Order,
    OrderItem,
    Product,
    ProductImage,
    Review,
    Address,
)
from store.serializers import (
    AddCartItemSerializer,
    CartItemSerializer,
    CartSerializer,
    CollectionSerializer,
    CreateOrderSerializer,
    CustomerSerializer,
    OrderSerializer,
    ProductImageSerializer,
    ProductSerializer,
    ReviewSerializer,
    UpdateCartItemSerializer,
    UpdateOrderSerializer,
    UpdateReviewSerializer,
    AddressSerializer,
)

import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentViewSet(APIView):
    def post(self, request):
        YOUR_DOMAIN = "http://127.0.0.1:3000/"
        try:
            # product = Product.objects.get(pk=product)
            # product_image = product.images[0] if product.images.exists() else 'url_to_default_image'
            amount_subtotal = 2198
            amount_total = 2198
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                        # 'price': '{{PRICE_ID}}',
                        #'price': 'price_1P1MAuLyCz9ytZLn4dZUIH3f',
                        # "automatic_tax": {
                        #     "enabled": True,
                        # },
                        #     'currency': 'cad',
                        #     'product_data': {
                        #         'name': product.title,
                        #         # 'images': [],
                        #     },
                        #     'unit_amount': int(product.unit_price * 100),
                        # },
                        'price_data': {
                            'currency': 'cad',
                            'product_data': {
                                'name': 'Your Product Name',
                                # Optionally, add an image
                                # 'images': [product_image],
                            },
                            'unit_amount': amount_total, # Assuming amount_total is in cents
                        },
                        'quantity': 1,
                    },
                ],
                payment_method_types=['card'],
                mode='payment',
                success_url='http://localhost:3000/?success&session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:3000/?canceled=true',
                automatic_tax={'enabled': True},  # Enable or disable automatic tax calculation
                billing_address_collection='required',  # Set to 'required' to collect billing address
                shipping_options=[  # Use 'shipping_options' to specify shipping rates
                    {
                        'shipping_rate': 'shr_1P1h9kLyCz9ytZLnNjnm4TMt'
                    }
                ],
                shipping_address_collection={
                    'allowed_countries': ['US', 'CA'],  # Specify allowed countries for shipping
                },
                 allow_promotion_codes=True,  # This enables promotion code input
            )
            return redirect(checkout_session.url)
            # return JsonResponse({'sessionId': checkout_session['id']})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        # return JsonResponse({
        #     'id': checkout_session.id
        # })
        