import App from '../App.jsx'
import {
  createBrowserRouter,
  Navigate,
  useRoutes,
} from "react-router-dom";
import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';
import ErrorPage from '../components/ErrorPage.jsx';
import { isAuthenticated } from './helper.js';
import CreateListing from '../components/CreateListing.jsx';
import Listings from '../components/Listings.jsx';
import ListingItem from '../components/ListingItem.jsx';

function Protected({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}


export function Routes() {
  const element = useRoutes([
    {
      path: "/",
      element: <Protected><Listings /></Protected>,
      errorElement: <ErrorPage />
    },
    {
      path: "/listing",
      element: <Protected><Listings /></Protected>,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/create-listing",
      element: <Protected><CreateListing /></Protected>,
    },
    {
      path: "/listing/:id",
      element: <Protected><ListingItem /></Protected>,
    },
    {
      path: "/watchlist",
      element: <Protected><Listings /></Protected>,
    },
    {
      path: "/category",
      element: <Protected><Listings /></Protected>,
    },
    {
      path: "/category/:id",
      element: <Protected><Listings /></Protected>,
    },
    {
      path: "/map-view",
      element: <Protected><Listings /></Protected>,
    },
    {
      path: "*",
      element: <ErrorPage />,
    }
  ])
  return element
}
