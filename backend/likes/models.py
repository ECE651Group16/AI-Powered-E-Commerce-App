from django.db import models
from django.core.exceptions import ValidationError
# from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from uuid import uuid4
from store.models import Product, Customer, Cart, CartItem
# Create your models here.

class Likes(models.Model):
    id = models.UUIDField(primary_key = True, default=uuid4, editable = False)
    created_at = models.DateTimeField(auto_now_add=True)
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE,null=True, blank=True)


class LikedItem(models.Model):
    likes = models.ForeignKey(Likes, on_delete=models.CASCADE, related_name = 'items') #cartitem_set
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    
    def add_to_cart(self):
        customer = self.likes.customer

        if customer is None:
        # Handle the case where the customer is None, perhaps by providing a user-friendly error message.
            raise ValidationError("This liked item has no associated customer to add to a cart.")
        cart, created = Cart.objects.get_or_create(customer=customer)
        
        # Retrieve or create a CartItem for the product
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=self.product, defaults={'quantity': 1} )

        # If the item already existed in the cart, increment the quantity
        if not created:
            cart_item.quantity += 1
            cart_item.save()

        return cart, cart_item

    class Meta:
        unique_together = [['likes','product']]
    