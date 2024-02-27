from rest_framework import serializers
from .models import Like, LikedItem
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


class LikeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    items = LikedItemSerializer(many=True, read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'items']

class AddLikedItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()
    
    def validate_product_id(self, value):
        if not Product.objects.filter(pk=value).exists():
            raise serializers.ValidationError(
                'No product with the given ID was found.')
        return value

    def save(self, **kwargs):
        like_id = self.context['like_id']
        product_id = self.validated_data['product_id']
        try:

            like_item = LikedItem.objects.get(like_id=like_id, product_id = product_id)
            like_item.save()
            self.instance = like_item
        except LikedItem.DoesNotExist:
            self.instance = LikedItem.objects.create(like_id=like_id, **self.validated_data)

        return self.instance
    class Meta:
        model = LikedItem
        fields = ['id','product_id']



