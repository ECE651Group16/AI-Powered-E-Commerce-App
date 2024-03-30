from decimal import Decimal
from django.db import transaction
from rest_framework import serializers
from django.db.models import Sum, F
from django_countries.fields import Country
from store.permission import UploadProductImagePermission
from .signals import order_created
from .models import (
    Cart,
    CartItem,
    Customer,
    Order,
    OrderItem,
    Product,
    Collection,
    ProductImage,
    Review,
    Address,
)
from likes.models import Likes
from rest_framework.decorators import action


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ["id", "title", "products_count"]

    products_count = serializers.IntegerField(read_only=True)


class ProductImageSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        product_id = self.context["product_id"]
        return ProductImage.objects.create(product_id=product_id, **validated_data)

    class Meta:
        model = ProductImage
        fields = ["id", "image"]


class ReviewSerializer(serializers.ModelSerializer):

    username = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "date", "rating", "description", "username"]

    def create(self, validated_data):
        product_id = self.context["product_id"]
        return Review.objects.create(product_id=product_id, **validated_data)

    def get_username(self, obj):
        if obj.customer and obj.customer.user:
            return obj.customer.user.username
        return "User deleted."


class UpdateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "rating",
            "description",
        ]  # Only include the fields you want to be updateable
        read_only_fields = ["id", "date"]  # Mark 'id' and 'date' as read-only


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    average_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "slug",
            "inventory",
            "total_sells",
            "unit_price",
            "price_with_tax",
            "collection",
            "images",
            "total_reviews",
            "average_rating",
            "reviews",
        ]

    price_with_tax = serializers.SerializerMethodField(method_name="calculate_tax")

    def calculate_tax(self, product: Product):
        # price_with_tax = product.unit_price * Decimal(1.1)
        # return "{:.2f}".format(price_with_tax)
        return round(product.unit_price * Decimal(1.1), 2)


class SimpleProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ["id", "title", "unit_price", "images", "inventory"]


class CartItemSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer()
    total_price = serializers.SerializerMethodField()

    def get_total_price(self, cart_item: CartItem):
        return cart_item.quantity * cart_item.product.unit_price

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "total_price"]


class CartSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    def get_total_price(self, cart):
        return sum(
            [item.quantity * item.product.unit_price for item in cart.items.all()]
        )

    class Meta:
        model = Cart
        fields = ["id", "items", "total_price"]


class AddCartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()

    def validate_product_id(self, value):
        if not Product.objects.filter(pk=value).exists():
            raise serializers.ValidationError("No product with the given ID was found.")
        return value

    def save(self, **kwargs):
        cart_id = self.context["cart_id"]
        product_id = self.validated_data["product_id"]
        quantity = self.validated_data["quantity"]

        try:
            cart_item = CartItem.objects.get(cart_id=cart_id, product_id=product_id)
            cart_item.quantity += quantity
            cart_item.save()
            self.instance = cart_item
        except CartItem.DoesNotExist:
            self.instance = CartItem.objects.create(
                cart_id=cart_id, **self.validated_data
            )

        return self.instance

    class Meta:
        model = CartItem
        fields = ["id", "product_id", "quantity"]


class UpdateCartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ["quantity"]


class CustomerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    cart_id = serializers.SerializerMethodField()
    likes_id = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "user_id",
            "phone",
            "birth_date",
            "membership",
            "cart_id",
            "likes_id",
        ]

    def __init__(self, *args, **kwargs):
        super(CustomerSerializer, self).__init__(*args, **kwargs)

        request = self.context.get("request")

        if request and not request.user.is_staff:
            self.fields["membership"].read_only = True

    def get_cart_id(self, obj):
        # Try to fetch the cart related to the customer. If not found, return None.
        cart = Cart.objects.filter(customer=obj).first()
        return str(cart.id) if cart else None

    def get_likes_id(self, obj):
        # Try to fetch the likes related to the customer. If not found, return None.
        likes = Likes.objects.filter(customer=obj).first()
        return str(likes.id) if likes else None


class OrderItemSerializer(serializers.ModelSerializer):
    product = SimpleProductSerializer()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "unit_price", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["id", "customer", "placed_at", "payment_status", "items"]


class UpdateOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["payment_status"]


class CreateOrderSerializer(serializers.Serializer):
    cart_id = serializers.UUIDField()

    def validate_cart_id(self, cart_id):
        if not Cart.objects.filter(pk=cart_id).exists():
            raise serializers.ValidationError("No cart with the given ID was found.")
        if CartItem.objects.filter(cart_id=cart_id).count() == 0:
            raise serializers.ValidationError("The cart is empty.")
        return cart_id

    def save(self, **kwargs):
        with transaction.atomic():
            cart_id = self.validated_data["cart_id"]

            customer = Customer.objects.get(user_id=self.context["user_id"])
            order = Order.objects.create(customer=customer)

            cart_items = CartItem.objects.select_related("product").filter(
                cart_id=cart_id
            )
            order_items = [
                OrderItem(
                    order=order,
                    product=item.product,
                    unit_price=item.product.unit_price,
                    quantity=item.quantity,
                )
                for item in cart_items
            ]
            OrderItem.objects.bulk_create(order_items)

            Cart.objects.filter(pk=cart_id).delete()

            order_created.send_robust(self.__class__, order=order)

            return order


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "street", "city", "country", "zip"]


class CreateOrderSerializer(serializers.Serializer):
    # ... existing fields ...

    def calculate_total(self, customer):
        # Get the subtotal by summing up the price of items in the cart
        cart_id = self.validated_data["cart_id"]
        subtotal = CartItem.objects.filter(cart_id=cart_id).aggregate(
            subtotal=Sum(F('quantity') * F('product__unit_price')))['subtotal'] or 0

        # Determine shipping cost
        shipping_address = Address.objects.filter(customer=customer).first()
        if shipping_address and (shipping_address.country in [Country('CA'), Country('US')]):
            shipping = 0  # Free shipping for Canada and US
        else:
            shipping = 10  # Flat rate shipping for other countries

        # Calculate tax and total
        if shipping_address and shipping_address.country == Country('CA'):
            total = (subtotal + shipping) * Decimal('1.13')
        else:
            total = subtotal * Decimal('1.13') + shipping

        return total.quantize(Decimal('0.01'))  # rounds to two places

    def save(self, **kwargs):
        customer = Customer.objects.get(user_id=self.context["user_id"])
        total = self.calculate_total(customer)
        # ... rest of your save logic, create Order and set total ...