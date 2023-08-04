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
import AddEditListing from '../components/AddEditListing.jsx';
import Listings from '../components/Listings.jsx';
import ListingDetail from '../components/ListingDetail.jsx';
import Watchlist from '../components/Watchlist.jsx';
import CategoryItem from '../components/CategoryItem.jsx';
import CategoriesList from '../components/CategoriesList.jsx';
import MapView from '../components/MapView.jsx';

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
      element: <Protected><AddEditListing /></Protected>,
    },
    {
      path: "/listing/:id",
      element: <Protected><ListingDetail /></Protected>,
    },
    {
      path: "/listing/:id/edit",
      element: <Protected><AddEditListing mode="edit" /></Protected>,
    },
    {
      path: "/watchlist",
      element: <Protected><Watchlist /></Protected>,
    },
    {
      path: "/category",
      element: <Protected><CategoriesList /></Protected>,
    },
    {
      path: "/category/:id",
      element: <Protected><CategoryItem /></Protected>,
    },
    {
      path: "/map-view",
      element: <Protected><MapView /></Protected>,
    },
    {
      path: "*",
      element: <ErrorPage />,
    }
  ])
  return element
}
