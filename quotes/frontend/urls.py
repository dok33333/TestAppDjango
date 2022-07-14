from django.urls import path
from . import views


urlpatterns = [
    path('', views.index ),
    path('get_cryptocurrencies/', views.get_cryptocurrencies),
    path('get_quotes/', views.get_quotes),
    path('get_pair/', views.get_pair),
    path('export/', views.export),
]