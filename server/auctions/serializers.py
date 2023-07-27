from rest_framework import serializers
from .models import Listing, Category, Bid, Comment, Watchlist, User


class ListingSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField("get_average_rating")
    current_bid = serializers.SerializerMethodField("get_current_bid")
    user_rating = serializers.SerializerMethodField("get_user_rating")
    category_name = serializers.SerializerMethodField("get_category_name")

    def get_average_rating(self, listing):
        return listing.get_average_rating()

    def get_current_bid(self, listing):
        return listing.current_bid()

    def get_user_rating(self, listing):
        user = self.context["request"].user
        if user.is_authenticated:
            rating = listing.ratings.filter(user=user)
            if rating:
                return rating[0].rating
        return None

    def get_category_name(self, listing):
        return listing.category.category

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "starting_bid",
            "image_url",
            "category",
            "user",
            "rating",
            "current_bid",
            "user_rating",
            "category_name",
            "latitude",
            "longitude",
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "category"]


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
