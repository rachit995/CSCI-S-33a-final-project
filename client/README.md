# Frontend Client

### Overview

The frontend is based on react and tailwind.

### Structure

The project is structured as follows:

```bash
.
├── README.md
├── index.html
├── package.json
├── postcss.config.js
├── public
│   └── vite.svg
├── src
│   ├── App.jsx
│   ├── assets
│   │   └── default-avatar.png
│   ├── components
│   │   ├── AddEditListing.jsx
│   │   ├── CategoriesList.jsx
│   │   ├── CategoryItem.jsx
│   │   ├── ErrorPage.jsx
│   │   ├── Layout.jsx
│   │   ├── ListingDetail.jsx
│   │   ├── ListingList.jsx
│   │   ├── Listings.jsx
│   │   ├── Login.jsx
│   │   ├── Logo.jsx
│   │   ├── MapView.jsx
│   │   ├── Register.jsx
│   │   ├── UserListingList.jsx
│   │   ├── Watchlist.jsx
│   │   └── html
│   │       ├── Alert.jsx
│   │       └── Input.jsx
│   ├── index.css
│   ├── main.jsx
│   └── utils
│       ├── actions.js
│       ├── api.js
│       ├── helper.js
│       └── routes.jsx
├── tailwind.config.js
├── vite.config.js
├── yarn-error.log
└── yarn.lock
```

### How to run

#### Prerequisites:

1. To run this project, you will need to clone or download this repository.

2. Install the required packages in the package.json file:
  ```bash
  npm install
  ```
  or
  ```bash
  yarn install
  ```
#### Run frontend:

To start the frontend, run the following command:

```bash
npm dev
```
or
```bash
yarn dev
```

Once the server is running, visit http://localhost:5173/ in your web browser to view the site.


