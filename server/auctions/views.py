from django.shortcuts import render
from rest_framework import viewsets
from .models import Listing, Category, Bid, Comment, Watchlist, User
from .serializers import (
    ListingSerializer,
    CategorySerializer,
    BidSerializer,
    CommentSerializer,
    WatchlistSerializer,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class WatchlistViewSet(viewsets.ModelViewSet):
    queryset = Watchlist.objects.all()
    serializer_class = WatchlistSerializer
