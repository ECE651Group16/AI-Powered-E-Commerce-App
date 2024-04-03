from django.views.generic import TemplateView
from django.urls import path, include

# URLConf
urlpatterns = [path('api/stripe/', include('payments.urls')),
            #    path("", TemplateView.as_view(template_name="core/index.html"))
               ]
