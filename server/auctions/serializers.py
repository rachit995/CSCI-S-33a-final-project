from rest_framework import serializers
from .models import Listing, Category, Bid, Comment, Watchlist, User


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["category"]


class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ["bid", "listing", "user", "winner"]


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["comment", "listing", "user"]


class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ["listing", "user"]
