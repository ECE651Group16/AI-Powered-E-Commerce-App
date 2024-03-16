from rest_framework import serializers
from .models import Likes, LikedItem
from store.models import Product

class SimpleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'unit_price']


class LikedItemSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer()
    
    class Meta:
        model = LikedItem
        fields = ['id', 'product']


class LikesSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    items = LikedItemSerializer(many=True, read_only=True)

    class Meta:
        model = Likes
        fields = ['id', 'items']

class AddLikedItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()
    
    def validate_product_id(self, value):
        if not Product.objects.filter(pk=value).exists():
            raise serializers.ValidationError(
                'No product with the given ID was found.')
        return value

    def save(self, **kwargs):
        likes_id = self.context['likes_id']
        product_id = self.validated_data['product_id']
        try:
            likes_items = LikedItem.objects.get(likes_id=likes_id, product_id = product_id)
            likes_items.save()
            self.instance = likes_items
        except LikedItem.DoesNotExist:
            self.instance = LikedItem.objects.create(likes_id=likes_id, **self.validated_data)

        return self.instance
    class Meta:
        model = LikedItem
        fields = ['id','product_id']



