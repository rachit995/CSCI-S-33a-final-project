from django.contrib.auth import logout
from .models import Listing, Category, Bid, Comment, Watchlist, User, Rating
from .serializers import (
    ListingSerializer,
    CategorySerializer,
    CommentSerializer,
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
    """
    This viewset handles the following endpoints:

    - GET /listings
    - POST /listings

    GET /listings
    -------------

    This endpoint returns a list of listings. The listings can be filtered by
    the following query parameters:

    - filter: active, closed, all (default: active)
    - query: search query (default: None)
    - page: page number (default: 1)
    - limit: number of listings per page (default: 8)


    POST /listings
    --------------

    This endpoint creates a new listing. The following fields are required:

    - title
    - description
    - starting_bid
    - image_url
    - category
    - latitude
    - longitude
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        This method handles the GET /listings endpoint.

        Returns a list of listings.
        """
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
        """
        This method handles the POST /listings endpoint.

        Creates a new listing.
        """

        # Get the required fields from the request body
        title = request.data.get("title")
        description = request.data.get("description")
        starting_bid = request.data.get("starting_bid")
        image_url = request.data.get("image_url")
        category = request.data.get("category")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        category = Category.objects.get(id=category)
        user = request.user
        # Check if all the required fields are provided
        if (
            title is None
            or description is None
            or starting_bid is None
            or image_url is None
            or category is None
        ):
            # Return an error response if any of the required fields are missing
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        # Create a new listing
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
    """
    This viewset handles the following endpoints:

    - GET /listings/<int:pk>
    - PUT /listings/<int:pk>

    GET /listings/<int:pk>
    ----------------------

    This endpoint returns a single listing.

    PUT /listings/<int:pk>
    ----------------------

    This endpoint updates a listing. The following fields can be updated:

    - title
    - description
    - image_url
    - category
    - latitude
    - longitude
    """

    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        This method handles the GET /listings/<int:pk> endpoint.

        Returns a single listing.
        """
        listing = Listing.objects.get(id=pk)
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        """
        This method handles the PUT /listings/<int:pk> endpoint.

        Updates a listing.
        """
        # Get the listing to be updated
        listing = Listing.objects.get(id=pk)
        # Check if the user is authorized to update the listing
        if listing.user != request.user:
            return Response(
                {"error": "You are not authorized to edit this listing"},
                status=401,
            )
        # Get the fields to be updated from the request body
        title = request.data.get("title")
        description = request.data.get("description")
        image_url = request.data.get("image_url")
        category = request.data.get("category")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")
        category = Category.objects.get(id=category)
        # Check if all the required fields are provided
        if (
            title is None
            or description is None
            or image_url is None
            or category is None
        ):
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        # Update the listing
        listing.title = title
        listing.description = description
        listing.image_url = image_url
        listing.category = category
        listing.latitude = latitude
        listing.longitude = longitude
        listing.save()
        # Return the updated listing
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data, status=201)


class RatingViewSet(APIView):
    """
    This viewset handles the following endpoints:

    - POST /listings/<int:pk>/ratings

    POST /listings/<int:pk>/ratings
    -------------------------------
    This endpoint creates a new rating for a listing. The following fields are
    required:

    - rating
    """

    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        This method handles the POST /listings/<int:pk>/ratings endpoint.

        Creates a new rating for a listing.
        """
        # Get the listing to be rated
        listing = Listing.objects.get(pk=pk)
        # Get the rating from the request body
        rating = request.data.get("rating")
        user = request.user
        # Check if all the required fields are provided
        if rating is None:
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        #  Check if the rating is between 1 and 5
        if rating < 1 or rating > 5:
            return Response(
                {"error": "Rating must be between 1 and 5"}, status=400
            )
        # Check if the user is authorized to rate the listing
        if listing.user == user:
            return Response(
                {"error": "You cannot rate your own listing"}, status=400
            )
        # Check if the user has already rated the listing
        if Rating.objects.filter(listing=listing, user=user).exists():
            return Response({"error": "Rating already exists"}, status=400)
        # Create a new rating
        rating = Rating.objects.create(
            rating=rating,
            listing=listing,
            user=user,
        )
        # Return the listing
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class CategoryViewSet(APIView):
    """
    This viewset handles the following endpoints:

    - GET /categories
    - POST /categories

    GET /categories
    ---------------

    This endpoint returns a list of categories.

    POST /categories
    ----------------

    This endpoint creates a new category. The following fields are required:

    - category
    """

    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        This method handles the GET /categories endpoint.

        Returns a list of categories.
        """
        # Get all the categories
        categories = Category.objects.all()
        # Return the categories
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        This method handles the POST /categories endpoint.

        Creates a new category.
        """
        # Get the category from the request body
        category = request.data.get("category")
        # Check if all the required fields are provided
        if category is None:
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        # Check if the category already exists
        if Category.objects.filter(category=category).exists():
            return Response({"error": "Category already exists"}, status=400)
        # Create a new category
        category = Category.objects.create(category=category)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=201)


class CommentViewSet(APIView):
    """
    This viewset handles the following endpoints:

    - GET /listings/<int:pk>/comments
    - POST /listings/<int:pk>/comments

    GET /listings/<int:pk>/comments
    --------------------------------

    This endpoint returns a list of comments on a listing.

    POST /listings/<int:pk>/comments
    ---------------------------------

    This endpoint creates a new comment on a listing. The following fields are
    required:

    - comment
    - parent_comment_id (optional)
    """

    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        This method handles the GET /listings/<int:pk>/comments endpoint.

        Returns a list of comments on a listing.
        """
        # Get the listing
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
        """
        This method handles the POST /listings/<int:pk>/comments endpoint.

        Creates a new comment on a listing.
        """
        # Get the listing
        listing = Listing.objects.get(id=pk)
        # Get the comment from the request body
        comment = request.data.get("comment")
        # Get the parent comment id from the request body
        parent_comment_id = request.data.get("parent_comment_id")
        # Check if all the required fields are provided
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


class RegisterViewSet(APIView):
    """
    This viewset handles the following endpoint:

    - POST /register

    POST /register
    --------------

    This endpoint creates a new user. The following fields are required:

    - username
    - password
    - email
    - confirm_password
    """

    def post(self, request):
        """
        This method handles the POST /register endpoint.

        Creates a new user.
        """
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")
        confirm_password = request.data.get("confirm_password")
        # Check if all the required fields are provided
        if username is None or password is None:
            return Response(
                {"error": "Please provide both username and password"},
                status=400,
            )
        # Check if the password and confirm password match
        if password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)
        # Check if the username already exists
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)
        # Check if the email already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=400)
        # Create a new user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
        )
        return Response({"success": "User created successfully"})


class LogoutViewSet(APIView):
    """
    This viewset handles the following endpoint:

    - POST /logout

    POST /logout
    ------------

    This endpoint logs out the user.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        This method handles the POST /logout endpoint.

        Logs out the user.
        """
        logout(request)
        return Response({"success": "User logged out successfully"})


class UserViewSet(APIView):
    """
    This viewset handles the following endpoint:

    - GET /me

    GET /me
    -------

    This endpoint returns the details of the logged in user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        This method handles the GET /me endpoint.

        Returns the details of the logged in user.
        """
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
    """
    This viewset handles the following endpoint:

    - POST /listings/<int:pk>/watch

    POST /listings/<int:pk>/watch
    -----------------------------

    This endpoint adds or removes a listing from the user's watchlist.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        This method handles the POST /listings/<int:pk>/watch endpoint.

        Adds or removes a listing from the user's watchlist.
        """
        listing = Listing.objects.get(id=pk)
        user = request.user
        # Check if the user is authorized to watch the listing
        if listing.user == user:
            return Response(
                {"error": "You cannot watch your own listing"}, status=400
            )
        # Check if the listing is already in the user's watchlist
        if Watchlist.objects.filter(listing=listing, user=user).exists():
            Watchlist.objects.filter(listing=listing, user=user).delete()
        else:
            Watchlist.objects.create(listing=listing, user=user)
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class CategoryListingViewSet(APIView):
    """
    This viewset handles the following endpoint:

    - GET /categories/<int:pk>/listings

    GET /categories/<int:pk>/listings
    ---------------------------------

    This endpoint returns a list of listings in a category. The listings can be
    filtered by the following query parameters:

    - filter: active, closed, all (default: active)
    - query: search query (default: None)
    - page: page number (default: 1)
    - limit: number of listings per page (default: 8)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        This method handles the GET /categories/<int:pk>/listings endpoint.

        Returns a list of listings in a category.
        """
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
    """
    This viewset handles the following endpoint:

    - GET /watchlist

    GET /watchlist
    --------------

    This endpoint returns a list of listings in the user's watchlist. The
    listings can be filtered by the following query parameters:

    - filter: active, closed, all (default: active)
    - query: search query (default: None)
    - page: page number (default: 1)
    - limit: number of listings per page (default: 8)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        This method handles the GET /watchlist endpoint.

        Returns a list of listings in the user's watchlist.
        """
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
    """
    This viewset handles the following endpoint:

    - POST /ai/generate_description

    POST /ai/generate_description
    -----------------------------

    This endpoint generates a description for a listing title. The following
    fields are required:

    - title: listing title
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        This method handles the POST /ai/generate_description endpoint.

        Generates a description for a listing title.
        """
        # Get the title from the request body
        title = request.data.get("title")
        # Check if all the required fields are provided
        if title is None:
            return Response(
                {"error": "Please provide a title to generate description"},
                status=400,
            )
        # Generate a description using OpenAI's GPT-3 API
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
    """
    This viewset handles the following endpoint:

    - POST /listings/<int:pk>/bids

    POST /listings/<int:pk>/bids
    ----------------------------

    This endpoint creates a new bid on a listing. The following fields are
    required:

    - bid
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        This method handles the POST /listings/<int:pk>/bids endpoint.

        Creates a new bid on a listing.
        """
        listing = Listing.objects.get(id=pk)
        # Check if the listing is closed
        if not listing.active:
            return Response(
                {"error": "You cannot bid on a closed listing"}, status=400
            )
        # Get the bid from the request body
        bid = int(request.data.get("bid"))
        user = request.user
        # Check if all the required fields are provided
        if bid is None:
            return Response(
                {"error": "Please provide all the required fields"},
                status=400,
            )
        # Check if the bid is greater than the current bid
        if listing.bids.all().count() > 0:
            if listing.bids.all().order_by("-bid")[0].bid >= bid:
                return Response(
                    {"error": "Bid must be greater than the current bid"},
                    status=400,
                )
        # Check if the user is authorized to bid on the listing
        if listing.user == user:
            return Response(
                {"error": "You cannot bid on your own listing"}, status=400
            )
        # Create a new bid
        bid = Bid.objects.create(
            bid=bid,
            listing=listing,
            user=user,
        )
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class CloseListingViewSet(APIView):
    """
    This viewset handles the following endpoint:

    - POST /listings/<int:pk>/close

    POST /listings/<int:pk>/close
    -----------------------------

    This endpoint closes a listing.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        This method handles the POST /listings/<int:pk>/close endpoint.

        Closes a listing.
        """
        # Get the listing to be closed
        listing = Listing.objects.get(id=pk)
        user = request.user
        # Check if the user is authorized to close the listing
        if listing.user != user:
            return Response(
                {"error": "You are not authorized to close this listing"},
                status=401,
            )
        # Close the listing
        listing.close_listing()
        serializer = ListingSerializer(listing, context={"request": request})
        return Response(serializer.data)


class MapListingViewSet(APIView):
    """
    This viewset handles the following endpoint:

    - GET /map_listings

    GET /map_listings
    -----------------

    This endpoint returns a list of listings for the map.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        This method handles the GET /map_listings endpoint.

        Returns a list of listings for the map.
        """
        listings = Listing.objects.filter(active=True)
        serializer = ListingMapSerializer(
            listings, many=True, context={"request": request}
        )
        return Response(serializer.data)


class UserListingViewSet(APIView):
    """
    This viewset handles the following endpoint:

    - GET /users/<int:pk>/listings

    GET /users/<int:pk>/listings
    ----------------------------

    This endpoint returns a list of listings for a user. The listings can be
    filtered by the following query parameters:

    - filter: active, closed, all (default: active)
    - query: search query (default: None)
    - page: page number (default: 1)
    - limit: number of listings per page (default: 8)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        This method handles the GET /users/<int:pk>/listings endpoint.

        Returns a list of listings for a user.
        """
        user = User.objects.get(id=pk)
        listings = Listing.objects.filter(user=user)
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
                "user": user.get_display_name(),
            }
        )
