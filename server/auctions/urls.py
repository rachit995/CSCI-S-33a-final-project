from django.urls import path
from rest_framework import routers
from .views import ListingViewSet
from django.conf.urls import include
from rest_framework.authtoken.views import obtain_auth_token
from . import views


urlpatterns = [
    path("register", views.RegisterViewSet.as_view(), name="register"),
    path("token", obtain_auth_token, name="token"),
    path("listings", views.ListingViewSet.as_view(), name="listings"),
    path(
        "listings/<int:pk>",
        views.ListingDetailViewSet.as_view(),
        name="listing",
    ),
    path(
        "listings/<int:pk>/ratings",
        views.RatingViewSet.as_view(),
        name="ratings",
    ),
    path("categories", views.CategoryViewSet.as_view(), name="categories"),
]
