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
from .models import (
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
from .serializers import (
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


# Create your views here.
# generic views
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.prefetch_related("images").all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    pagination_class = DefaultPagination
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["title", "description"]
    ordering_fields = [
        "unit_price",
        "last_update",
        "total_sells",
        "average_rating",
        "total_reviews",
    ]

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .annotate(
                total_reviews=Count("reviews"), average_rating=Avg("reviews__rating")
            )
        )

    def get_serializer_context(self):
        return {"request": self.request}

    def destroy(self, request, *args, **kwargs):
        if OrderItem.objects.filter(product_id=kwargs["pk"]).count() > 0:
            return Response(
                {
                    "error": "Product cannot be deleted because it is associated with an order item."
                },
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )

        return super().destroy(request, *args, **kwargs)


class ProductImageViewSet(ModelViewSet):
    serializer_class = ProductImageSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            permission_classes = [
                IsAdminOrReadOnly
            ]  # changed from UploadProductImagePermission
        else:
            # Apply default permission classes or other specific permissions based on the action
            permission_classes = [permissions.AllowAny]  # Example default
        return [permission() for permission in permission_classes]

    # @action(detail=True, permission_classes=[UploadProductImagePermission])
    def get_serializer_context(
        self,
    ):  # add this because if only has get_queryset then it only upload the image. This function is to extract the id from serializer
        return {"product_id": self.kwargs["product_pk"]}

    def get_queryset(self):  # /products/1(product_pk)/images/1(pk)
        return ProductImage.objects.filter(product_id=self.kwargs["product_pk"])


class CollectionViewSet(ModelViewSet):
    queryset = Collection.objects.annotate(products_count=Count("products")).all()
    serializer_class = CollectionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        if Product.objects.filter(collection_id=kwargs["pk"]):
            return Response(
                {
                    "error": "Collection cannot be deleted because it includes one or more products."
                },
                status=status.HTTP_405_METHOD_NOT_ALLOWED,
            )

        return super().destroy(request, *args, **kwargs)


class ReviewViewSet(ModelViewSet):
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    serializer_class = ReviewSerializer

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return UpdateReviewSerializer
        return ReviewSerializer

    def get_permissions(self):
        # for posting reviews
        if self.request.method in ["POST", "PATCH", "DELETE"]:
            user = self.request.user
            bought_item = False
            if user.is_authenticated:
                user = self.request.user
                customer_id = Customer.objects.only("id").get(user_id=user.id)

                product_id = int(self.kwargs.get("product_pk"))
                orders_by_user = Order.objects.filter(customer_id=customer_id)
                for order in orders_by_user:
                    ordered_items = OrderItem.objects.filter(order=order)
                    for item in ordered_items:
                        print(type(item.product_id), type(product_id))
                        if item.product_id == product_id:
                            print("found", item.product_id, product_id)
                            bought_item = True
                if bought_item:  # if user logged in and bought item, give permission
                    return [IsAuthenticated()]
                else:  # if user logged in but did not buy item, no permission
                    return [IsNotAuthenticated()]
            else:  # if not logged in, no permission
                return [IsAdminOrReadOnly()]
        # but anyone can view reviews
        else:
            return [AllowAny()]  # don't forget need import at top

    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs["product_pk"])

    def get_serializer_context(self):
        return {"product_id": self.kwargs["product_pk"]}

    def create(self, request, *args, **kwargs):
        user = request.user
        product_id = kwargs.get("product_pk")

        if not user.customer.order_set.filter(items__product_id=product_id).exists():
            return Response(
                {"detail": "You must purchase the product before reviewing it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if Review.objects.filter(
            product_id=product_id, customer=user.customer
        ).exists():
            return Response(
                {"detail": "You have already reviewed this product."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            customer=user.customer
        )  # Pass customer and product ID when saving

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class CartViewSet(
    CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, GenericViewSet
):
    permission_classes = [IsAuthenticated]
    queryset = Cart.objects.prefetch_related("items__product").all()
    serializer_class = CartSerializer

    def create(self, request, *args, **kwargs):
        user = self.request.user

        # Check if the customer already has a cart
        if Cart.objects.filter(customer=user.customer).exists():
            return Response(
                {"detail": "Cart already exists for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a new cart instance with the customer set to the current user's customer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=user.customer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class CartItemViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AddCartItemSerializer
        elif self.request.method == "PATCH":
            return UpdateCartItemSerializer
        return CartItemSerializer

    def get_serializer_context(self):
        return {"cart_id": self.kwargs["cart_pk"]}

    def get_queryset(self):
        return CartItem.objects.filter(cart_id=self.kwargs["cart_pk"]).select_related(
            "product"
        )


class CustomerViewSet(ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        # If the current user is an admin, return all customers
        if self.request.user.is_staff:
            return Customer.objects.all()
        # Otherwise, return only the current customer's object
        else:
            return Customer.objects.filter(user=self.request.user)

    def me(self, request):
        # This action always returns the current customer, regardless of admin status
        customer = self.get_object()
        if request.method == "GET":
            serializer = CustomerSerializer(customer)
            return Response(serializer.data)
        elif request.method == "PUT":
            serializer = CustomerSerializer(customer, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    def get_object(self):
        # Override the get_object method to handle 'me' action
        if self.action == "me":
            return Customer.objects.get(user=self.request.user)
        return super().get_object()

    @action(detail=True, permission_classes=[ViewCustomerHistoryPermission])
    def history(self, request, pk):
        return Response("ok")

    @action(detail=False, methods=["GET", "PUT"], permission_classes=[IsAuthenticated])
    def me(self, request):
        customer = Customer.objects.get(user_id=request.user.id)
        if request.method == "GET":
            serializer = CustomerSerializer(customer)
            return Response(serializer.data)
        elif request.method == "PUT":
            serializer = CustomerSerializer(customer, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class OrderViewSet(ModelViewSet):
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(
            data=request.data, context={"user_id": self.request.user.id}
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateOrderSerializer
        elif self.request.method == "PATCH":
            return UpdateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Order.objects.all()

        customer_id = Customer.objects.only("id").get(user_id=user.id)
        return Order.objects.filter(customer_id=customer_id)


class RecommendationViewSet(ModelViewSet):
    http_method_names = ["get", "options"]
    serializer_class = ProductSerializer
    pagination_class = DefaultPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        customer_id = get_object_or_404(Customer, user_id=self.request.user.id).id
        customer_order_id = Order.objects.filter(customer_id=customer_id).values("id")
        if len(customer_order_id):
            customer_and_order = OrderItem.objects.values(
                "order_id__customer_id", "product_id"
            )
            df = pd.DataFrame(list(customer_and_order))
            df["score"] = 1.0
            customer_items_pivot_matrix_df = df.pivot(
                index="order_id__customer_id", columns="product_id", values="score"
            ).fillna(0)
            customer_items_pivot_matrix = csr_matrix(
                customer_items_pivot_matrix_df.values
            )
            customer_ids = np.array(customer_items_pivot_matrix_df.index)
            item_ids = np.array(customer_items_pivot_matrix_df.columns)

            NUMBER_OF_FACTORS_MF = min(min(16, len(item_ids)), len(customer_ids)) - 1
            if NUMBER_OF_FACTORS_MF <= 0:
                queryset = Product.objects.prefetch_related("images").order_by(
                    "-last_update"
                )  # [:10]
            else:
                U, sigma, Vt = svds(customer_items_pivot_matrix, k=NUMBER_OF_FACTORS_MF)
                sigma = np.diag(sigma)

                U_customer = U[np.argwhere(customer_ids == customer_id)[0]]
                user_predicted_ratings = np.dot(np.dot(U_customer, sigma), Vt)

                num_to_recommend = min(10, len(user_predicted_ratings))
                ind = np.argpartition(
                    user_predicted_ratings,
                    user_predicted_ratings.size - num_to_recommend,
                )[-num_to_recommend:]
                recommend_items_id = item_ids[ind][0]
                queryset = Product.objects.prefetch_related("images").filter(
                    id__in=recommend_items_id.tolist()
                )

            # customer_order_item = OrderItem.objects.filter(order_id__in=customer_order_id).values(
            #     'product_id').distinct()
            # customer_interest_collection = Product.objects.filter(id__in=customer_order_item).values(
            #     'collection_id').distinct()
            # queryset = Product.objects.prefetch_related('images').filter(collection_id__in=customer_interest_collection)
        else:
            queryset = Product.objects.prefetch_related("images").order_by(
                "-last_update"
            )
        return queryset.annotate(
            total_reviews=Count("reviews"), average_rating=Avg("reviews__rating")
        )


class AddressViewSet(ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAdminOrOwnerForCustomer]

    def get_queryset(self):
        customer_id = self.kwargs["customer_pk"]
        return Address.objects.filter(customer_id=customer_id)

    def perform_create(self, serializer):
        customer_pk = self.kwargs.get("customer_pk")
        serializer.save(customer_id=customer_pk)
