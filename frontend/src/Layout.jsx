import React from "react";
import Navbar from "./components/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Sidebar from "./components/Sidebar";
import "./styles/Layout.css";

export default function Layout() {
  const location = useLocation();
  const isAboutPage = location.pathname === "/about";
  const isSignupPage = location.pathname === "/signup";
  const isHomePage = !isAboutPage && !isSignupPage;
  const layoutClassName = isSignupPage ? "" : "layout";
  return (
    <div className="layout-main">
      {!isAboutPage && <Navbar />}
        <div className={` ${layoutClassName}`}>
        {isHomePage && <Sidebar />}
        <Outlet />
      </div>
      </div>
      
  );
}
