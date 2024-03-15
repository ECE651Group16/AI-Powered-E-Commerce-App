
from django.urls import include, path
from . import views

from rest_framework.routers import SimpleRouter, DefaultRouter
from pprint import pprint
from rest_framework_nested import routers
from likes.views import LikesViewSet, LikedItemViewSet

router = routers.DefaultRouter()
# router = DefaultRouter()
router.register('products', views.ProductViewSet, basename='product')
router.register('collections', views.CollectionViewSet)
router.register('carts',views.CartViewSet)
router.register('customers', views.CustomerViewSet)
router.register('orders', views.OrderViewSet, basename='orders')

router.register('likes',LikesViewSet, basename='likes')
likes_router = routers.NestedDefaultRouter(router,'likes',lookup='likes')
likes_router.register('items',LikedItemViewSet,basename='likes-items')

carts_router = routers.NestedDefaultRouter(router,'carts',lookup='cart')
carts_router.register('items',views.CartItemViewSet,basename='cart-items')
products_router = routers.NestedDefaultRouter(router, 'products', lookup='product')
products_router.register('reviews', views.ReviewViewSet,basename='product-reviews')
products_router.register('images', views.ProductImageViewSet, basename='product-images')

# pprint(router.urls)

urlpatterns = router.urls + products_router.urls + carts_router.urls + likes_router.urls



# URLConfiguration
'''
# urlpatterns = router.urls
# urlpatterns = [
#     path('', include(router.urls))
#     # path("products/", views.product_list),
#     path("products/", views.ProductList.as_view()),
#     path("products/<int:pk>/", views.ProductDetail.as_view()),
#     path("collections/", views.CollectionList.as_view()),
#     path("collections/<int:pk>/", views.CollectionDetail.as_view(), name = 'collection-detail')
# ]
'''

