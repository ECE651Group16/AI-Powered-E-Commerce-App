from django.db import models
from django.core.validators import MinValueValidator
# Create your models here.
class Promotion(models.Model):
    description = models.CharField(max_length=255)
    discount = models.FloatField()
    # product_set

class Collection(models.Model):
    title = models.CharField(max_length = 255)
    featured_product = models.ForeignKey('Product', on_delete = models.SET_NULL, null=True, related_name = '+')
    
    def __str__(self):
        return self.title
    class Meta:
        ordering = ["title"]

class Product(models.Model):
    # sku = models.CharField(max_length = 10, primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField()
    description = models.TextField(null=True,blank = True)
    unit_price = models.DecimalField(max_digits = 6, decimal_places = 2, validators = [MinValueValidator(0.009,message=('Ensure this value is greater than or equal to 0.01.'))])
    inventory = models.IntegerField(validators = [MinValueValidator(0)])
    last_update = models.DateTimeField(auto_now_add = True)
    collection = models.ForeignKey(Collection, on_delete=models.PROTECT)
    promotions = models.ManyToManyField(Promotion,null=True, blank= True)

    def __str__(self):
        return self.title
    class Meta:
        ordering = ["title"]


class Customer(models.Model):
    MEMBERSHIP_BRONZE = 'B'
    MEMBERSHIP_SLIVER = 'S'
    MEMBERSHIP_GOLD = 'G'
    MEMBERSHIP_CHOICES = [
        (MEMBERSHIP_BRONZE, 'Bronze'),
        (MEMBERSHIP_SLIVER, 'Sliver'),
        (MEMBERSHIP_GOLD, 'Gold')
    ]
    first_name = models.CharField(max_length = 255)
    last_name = models.CharField(max_length = 255)
    email = models.EmailField(unique = True)
    phone = models.CharField(max_length = 255)
    birth_date = models.DateField(null = True)
    membership = models.CharField(max_length = 1, choices = MEMBERSHIP_CHOICES, default = MEMBERSHIP_BRONZE)
    
    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    class Meta:
        db_table = 'store_customer'
        indexes = [models.Index(fields = ['last_name', 'first_name'])]
        ordering = ['first_name', 'last_name']


class Order(models.Model):
    PAYMENT_STATUS_PENDING = 'P'
    PAYMENT_STATUS_COMPLETE = 'C'
    PAYMENT_STATUS_FAILED = 'F'
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PENDING, 'Pending'),
        (PAYMENT_STATUS_COMPLETE, 'Complete'),
        (PAYMENT_STATUS_FAILED, 'Failed')
    ]
    placed_at = models.DateTimeField(auto_now_add = True)
    payment_status = models.CharField(
        max_length = 1, choices=PAYMENT_STATUS_CHOICES, default = PAYMENT_STATUS_PENDING
    )
    customer = models.ForeignKey(Customer, on_delete = models.PROTECT)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete = models.PROTECT)
    product = models.ForeignKey(Product, on_delete = models.PROTECT)
    quantity = models.PositiveBigIntegerField()
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)


class Address(models.Model):
    street = models.CharField(max_length = 255)
    city = models.CharField(max_length = 255)
    zip = models.CharField(default = "",max_length = 20)
    #customer = models.OneToOneField(Customer, on_delete = models.CASCADE, primary_key = True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)

class Cart(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField()
    




    
