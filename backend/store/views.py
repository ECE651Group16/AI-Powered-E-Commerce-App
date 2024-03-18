from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.aggregates import Count
from django.db.models import Avg
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin, DestroyModelMixin
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination
from rest_framework import permissions

from store.filters import ProductFilter
from store.pagniation import DefaultPagination
from store.permission import IsAdminOrReadOnly, IsNotAuthenticated, UploadProductImagePermission, ViewCustomerHistoryPermission
from .models import Cart, CartItem, Collection, Customer, Order, OrderItem, Product, ProductImage, Review
from .serializers import AddCartItemSerializer, CartItemSerializer, CartSerializer, CollectionSerializer, CreateOrderSerializer, CustomerSerializer, OrderSerializer, ProductImageSerializer, ProductSerializer, ReviewSerializer, UpdateCartItemSerializer, UpdateOrderSerializer



# Create your views here.
# generic views
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.prefetch_related('images').all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    pagination_class = DefaultPagination
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['title', 'description']
    ordering_fields = ['unit_price', 'last_update', 'total_sells', 'average_rating', "total_reviews"]

    def get_queryset(self):
        return super().get_queryset().annotate(
            total_reviews=Count('reviews'),
            average_rating=Avg('reviews__rating')
        )

    def get_serializer_context(self):
        return {'request': self.request}

    def destroy(self, request, *args, **kwargs):
        if OrderItem.objects.filter(product_id=kwargs['pk']).count() > 0:
            return Response({'error': 'Product cannot be deleted because it is associated with an order item.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        return super().destroy(request, *args, **kwargs)

class ProductImageViewSet(ModelViewSet):
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrReadOnly] #changed from UploadProductImagePermission
        else:
            # Apply default permission classes or other specific permissions based on the action
            permission_classes = [permissions.AllowAny] # Example default
        return [permission() for permission in permission_classes]
    # @action(detail=True, permission_classes=[UploadProductImagePermission])
    def get_serializer_context(self): # add this because if only has get_queryset then it only upload the image. This function is to extract the id from serializer
        return {'product_id': self.kwargs['product_pk']}

    def get_queryset(self): #/products/1(product_pk)/images/1(pk) 
        return ProductImage.objects.filter(product_id = self.kwargs['product_pk'])

class CollectionViewSet(ModelViewSet):
    queryset = Collection.objects.annotate(
        products_count=Count('products')).all()
    serializer_class = CollectionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        if Product.objects.filter(collection_id=kwargs['pk']):
            return Response({'error': 'Collection cannot be deleted because it includes one or more products.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        return super().destroy(request, *args, **kwargs)


class ReviewViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        #for posting reviews
        if self.request.method in ['POST','PATCH','DELETE']:
            user = self.request.user
            bought_item = False
            if user.is_authenticated:
                user = self.request.user
                customer_id = Customer.objects.only('id').get(user_id=user.id)
                
                product_id = int(self.kwargs.get('product_pk'))
                orders_by_user = Order.objects.filter(customer_id = customer_id)
                for order in orders_by_user:
                    ordered_items = OrderItem.objects.filter(order = order)
                    for item in ordered_items:
                        print(type(item.product_id), type(product_id))
                        if item.product_id == product_id:
                            print("found",item.product_id, product_id)
                            bought_item = True
                if bought_item: #if user logged in and bought item, give permission
                    return [IsAuthenticated()]
                else: #if user logged in but did not buy item, no permission
                    return[IsNotAuthenticated()]
            else: #if not logged in, no permission
                return [IsAdminOrReadOnly()]
        #but anyone can view reviews
        else:
            return [AllowAny()] #don't forget need import at top
    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs['product_pk'])

    def get_serializer_context(self):
        return {'product_id': self.kwargs['product_pk']}


class CartViewSet(CreateModelMixin,
                  RetrieveModelMixin,
                  DestroyModelMixin,
                  GenericViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Cart.objects.prefetch_related('items__product').all()
    serializer_class = CartSerializer
    
    def create(self, request, *args, **kwargs):
        user = self.request.user

        # Check if the customer already has a cart
        if Cart.objects.filter(customer=user.customer).exists():
            return Response({'detail': 'Cart already exists for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new cart instance with the customer set to the current user's customer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=user.customer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class CartItemViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddCartItemSerializer
        elif self.request.method == 'PATCH':
            return UpdateCartItemSerializer
        return CartItemSerializer

    def get_serializer_context(self):
        return {'cart_id': self.kwargs['cart_pk']}

    def get_queryset(self):
        return CartItem.objects \
            .filter(cart_id=self.kwargs['cart_pk']) \
            .select_related('product')


class CustomerViewSet(ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, permission_classes=[ViewCustomerHistoryPermission])
    def history(self, request, pk):
        return Response('ok')

    @action(detail=False, methods=['GET', 'PUT'], permission_classes=[IsAuthenticated])
    def me(self, request):
        customer = Customer.objects.get(
            user_id=request.user.id)
        if request.method == 'GET':
            serializer = CustomerSerializer(customer)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = CustomerSerializer(customer, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class OrderViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(
            data=request.data,
            context={'user_id': self.request.user.id})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        elif self.request.method == 'PATCH':
            return UpdateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Order.objects.all()

        customer_id = Customer.objects.only(
            'id').get(user_id=user.id)
        return Order.objects.filter(customer_id=customer_id)
