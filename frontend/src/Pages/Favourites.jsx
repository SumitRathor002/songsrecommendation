import React, { useEffect, useState } from 'react';
import { fetchFavourites, handleScroll } from '../utils';
import "../styles/Favourites.css";
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import "../styles/Favourites.css"


function Favourites() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [favourites, setfavourites] = useState([]);

  useEffect(() => {
    fetchFavourites(setfavourites, page, setTotalPages);
  }, [page, setTotalPages]);

  useEffect(() => {
    const scrollContainer = document.getElementById("favourites");
    const handleScrollWithArg = () => {
      handleScroll("favourites", setPage, totalPages); 
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
    <div className="favourites" id="favourites">
      {favourites.map((obj) => (
        <Link to={`/song-detail/${obj.song.spotify_id}`} key={obj.song.spotify_id}>
          <Card
            key={obj.song.spotify_id}
            SongName={obj.song.name}
            ArtistName={
              obj.song.artists.length > 0 ? obj.song.artists[0] : "Unknown Artist"
            }
            Duration={obj.song.duration}
            imgUrl={obj.song.image_url_300}
          />
        </Link>
      ))}
    </div>
  )
}

export default Favourites