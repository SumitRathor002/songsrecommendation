import React from 'react';
import '../styles/Navbar.css';
import { NavLink } from 'react-router-dom';
import { IsLoggedIn } from '../constants';
const Navbar = () => {
  console.log("Navbarls",localStorage.getItem(IsLoggedIn));
  let loggedin = localStorage.getItem(IsLoggedIn)=== "true" ? true : false;
  console.log("Navbar", loggedin, Boolean(loggedin));

  return (
    <div className="nav">
      <h1 className="heading">📀Groove</h1>
      <div className="navlinks">
        <NavLink to="/" >Home</NavLink>
        <NavLink to="/about" id='about' >About</NavLink>
        {!loggedin && (
        <NavLink to="/signup" className='btn'>Signup</NavLink>
        )}
        {loggedin && (
        <NavLink to="/logout" className='btn'>Logout</NavLink>
        )}
        {/* <a id="about" href="./about.html">About</a>
        <a className="btn" href="./signin.html">Sign Up</a> */}
      </div>
    </div>
  );
};

export default Navbar;