from django.shortcuts import render
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin, DestroyModelMixin
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from .models import Like, LikedItem
from .serializer import AddLikedItemSerializer,LikedItemSerializer,LikeSerializer
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