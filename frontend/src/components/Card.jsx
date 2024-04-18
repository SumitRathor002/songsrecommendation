import React from "react";
import "../styles/Card.css";
import music from "../assets/musicplace.png"
import { formatName, formatDuration,  } from "../utils";

export default function Card({SongName, ArtistName, Duration, imgUrl}) {

  return (
    <div className="card-container">
      <div className="card-outer-div">
        <figure className="card-inner-div">
          <img
            src={imgUrl ? imgUrl : music}
            alt="track_image"
            width="210"
            height="210"
          />
          <div className="card-contents">
            <blockquote>
              <p>{formatName(SongName,15)}</p>
            </blockquote>
            <figcaption>
              <div className="artist-name">{formatName(ArtistName, 15)}</div>
              <div className="duration">{formatDuration(Duration)}</div>
            </figcaption>
          </div>
        </figure>
      </div>
    </div>
  );
}
