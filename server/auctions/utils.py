from datetime import datetime, timezone


# Returns the time ago the listing was posted
def get_time_ago(time):
    now = datetime.now(timezone.utc)
    time_elapsed = now - time
    if time_elapsed.days > 0:
        return f"{time_elapsed.days} days ago"
    elif time_elapsed.seconds > 3600:
        return f"{time_elapsed.seconds // 3600} hours ago"
    elif time_elapsed.seconds > 60:
        return f"{time_elapsed.seconds // 60} minutes ago"
    else:
        return f"{time_elapsed.seconds} seconds ago"


# Filters listings based on the filter and query
def filter_objects(request, listings, filter, query):
    if filter == "active":
        listings = listings.filter(active=True)
    elif filter == "closed":
        listings = listings.filter(active=False)
    elif filter == "winner":
        listings = listings.filter(bids__user=request.user, bids__winner=True)
    elif filter == "my":
        listings = listings.filter(user=request.user)
    elif filter == "watchlist":
        listings = listings.filter(watchlists__user=request.user)
    else:
        listings = listings.all()
    if query:
        listings = listings.filter(title__icontains=query)
    return listings
