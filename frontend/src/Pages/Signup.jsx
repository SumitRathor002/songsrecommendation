import React, { useEffect, useState } from "react";
import "../styles/Signup.css"; // Import your CSS file here
// import Navbar from "../components/Navbar";
import axios from "axios";
import { REFRESH_TOKEN,ACCESS_TOKEN, USER ,IsLoggedIn } from "../constants";
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../API";

// import { EMAIL, USERNAME } from "../../constants";
// useEffect

const Signup = () => {
  
  let loggedin = localStorage.getItem(IsLoggedIn)=== "true" ? true : false;
  console.log("Signup", loggedin, Boolean(loggedin));
  const navigate = useNavigate();

  // if(loggedin){
  //   navigate('/', { replace: true });
  // }

  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (loggedin) {
      console.log("signup loggedin")
      navigate('/', { replace: true });
    }
  }, [loggedin, navigate]);


  const toggleRightPanel = () => {
    setIsRightPanelActive((prevState) => !prevState);
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmitSignup = async (e) => {
    e.preventDefault();

    // Validate signup data
    const { username, email, password, confirmPassword } = signupData;
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Make Axios POST request for signup
    try {
      const response = await axios.post(
        API_URL+"/register/",
        signupData
      );
      const { message, refresh, access } = response.data;

      const user = {
        "username" : username,
        "email" : email
      }
      console.log("registered",message, access, refresh);
      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);
      localStorage.setItem(USER, JSON.stringify(user));
      localStorage.setItem(IsLoggedIn, true);
      navigate('/', { replace: true })
    } catch (error) {
      setError("Failed to create account. Please try again.");
    }
  };

  const handleSubmitSignIn = async (e) => {
    e.preventDefault();

    // Validate sign in data
    const { email, password } = signInData;
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Make Axios POST request for sign in
    try {
      const response = await axios.post(
        API_URL+"/login/",
        signInData
      );
      const { username, refresh, access } = response.data;

      const user = {
        "username" : username,
        "email" : email
      }
      // console.log("loggedin", access, refresh);
      console.log("signInData", signInData );
      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);
      localStorage.setItem(USER, JSON.stringify(user));
      localStorage.setItem(IsLoggedIn, true);
      navigate('/', { replace: true })  
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div >

      <div className="signup-div">
        <div
          className={`container ${
            isRightPanelActive ? "right-panel-active" : ""
          }`}
          id="container"
        >
          <div className="form-container sign-up-container">
            <form onSubmit={handleSubmitSignup}>
              <h1>Create Account</h1>
              {error && <p className="error">{error}</p>}
              <div className="infield">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={signupData.name}
                  onChange={handleSignupChange}
                />
                <label></label>
              </div>
              <div className="infield">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                />
                <label></label>
              </div>
              <div className="infield">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                />
                <label></label>
              </div>
              <div className="infield">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                />
                <label></label>
              </div>
              <button>Sign Up</button>
            </form>
          </div>
          <div className="form-container sign-in-container">
            <form onSubmit={handleSubmitSignIn}>
              <h1>Sign in</h1>
              {error && <p className="error">{error} </p>}
              <div className="infield">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={signInData.email}
                  onChange={handleSignInChange}
                />
                <label></label>
              </div>
              <div className="infield">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signInData.password}
                  onChange={handleSignInChange}
                />
                <label></label>
              </div>

              <button>Sign In</button>
            </form>
          </div>
          <div className="overlay-container" id="overlayCon">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Already A User?</h1>
                <p>To access your account please login with your credentials</p>
                <button>Sign In</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>New Here?</h1>
                <p>Create an account and start the journey!!!</p>
                <button>Sign Up</button>
              </div>
            </div>
            <button id="overlayBtn" onClick={toggleRightPanel}></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
