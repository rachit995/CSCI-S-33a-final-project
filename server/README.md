# CSCI-S-33a Backend Final Project

## Final Project: Bidster - Auction like a pro

### Overview

Design an eBay-like e-commerce auction site that will allow users to post auction listings, place bids on listings, comment on those listings, and add listings to a watchlist and list the listing on a map.

### How to run

#### Prerequisites:

1. To run this project, you will need to clone or download this repository.

2. Install the required packages in the `requirements.txt` file:
  ```bash
  pip install -r requirements.txt
  ```
3. Do the migrations for the database:
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```
4. Load the dump json file into the database:
  ```bash
  python manage.py loaddata seed/dump.json
  ```

#### Run server:

To start the server, run the following command:

```bash
python manage.py runserver
```


