from django.db import models
# from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from uuid import uuid4
from store.models import Product
# Create your models here.

class Like(models.Model):
    id = models.UUIDField(primary_key = True, default=uuid4, editable = False)
    created_at = models.DateTimeField(auto_now_add=True)


class LikedItem(models.Model):
    like = models.ForeignKey(Like, on_delete=models.CASCADE, related_name = 'items') #cartitem_set
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    class Meta:
        unique_together = [['like','product']]
    