from django.shortcuts import render
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.mixins import (
    ListModelMixin,
    CreateModelMixin,
    RetrieveModelMixin,
    DestroyModelMixin,
)
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Likes, LikedItem
from .serializer import AddLikedItemSerializer, LikedItemSerializer, LikesSerializer
from store.serializers import CartSerializer

# Create your views here.


class LikesViewSet(
    CreateModelMixin, RetrieveModelMixin, DestroyModelMixin, GenericViewSet
):
    permission_classes = [IsAuthenticated]
    queryset = Likes.objects.prefetch_related("items__product").all()
    serializer_class = LikesSerializer

    def create(self, request, *args, **kwargs):
        user = self.request.user

        # Check if the customer already has a Likes
        if Likes.objects.filter(customer=user.customer).exists():
            return Response(
                {"detail": "Likes already exists for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a new Likes instance with the customer set to the current user's customer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=user.customer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class LikedItemViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AddLikedItemSerializer
        # elif self.request.method == 'PATCH':
        #     return UpdateLikedItemSerializer
        return LikedItemSerializer

    def get_serializer_context(self):
        return {"likes_id": self.kwargs["likes_pk"]}

    def get_queryset(self):
        return LikedItem.objects.filter(
            likes_id=self.kwargs["likes_pk"]
        ).select_related("product")

    @action(detail=True, methods=["post"], url_path="add-to-cart")
    def add_to_cart(self, request, *args, **kwargs):
        try:
            liked_item = self.get_object()
            cart, cart_item = liked_item.add_to_cart()
            serializer = CartSerializer(cart, context={"request": request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
