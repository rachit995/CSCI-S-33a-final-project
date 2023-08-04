from rest_framework import serializers
from .models import Listing, Category, Bid, Comment, Watchlist, User
import decimal
import random


def get_map_coordinates_delta():
    return decimal.Decimal(random.randrange(1, 300)) / 1000


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
    latitude = serializers.SerializerMethodField("get_latitude")
    longitude = serializers.SerializerMethodField("get_longitude")
    username = serializers.SerializerMethodField("get_username")

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
            return winner.user.get_display_name()
        return None

    def get_latitude(self, listing):
        try:
            user = self.context["request"].user
            accurate_latitude = listing.latitude
            inaccurate_latitude = (
                listing.latitude + get_map_coordinates_delta()
            )
            if user.is_authenticated:
                winner = listing.winner()
                owner = listing.user
                if (winner and winner.user == user) or owner == user:
                    return accurate_latitude
                else:
                    return inaccurate_latitude
            else:
                return inaccurate_latitude
        except Exception as e:
            return 0

    def get_longitude(self, listing):
        try:
            user = self.context["request"].user
            accurate_longitude = listing.longitude
            inaccurate_longitude = (
                listing.longitude + get_map_coordinates_delta()
            )
            if user.is_authenticated:
                winner = listing.winner()
                owner = listing.user
                if (winner and winner.user == user) or owner == user:
                    return accurate_longitude
                else:
                    return inaccurate_longitude
            else:
                return inaccurate_longitude
        except Exception as e:
            return 0

    def get_username(self, listing):
        return listing.user.get_display_name()

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
            "is_watched",
            "active",
            "is_owner",
            "total_bids",
            "winner_id",
            "winner_name",
            "latitude",
            "longitude",
            "created_at",
            "username",
        ]


class ListingMapSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField("get_latitude")
    longitude = serializers.SerializerMethodField("get_longitude")

    def get_latitude(self, listing):
        try:
            user = self.context["request"].user
            accurate_latitude = listing.latitude
            inaccurate_latitude = (
                listing.latitude + get_map_coordinates_delta()
            )
            if user.is_authenticated:
                winner = listing.winner()
                owner = listing.user
                if (winner and winner.user == user) or owner == user:
                    return accurate_latitude
                else:
                    return inaccurate_latitude
            else:
                return inaccurate_latitude
        except Exception as e:
            return 0

    def get_longitude(self, listing):
        try:
            user = self.context["request"].user
            accurate_longitude = listing.longitude
            inaccurate_longitude = (
                listing.longitude + get_map_coordinates_delta()
            )
            if user.is_authenticated:
                winner = listing.winner()
                owner = listing.user
                if (winner and winner.user == user) or owner == user:
                    return accurate_longitude
                else:
                    return inaccurate_longitude
            else:
                return inaccurate_longitude
        except Exception as e:
            return 0

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "image_url",
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
    name = serializers.SerializerMethodField("get_name")
    replies = serializers.SerializerMethodField("get_replies")
    rating = serializers.SerializerMethodField("get_rating")

    def get_name(self, comment):
        return comment.user.get_display_name()

    def get_replies(self, comment):
        return CommentSerializer(
            comment.get_replies(), many=True, context=self.context
        ).data

    def get_rating(self, comment):
        listing = comment.listing
        user = comment.user
        if user.is_authenticated:
            rating = listing.ratings.filter(user=user)
            if rating:
                return rating[0].rating
        return None

    class Meta:
        model = Comment
        fields = [
            "id",
            "comment",
            "listing",
            "user",
            "created_at",
            "name",
            "replies",
            "rating",
        ]


class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ["listing", "user"]
