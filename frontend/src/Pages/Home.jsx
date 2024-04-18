import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import Card from "../components/Card";
import { Link } from "react-router-dom";
import { handleScroll,  fetchHomePage } from "../utils";

function Home() {
 
  const [songs, setSongs] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [page, setPage] = useState(1);

  
  useEffect(() => {
    fetchHomePage(setSongs, page, setTotalPages);
  }, [page]); 

  useEffect(() => {
    const scrollContainer = document.getElementById("home");
    const handleScrollWithArg = () => {
      handleScroll("home", setPage, totalPages); 
  };
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScrollWithArg);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScrollWithArg);
      }
    };

  }, [totalPages]);

  return (
    
    <div className="home" id="home">
      {songs.map((song) => (
        <Link to={`/song-detail/${song.spotify_id}`} key={song.spotify_id}>
          <Card
            key={song.spotify_id}
            SongName={song.name}
            ArtistName={
              song.artists.length > 0 ? song.artists[0] : "Unknown Artist"
            }
            Duration={song.duration}
            imgUrl={song.image_url_300}
          />
        </Link>
      ))}
    </div>
    
  );
}

export default Home;
