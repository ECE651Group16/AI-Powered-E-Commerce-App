from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from store.models import Customer, Order, OrderItem, Product
from django.db.models import F



@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_customer_for_new_user(sender, **kwargs):
    if kwargs['created']:
        Customer.objects.create(user=kwargs['instance'])

        
@receiver(post_save, sender=Order)
def update_product_total_sells(sender, instance, created, **kwargs):
    if instance.payment_status == Order.PAYMENT_STATUS_COMPLETE:
        order_items = OrderItem.objects.filter(order=instance)
        
        for item in order_items:
            # Correct approach to increment and save
            product = Product.objects.get(id=item.product.id) # Ensure you have the most up-to-date product instance
            product.total_sells += item.quantity
            product.save()
