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
    path(
        "categories/<int:pk>/listings",
        views.CategoryListingViewSet.as_view(),
        name="category_listings",
    ),
    path("me", views.UserViewSet.as_view(), name="me"),
    path(
        "listings/<int:pk>/watch",
        views.WatchlistViewSet.as_view(),
        name="watch",
    ),
    path(
        "watchlist", views.WatchlistListingViewSet.as_view(), name="watchlist"
    ),
    path(
        "ai/generate_description",
        views.GenerateDescriptionViewSet.as_view(),
        name="generate_description",
    ),
    path(
        "listings/<int:pk>/comments",
        views.CommentViewSet.as_view(),
        name="comments",
    ),
    path(
        "listings/<int:pk>/bids",
        views.BidViewSet.as_view(),
        name="bid",
    ),
    path(
        "listings/<int:pk>/close",
        views.CloseListingViewSet.as_view(),
        name="close",
    ),
    path(
        "map_listings",
        views.MapListingViewSet.as_view(),
        name="map_listings",
    ),
]
