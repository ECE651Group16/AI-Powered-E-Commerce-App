from typing import Any

# from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib import admin, messages
from django.db.models.query import QuerySet
from django.http.request import HttpRequest

# from tags.models import TaggedItem
from . import models
from django.urls import reverse
from django.utils.html import format_html, urlencode
from django.db.models import Count

# Register your models here.


class InventoryFilters(admin.SimpleListFilter):
    title = "inventory"
    parameter_name = "inventory"

    def lookups(self, request, model_admin):
        return [("<10", "Low")]

    def queryset(self, request, queryset):
        if self.value() == "<10":
            return queryset.filter(inventory__lt=10)


class ProductImageInline(admin.TabularInline):
    model = models.ProductImage
    readonly_fields = ["thumbnail"]

    def thumbnail(self, instance):
        if instance.image.name != "":
            return format_html(f'<img src="{instance.image.url}" class="thumbnail"/>')
        return ""


@admin.register(models.Product)  # admin.site.register(models.Product, ProductAdmin)
class ProductAdmin(admin.ModelAdmin):
    # inlines = [TagInline]
    autocomplete_fields = ["collection"]
    prepopulated_fields = {"slug": ["title"]}
    # exclude = ['slug'] # fields =['title'] # readonly_field
    actions = ["clear_inventory"]
    inlines = [ProductImageInline]
    list_display = [
        "title",
        "unit_price",
        "inventory",
        "inventory_status",
        "total_sells",
        "collection_title",
    ]
    # list_editable = ['unit_price','inventory']
    list_per_page = 30
    search_fields = ["title"]
    list_filter = ["collection", "last_update", InventoryFilters]
    # list_filter = ['collection__title']
    # queryset.select_related faster
    list_select_related = ["collection"]

    def collection_title(self, product):
        return product.collection.title
        # return product.collection.title if product.collection else None

    @admin.display(ordering="inventory")
    def inventory_status(self, product):
        if product.inventory < 10:
            return "Low"
        return "OK"

    @admin.action(description="Clear inventory")
    def clear_inventory(self, request, queryset):
        updated_count = queryset.update(inventory=0)
        self.message_user(
            request, f"{updated_count} product were successfully updated", messages.INFO
        )

    class Media:
        css = {"all": ["store/styles.css"]}


@admin.register(models.Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["first_name", "last_name", "membership", "orders"]
    list_editable = ["membership"]
    list_per_page = 10
    list_select_related = ["user"]
    ordering = ["user__first_name", "user__last_name"]
    search_fields = ["first_name__istartswith", "last_name__istartswith"]

    @admin.display(ordering="orders_count")
    def orders(self, customer):
        url = (
            reverse("admin:store_order_changelist")
            + "?"
            + urlencode({"customer__id": str(customer.id)})
        )
        return format_html('<a href="{}">{} Orders</a>', url, customer.orders_count)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(orders_count=Count("order"))


class OrderItemInline(admin.StackedInline):  # TabularInline
    autocomplete_fields = ["product"]
    min_num = 1
    max_num = 10
    model = models.OrderItem
    extra = 0


@admin.register(models.Order)
class OrderAdmin(admin.ModelAdmin):
    autocomplete_fields = ["customer"]
    inlines = [OrderItemInline]
    list_display = ["id", "placed_at", "customer"]
    search_fields = [
        "id__istartswith",
        "customer__first_name__istartswith",
        "customer__last_name__istartswith",
    ]


@admin.register(models.Collection)
class CollectionAdmin(admin.ModelAdmin):
    autocomplete_fields = ["featured_product"]
    list_display = ["title", "products_count"]
    search_fields = ["title"]

    @admin.display(ordering="products_count")
    def products_count(self, collection):
        url = (
            reverse("admin:store_product_changelist")
            + "?"
            + urlencode({"collection__id": str(collection.id)})
        )
        return format_html(
            '<a href="{}">{} Products</a>', url, collection.products_count
        )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(products_count=Count("products"))
