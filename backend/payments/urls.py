from django.urls import path, include
from .views import PaymentViewSet

# URLConf
urlpatterns = [
    path("create-checkout-session", PaymentViewSet.as_view()),           
]
