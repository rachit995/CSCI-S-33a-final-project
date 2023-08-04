from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views


urlpatterns = [
    path("token", obtain_auth_token, name="token"),  # endpoint for login token
    path(
        "register", views.RegisterViewSet.as_view(), name="register"
    ),  # endpoint for registration
    path(
        "listings", views.ListingViewSet.as_view(), name="listings"
    ),  # endpoint for listings
    path(
        "listings/<int:pk>",
        views.ListingDetailViewSet.as_view(),
        name="listing",
    ),  # endpoint for listing detail
    path(
        "listings/<int:pk>/ratings",
        views.RatingViewSet.as_view(),
        name="ratings",
    ),  # endpoint for ratings
    path(
        "categories", views.CategoryViewSet.as_view(), name="categories"
    ),  # endpoint for categories
    path(
        "categories/<int:pk>/listings",
        views.CategoryListingViewSet.as_view(),
        name="category_listings",
    ),  # endpoint for category listings
    path("me", views.UserViewSet.as_view(), name="me"),  # endpoint for user
    path(
        "listings/<int:pk>/watch",
        views.WatchlistViewSet.as_view(),
        name="watch",
    ),  # endpoint for watchlist
    path(
        "watchlist", views.WatchlistListingViewSet.as_view(), name="watchlist"
    ),  # endpoint for watchlist listings
    path(
        "ai/generate_description",
        views.GenerateDescriptionViewSet.as_view(),
        name="generate_description",
    ),  # endpoint for generating description
    path(
        "listings/<int:pk>/comments",
        views.CommentViewSet.as_view(),
        name="comments",
    ),  # endpoint for comments
    path(
        "listings/<int:pk>/bids",
        views.BidViewSet.as_view(),
        name="bid",
    ),  # endpoint for bids
    path(
        "listings/<int:pk>/close",
        views.CloseListingViewSet.as_view(),
        name="close",
    ),  # endpoint for closing listing
    path(
        "map_listings",
        views.MapListingViewSet.as_view(),
        name="map_listings",
    ),  # endpoint for map listings
]
