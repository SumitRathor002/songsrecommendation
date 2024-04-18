import React from "react";
import Navbar from "../components/Navbar";
import  "../styles/About.css"
import Guy from "../assets/guy.png"
function About() {
  return (
    <div className="about-main">
      <Navbar></Navbar>
      <div className="content">
        <div className="some-text">
          <div className="tagline">
            <span> DISCOVER YOUR PERFECT </span>
          </div>
          <span className="track">TRACK</span>
          <span className="logo">📀</span>
          <div className="title">
            <p>
              Song Recommendation App <br /> by Sumit Rathor
            </p>
          </div>
        </div>
        <div className="artwork">
          <div className="guy-image">
            <img src={Guy} alt="" />
          </div>
        </div>
      </div>
      <div className="small-ellipse"></div>
      <div className="ellipse"></div>
      <div className="smallest-ellipse"></div>
    </div>
  );
}

export default About;
