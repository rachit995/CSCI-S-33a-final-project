# Backend Server

### Overview

The backend is based on Django and Django Rest Framework.

### Structure

The project is structured as follows:

```bash
.
├── README.md
├── auctions
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   ├── utils.py
│   └── views.py
├── bidster
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
├── requirements.txt
└── vercel.json
```


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


