from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime
from django.utils import timezone
from .utils import get_time_ago


# User model
class User(AbstractUser):
    def get_display_name(self):
        if self.first_name and self.last_name:
            return (
                f"{self.first_name.capitalize()} {self.last_name.capitalize()}"
            )
        elif self.first_name:
            return f"{self.first_name.capitalize()}"
        elif self.last_name:
            return f"{self.last_name.capitalize()}"
        else:
            return f"{self.username}"

    def __str__(self):
        return f"{self.username}"

    # Returns the number of active listings posted by the user
    def get_active_watchlist_count(self):
        return self.watchlists.filter(listing__active=True).count()


# Category model
class Category(models.Model):
    category = models.CharField(max_length=64, unique=True)  # Category name
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # Category created timestamp
    updated_at = models.DateTimeField(
        auto_now=True
    )  # Category updated timestamp

    def __str__(self):
        return f"{self.category}"

    # Returns the number of listings in the category
    def active_listing_count(self):
        return self.listings.filter(active=True).count()


# Rating model
class Rating(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="ratings"
    )  # User who was rated
    rating = models.IntegerField()  # Rating value
    listing = models.ForeignKey(
        "Listing", on_delete=models.CASCADE, related_name="ratings"
    )  # Listing the rating was posted on
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # Rating created timestamp
    updated_at = models.DateTimeField(
        auto_now=True
    )  # Rating updated timestamp

    def __str__(self):
        return f"{self.rating}"


# Listing model
class Listing(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="listings"
    )  # User who posted the listing
    title = models.CharField(max_length=64)  # Listing title
    description = models.TextField()  # Listing description
    image_url = models.URLField(blank=True)  # Listing image url
    active = models.BooleanField(default=True)  # Listing active status
    starting_bid = models.IntegerField()  # Listing starting bid
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="listings"
    )  # Listing category
    latitude = models.DecimalField(
        max_digits=20, decimal_places=17, blank=True, null=True
    )  # Listing latitude
    longitude = models.DecimalField(
        max_digits=20, decimal_places=17, blank=True, null=True
    )  # Listing longitude
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # Listing created timestamp
    updated_at = models.DateTimeField(
        auto_now=True
    )  # Listing updated timestamp

    def __str__(self):
        return f"{self.title}"

    # Returns the time ago the listing was posted
    def posted_time_ago(self):
        return get_time_ago(self.created_at)

    # Returns the highest bid on the listing
    def get_highest_bid(self):
        return self.bids.order_by("-bid").first()

    # Function to close the listing and set the highest bid as the winner
    def close_listing(self):
        self.active = False
        self.save()
        highest_bid = self.bids.order_by("-bid").first()
        if highest_bid:
            highest_bid.winner = True
            highest_bid.save()

    # Returns the number of comments on the listing
    def get_watchlist_count(self):
        return self.watchlists.count()

    # Returns the users who have the listing in their watchlist
    def get_watchlist_users(self):
        return self.watchlists.all().values_list("user", flat=True)

    # Returns the winner of the listing
    def winner(self):
        return self.bids.filter(winner=True).first()

    # Returns the current bid on the listing
    def current_bid(self):
        try:
            # Return the highest bid if it exists
            return self.bids.order_by("-bid").first().bid
        except AttributeError:
            # Return the starting bid if no bids exist
            return self.starting_bid

    # Returns the number of bids on the listing
    def bid_count(self):
        return self.bids.count()

    def get_average_rating(self):
        ratings = self.ratings.all()
        if ratings:
            return sum([rating.rating for rating in ratings]) / len(ratings)
        else:
            return 0

    class Meta:
        ordering = ["-created_at"]


# Bid model
class Bid(models.Model):
    bid = models.IntegerField()  # Bid amount
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="bids"
    )  # Listing bid was placed on
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bids"
    )  # User who placed the bid
    winner = models.BooleanField(default=False)  # Bid winner status
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # Bid created timestamp
    updated_at = models.DateTimeField(auto_now=True)  # Bid updated timestamp

    def __str__(self):
        return f"{self.user} bid {self.bid} on {self.listing}"


# Comment model
class Comment(models.Model):
    comment = models.CharField(max_length=256)  # Comment text
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="comments"
    )  # Listing comment was posted on
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comments"
    )  # User who posted the comment
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="replies",
        blank=True,
        null=True,
    )  # Parent comment
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # Comment created timestamp
    updated_at = models.DateTimeField(
        auto_now=True
    )  # Comment updated timestamp

    def __str__(self):
        return f"{self.comment}"

    # Returns the time ago the comment was posted
    def posted_time_ago(self):
        return get_time_ago(self.created_at)

    def get_replies(self):
        return self.replies.all()

    class Meta:
        ordering = ["-created_at"]


# Watchlist model
class Watchlist(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="watchlists"
    )  # User who added the listing to their watchlist
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="watchlists"
    )  # Listing added to the watchlist
    created_at = models.DateTimeField(
        auto_now_add=True
    )  # Watchlist created timestamp
    updated_at = models.DateTimeField(
        auto_now=True
    )  # Watchlist updated timestamp

    def __str__(self):
        return f"{self.user} added {self.listing}({self.listing.id}) to their watchlist"
