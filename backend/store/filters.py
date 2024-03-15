from django_filters.rest_framework import FilterSet
from django_filters import rest_framework as filters
from .models import Product

class ProductFilter(FilterSet):
  # class Meta:
  #   model = Product
  #   fields = {
  #     'collection_id': ['exact'],
  #     'unit_price': ['gt', 'lt']
  #   }

  collection_id = filters.BaseInFilter(field_name='collection_id', lookup_expr='in')
  # unit_price_gt = filters.NumberFilter(field_name='unit_price', lookup_expr='gt')
  # unit_price_lt = filters.NumberFilter(field_name='unit_price', lookup_expr='lt')

  class Meta:
      model = Product
      fields ={'unit_price': ['gt', 'lt']}