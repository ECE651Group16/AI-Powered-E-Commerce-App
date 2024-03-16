from django.shortcuts import render
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin, DestroyModelMixin
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from .models import Like, LikedItem
from .serializer import AddLikedItemSerializer,LikedItemSerializer,LikeSerializer
from store.serializers import CartSerializer
# Create your views here.


class LikeViewSet(CreateModelMixin, 
                  RetrieveModelMixin,
                  DestroyModelMixin,
                  GenericViewSet):
    queryset = Like.objects.prefetch_related('items__product').all()
    serializer_class = LikeSerializer


class LikedItemViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'delete']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddLikedItemSerializer
        # elif self.request.method == 'PATCH':
        #     return UpdateLikedItemSerializer
        return LikedItemSerializer

    def get_serializer_context(self):
        return {'like_id': self.kwargs['like_pk']}

    def get_queryset(self):
        return LikedItem.objects \
            .filter(like_id=self.kwargs['like_pk']) \
            .select_related('product')
            
    @action(detail=True, methods=['post'], url_path='add-to-cart')
    def add_to_cart(self, request, *args, **kwargs):
        try:
            liked_item = self.get_object()
            cart, cart_item = liked_item.add_to_cart()
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)