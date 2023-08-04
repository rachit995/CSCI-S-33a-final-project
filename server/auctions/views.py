from django.contrib.auth import authenticate, login, logout
from rest_framework import viewsets
from .models import Listing, Category, Bid, Comment, Watchlist, User, Rating
from .serializers import (
    ListingSerializer,
    CategorySerializer,
    BidSerializer,
    CommentSerializer,
    WatchlistSerializer,
    ListingMapSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.core.paginator import Paginator
import openai

from django.conf import settings

from .utils import filter_objects

# Create your views here.


class ListingViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = Listing.objects.all()
        listing_filter = request.query_params.get("filter", "active")
        query = request.query_params.get("query", None)
        listings = filter_objects(request, listings, listing_filter, query)
        page = request.query_params.get("page", 1)
        limit = request.query_params.get("limit", 8)
        paginator = Paginator(listings, limit)
        listings = paginator.page(page)
        serializer = ListingSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(
            {
                "count": paginator.count,
                "num_pages": paginator.num_pages,
                "results": serializer.data,
            }
        )

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

    def put(self, request, pk):
        listing = Listing.objects.get(id=pk)
        if listing.user != request.user:
            return Response(
                {"error": "You are not authorized to edit this listing"},
                status=401,
            )
        title = request.data.get("title")
        description = request.data.get("description")
        starting_bid = request.data.get("starting_bid")
        image_url = request.data.get("image_url")
        category = request.data.get("category")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        category = Category.objects.get(id=category)
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
        listing.title = title
        listing.description = description
        listing.starting_bid = starting_bid
        listing.image_url = image_url
        listing.category = category
        listing.latitude = latitude
        listing.longitude = longitude
        listing.save()
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data, status=201)


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


class CommentViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        listing = Listing.objects.get(id=pk)
        page = request.query_params.get("page", 1)
        limit = request.query_params.get("limit", 10)
        comments = Comment.objects.filter(listing=listing, parent=None)
        paginator = Paginator(comments, limit)
        comments = paginator.page(page)
        serializer = CommentSerializer(
            comments, many=True, context={"request": request}
        )
        return Response(
            {
                "count": paginator.count,
                "num_pages": paginator.num_pages,
                "results": serializer.data,
            }
        )

    def post(self, request, pk):
        listing = Listing.objects.get(id=pk)
        comment = request.data.get("comment")
        parent_comment_id = request.data.get("parent_comment_id")
        if parent_comment_id is not None:
            parent = Comment.objects.get(id=parent_comment_id)
        else:
            parent = None
        user = request.user
        if comment is None:
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        comment = Comment.objects.create(
            comment=comment,
            listing=listing,
            user=user,
            parent=parent,
        )
        serializer = CommentSerializer(comment, context={"request": request})
        return Response(serializer.data, status=201)


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


class UserViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "id": user.id,
                "display_name": user.get_display_name(),
            }
        )


class WatchlistViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        listing = Listing.objects.get(id=pk)
        user = request.user
        if Watchlist.objects.filter(listing=listing, user=user).exists():
            Watchlist.objects.filter(listing=listing, user=user).delete()
        else:
            Watchlist.objects.create(listing=listing, user=user)
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class CategoryListingViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        category = Category.objects.get(id=pk)
        listings = Listing.objects.filter(category=category)
        listing_filter = request.query_params.get("filter", "active")
        query = request.query_params.get("query", None)
        listings = filter_objects(request, listings, listing_filter, query)
        page = request.query_params.get("page", 1)
        limit = request.query_params.get("limit", 8)
        paginator = Paginator(listings, limit)
        listings = paginator.page(page)
        serializer = ListingSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(
            {
                "count": paginator.count,
                "num_pages": paginator.num_pages,
                "results": serializer.data,
                "category": category.category,
            }
        )


class WatchlistListingViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = Listing.objects.filter(watchlists__user=request.user)
        listing_filter = request.query_params.get("filter", "active")
        query = request.query_params.get("query", None)
        listings = filter_objects(request, listings, listing_filter, query)
        page = request.query_params.get("page", 1)
        limit = request.query_params.get("limit", 8)
        paginator = Paginator(listings, limit)
        listings = paginator.page(page)
        serializer = ListingSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(
            {
                "count": paginator.count,
                "num_pages": paginator.num_pages,
                "results": serializer.data,
            }
        )


class GenerateDescriptionViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get("title")
        if title is None:
            return Response(
                {"error": "Please provide a title to generate description"},
                status=400,
            )

        openai.api_key = settings.OPENAI_API_KEY
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": "I want to sell a "
                    + title
                    + ". What should I write in the description with in 50 words?",
                }
            ],
        )
        return Response(
            {"description": response["choices"][0]["message"]["content"]}
        )


class BidViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        listing = Listing.objects.get(id=pk)
        bid = int(request.data.get("bid"))
        user = request.user
        if bid is None:
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        if listing.bids.all().count() > 0:
            if listing.bids.all().order_by("-bid")[0].bid >= bid:
                return Response(
                    {"error": "Bid must be greater than the current bid"},
                    status=400,
                )
        bid = Bid.objects.create(
            bid=bid,
            listing=listing,
            user=user,
        )
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class CloseListingViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        listing = Listing.objects.get(id=pk)
        user = request.user
        if listing.user != user:
            return Response(
                {"error": "You are not authorized to close this listing"},
                status=401,
            )
        listing.close_listing()
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class MapListingViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = Listing.objects.filter(active=True)
        serializer = ListingMapSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(serializer.data)
