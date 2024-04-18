import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import { USER, IsLoggedIn } from "../constants";
import { checkLoggedIn, formatName } from "../utils";

const Sidebar = () => {
  let loggedin = checkLoggedIn();
  let userString = localStorage.getItem(USER);
  let user = JSON.parse(userString);
  console.log(user, typeof user);
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        <div className="menu">
          <ul>
            <li className={location.pathname === "/"?"active":""}>
              <NavLink to="/">
                <i className="ph-bold ph-house"></i>
                <span className="text">Home</span>
              </NavLink>
            </li>
            <li className={location.pathname === "/history"?"active":""}>
              <NavLink to={loggedin? "/history" : "/signup"}>
                <i className="ph-bold ph-clock-counter-clockwise"></i>
                <span className="text">History</span>
              </NavLink>
            </li>
            <li className={location.pathname === "/favourites"?"active":""}>
              <NavLink to={loggedin? "/favourites" : "/signup"} >
                <i className="ph-bold ph-heart"></i>
                <span className="text">Favourites</span>
              </NavLink>
            </li>
            
          </ul>
        </div>
      </div>
      {loggedin && (
      <div className="user-div">
        <div className="user-img">
          <i className="ph ph-user"></i>
        </div>
            <div className="user-details">
            <p className="name">{formatName(user?.username, 20)}</p>
            <p className="user-email">{formatName(user?.email, 30)}</p>
          </div>
      </div>
        )}
    </div>
  );
};

export default Sidebar;
