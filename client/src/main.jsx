import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { Routes } from './utils/routes.jsx';
import Layout from './components/Layout';



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Layout>
        <Routes />
      </Layout>
    </Router>
  </React.StrictMode>,
)
