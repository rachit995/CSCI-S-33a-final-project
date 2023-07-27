from django.contrib.auth import authenticate, login, logout
from rest_framework import viewsets
from .models import Listing, Category, Bid, Comment, Watchlist, User, Rating
from .serializers import (
    ListingSerializer,
    CategorySerializer,
    BidSerializer,
    CommentSerializer,
    WatchlistSerializer,
)
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .utils import filter_objects

# Create your views here.


class ListingViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = Listing.objects.all()
        listing_filter = request.query_params.get("filter", "active")
        query = request.query_params.get("query", None)
        listings = filter_objects(request, listings, listing_filter, query)
        serializer = ListingSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get("title")
        description = request.data.get("description")
        starting_bid = request.data.get("starting_bid")
        image_url = request.data.get("image_url")
        category = request.data.get("category")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        category = Category.objects.get(id=category)
        user = request.user
        if (
            title is None
            or description is None
            or starting_bid is None
            or image_url is None
            or category is None
        ):
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        listing = Listing.objects.create(
            title=title,
            description=description,
            starting_bid=starting_bid,
            image_url=image_url,
            category=category,
            user=user,
            latitude=latitude,
            longitude=longitude,
        )
        return Response(
            {"success": "Listing created successfully"}, status=201
        )


class ListingDetailViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        listing = Listing.objects.get(id=pk)
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class RatingViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        listing = Listing.objects.get(pk=pk)
        rating = request.data.get("rating")
        user = request.user
        if Rating.objects.filter(listing=listing, user=user).exists():
            return Response({"error": "Rating already exists"}, status=400)
        rating = Rating.objects.create(
            rating=rating,
            listing=listing,
            user=user,
        )
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class CategoryViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        category = request.data.get("category")
        if category is None:
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        category = Category.objects.create(category=category)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=201)


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class WatchlistViewSet(viewsets.ModelViewSet):
    queryset = Watchlist.objects.all()
    serializer_class = WatchlistSerializer


class RegisterViewSet(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        confirm_password = request.data.get("confirm_password")
        if username is None or password is None:
            return Response(
                {"error": "Please provide both username and password"},
                status=400,
            )
        if password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
        )
        return Response({"success": "User created successfully"})


class LogoutViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"success": "User logged out successfully"})
