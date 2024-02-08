from rest_framework import serializers
from store.models import Product, Collection, Review
from decimal import Decimal

class CollectionSerializer(serializers.Serializer):
    class Meta:
        model = Collection
        fields = ['id', 'title', 'products_count']
    products_count = serializers.IntegerField(read_only=True)
    # id = serializers.IntegerField()
    # title = serializers.CharField(max_length = 255)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title','description','slug', 'inventory','unit_price','price_with_tax', 'collection']
    price_with_tax = serializers.SerializerMethodField(method_name='calculate_tax')
    def calculate_tax(self, product):
        return product.unit_price * Decimal(1.13)
    '''
        # fields = '__all__'
    # id = serializers.IntegerField()
    # title = serializers.CharField(max_length = 255)
    # price = serializers.DecimalField(max_digits=6, decimal_places=2, source = 'unit_price')
    
    # # serializing: 1. primary key 2. String value 3. Nested Object 4.Hyperlink
    # # collection = serializers.PrimaryKeyRelatedField(
    # #     queryset = Collection.objects.all()
    # # )
    # # collection = serializers.StringRelatedField()
    # collection = CollectionSerializer()
    # collection = serializers.HyperlinkedRelatedField(
    #     queryset = Collection.objects.all(),
    #     view_name='collection-detail'
    # )
    
    # def validate(self, data):
    #     if data['password'] != data['confirm_password']:
    #         return serializers.ValidationError('Passwords do not match')
    #     return data
    '''

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'date', 'name', 'description']

    def create(self, validated_data):
        product_id = self.context['product_id']
        return Review.objects.create(product_id=product_id, **validated_data)