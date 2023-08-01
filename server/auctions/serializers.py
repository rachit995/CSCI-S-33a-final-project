from rest_framework import serializers
from .models import Listing, Category, Bid, Comment, Watchlist, User


class ListingSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField("get_average_rating")
    current_bid = serializers.SerializerMethodField("get_current_bid")
    user_rating = serializers.SerializerMethodField("get_user_rating")
    category_name = serializers.SerializerMethodField("get_category_name")
    is_watched = serializers.SerializerMethodField("get_is_watched")
    is_owner = serializers.SerializerMethodField("get_is_owner")
    total_bids = serializers.SerializerMethodField("get_total_bids")
    winner_id = serializers.SerializerMethodField("get_winner_id")
    winner_name = serializers.SerializerMethodField("get_winner_name")

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

    def get_is_watched(self, listing):
        user = self.context["request"].user
        if user.is_authenticated:
            if Watchlist.objects.filter(listing=listing, user=user).exists():
                return True
        return False

    def get_is_owner(self, listing):
        user = self.context["request"].user
        if user.is_authenticated:
            if listing.user == user:
                return True
        return False

    def get_total_bids(self, listing):
        return listing.bid_count()

    def get_winner_id(self, listing):
        winner = listing.winner()
        if winner:
            return winner.user.id
        return None

    def get_winner_name(self, listing):
        winner = listing.winner()
        if winner:
            return winner.user.username
        return None

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
            "is_watched",
            "active",
            "is_owner",
            "total_bids",
            "winner_id",
            "winner_name",
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
    name = serializers.SerializerMethodField("get_name")

    def get_name(self, comment):
        return comment.user.username

    class Meta:
        model = Comment
        fields = ["comment", "listing", "user", "created_at", "name"]


class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ["listing", "user"]
