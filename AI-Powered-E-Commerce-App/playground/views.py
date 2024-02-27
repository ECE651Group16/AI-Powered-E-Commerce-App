
from django.shortcuts import render
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from store.models import Product, OrderItem, Order, Customer, Collection
from django.db.models.aggregates import Count, Max, Min, Avg
from django.db.models import Q,F, Value, Func, ExpressionWrapper, DecimalField, FloatField
from django.db.models.functions import Concat
from django.contrib.contenttypes.models import ContentType
from tags.models import TaggedItem
from django.db import transaction
from django.db import connection
from django.core.mail import EmailMessage, send_mail, mail_admins, BadHeaderError

from templated_mail.mail import BaseEmailMessage
from .tasks import notify_customers

from django.core.cache import cache
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.views import APIView
import requests

############ logging#############
import logging

logger = logging.getLogger(__name__) 

class HelloView(APIView):
    def get(self, request):
        try:
            logger.info('Calling httpbin')
            response = requests.get('https://httpbin.org/delay/2')
            logger.info('Received the response')
            data = response.json()
        except requests.ConnectionError:
            logger.critical('httpbin is offline')
        return render(request, 'hello.html', {'name': 'Mosh'})






# slow api #########Caching#############
# class HelloView(APIView):
#     @method_decorator(cache_page(5 * 60))
#     def get(self, request):
#         response = requests.get('https://httpbin.org/delay/2')
#         data = response.json()
#         return render(request, 'hello.html', {'name': 'Mosh'})
# caching
# def say_hello(request):
#     key = 'httpbin_result'
#     if cache.get(key) is None:
#         response = request.get('https://httpbin.org/delay/2')
#         data = response.json()
#         cache.set(key,data)
#     return render(request, 'hello.html', {'name': cache.get(key)})

# ######sendingemails#################

# def say_hello(request):
#     notify_customers.delay('Hello')
#     return render(request, 'hello.html', {'name': 'Mosh'})
# 
# def say_hello(request):
#     try:
#        message = BaseEmailMessage(
#            template_name='emails/hello.html',
#            context={'name': 'Mosh'}
#        )
#        message.attach_file('playground/static/images/liuliu.jpg')
#        message.send(['john@moshbuy.com'])
#     except BadHeaderError:
#         pass
#     return render(request, 'hello.html', {'name': 'Mosh'})
# #@transaction.atomic()
# def say_hello(request):
    # return HttpResponse("Hello World")
    # x = calculate()
    # query_set = Product.objects.all()
    # Product.objects.count()
    # list(query_set)
    # query_set[0:5]
    # query_set.filter().filter().order_by()
    # try except:
    # keyword = value filter(pk = 0)
    #product = Product.objects.first(unit_price__gt = 20) # .exist()
    #queryset = Product.objects.filter(unit_price__range=(20,30))
    #product = Product.objects.get(pk = 0) # id
    # queryset = Product.objects.filter(collection__id__range = (2,3))
   #  queryset = Product.objects.filter(title__icontains = 'coffee') # startswith # last_update__year = 2021 #description__isnull = True
    # Products: inventory < 10 OR price >= 20
    # queryset = Product.objects.filter(Q(inventory__lt = 10) | ~Q(unit_price__lt = 20))
    

    # for product in query_set:
    #     print(product)
    # queryset = Product.objects.filter(inventory = F('collection__id')) # inventory == collection_id
    # queryset = Product.objects.order_by("unit_price","-title").reverse()
    # product = Product.objects.earliest('unit_price')
    # product = Product.objects.order_by("title")[0]
    # queryset = Product.objects.all()[5:10]
    # queryset = Product.objects.values('id', 'title', 'collection__title') # dict
    # queryset = Product.objects.values_list('id', 'title', 'collection__title') # tuple
    # queryset = Product.objects.filter(id__in = OrderItem.objects.values('product_id').distinct()).order_by()
    # queryset = Product.objects.only('id','title') # instance of object class
    # queryset = Product.objects.defer('description')
    # # select_related(1)
    # queryset = Product.objects.select_related('collection__someOtherField').all()
    # # prefetch_relate(n)
    # queryset = Product.objects.prefetch_related('promotions').all()
    # queryset = Product.objects.prefetch_related('promotions').select_related('collection').all()
    # queryset = Order.objects.select_related('customer').prefetch_related('orderitem_set__product').order_by('-placed_at')[:5]
    # result = Product.objects.filter(collection__id=3).aggregate(count = Count('id'), min_price = Min('unit_price'))
    # queryset = Customer.objects.annotate(is_new=Value(True))
    # queryset = Customer.objects.annotate(new_id = F('id'))
    # # queryset = Customer.objects.annotate(
    # #     # CONCAT
    # #     full_name = Func(F('first_name'), Value(' '), F('last_name'), function='CONCAT' )
    # # )
    # queryset = Customer.objects.annotate(
    #     # CONCAT
    #     full_name = Concat('first_name', Value(' '), 'last_name')
    # )
    # queryset = Customer.objects.annotate(
    #     orders_count = Count('order')
    # )
    # discounted_price = ExpressionWrapper(F('unit_price') * 0.8, output_field=FloatField())
    # queryset = Product.objects.annotate(
    #     discounted_price = discounted_price
    # )

   
    # TaggedItem.objects.get_tags_for(Product,1)

    # queryset = Product.objects.all()
    # list(queryset)
    # # objects:::::::
    # #return render(request, 'hello.html', {'name': 'Kevin', 'products': list(queryset)})
    # # collection = Collection(pk = 11)
    # # collection.title = 'Games'
    # # collection.featured_product = Product(pk=1)
    # # collection.save()
    
    # #Collection.objects.filter(pk=11).update(featured_product= None)
    # # collection = Collection(pk=11)
    # # collection.delete()
    # # Collection.objects.filter(id__gt = 5).delete()

    # # with transaction.atomic():
    # #     order = Order()
    # #     order.customer_id = 1
    # #     order.save()

    # #     item = OrderItem()
    # #     item.order = order
    # #     item.product_id = 1
    # #     item.quantity = 1
    # #     item.unit_price = 10
    # #     item.save()

    # # cursor = connection.cursor()
    # # cursor.execute('')
    # # cursor.close()

    # # with connection.cursor as cursor:
    # #     cursor.execute()
    # #     cursor.callproc('get_customers', [1,2,'a'])
    
    # # queryset = Product.objects.raw('SELECT id, title FROM store_product')


    # #return render(request, 'hello.html', {'name': 'Kevin', 'result':  result, 'orders': list(queryset)})