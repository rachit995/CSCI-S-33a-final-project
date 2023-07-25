from django.urls import path
from rest_framework import routers
from .views import ListingViewSet
from django.conf.urls import include
from . import views

router = routers.DefaultRouter()
router.register(r"listings", ListingViewSet)
router.register(r"categories", views.CategoryViewSet)
router.register(r"bids", views.BidViewSet)
router.register(r"comments", views.CommentViewSet)
router.register(r"watchlists", views.WatchlistViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
