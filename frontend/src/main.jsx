import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Layout from './Layout.jsx'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import History from './Pages/History.jsx'
import Favourites from './Pages/Favourites.jsx'
import Signup from './Pages/Signup.jsx'
import About from './Pages/About.jsx'
import Logout from './components/Logout.jsx'
import SongDetail from './Pages/SongDetail.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path='' element={<Home />} />
      <Route path="history" element={<History />} />
          <Route path="favourites" element={<Favourites />} />
          <Route path="song-detail/:songid" element={<SongDetail />} />
          <Route path="about" element={<About />} />
          <Route path="signup" element={<Signup />} />
          <Route path="logout" element={<Logout />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <RouterProvider router={router} />
  // </React.StrictMode>,
)