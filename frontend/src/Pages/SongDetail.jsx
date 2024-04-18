import  {  useEffect, useState } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import "../styles/songDetail.css";
import music from "../assets/musicplace.png";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import {
  combineNames,
  fetchSongDetails,
  fetchSimilarSongs,
  formatDuration,
  handleScroll,
  formatName,
  LikeSong,
  UnLikeSong,
  checkLoggedIn,
  addHistory,
} from "../utils";

function SongDetail() {
  const { songid } = useParams();
  const [songDetail, setSongDetail] = useState(null);
  const [similarSongs, setSimilarSongs] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [page, setPage] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [prevSongid, setPrevSongid] = useState(null);
  const isloggedin = checkLoggedIn()
  const navigate = useNavigate();
 
 
  const handleLikeToggle = () => {
    if(isloggedin){
      if (isLiked) {
        UnLikeSong(songid, setIsLiked);
      } else {
        LikeSong(songid, setIsLiked);
      }
    }else{
      navigate('/signup', { replace: true })
    }
  };

  useEffect(() => {
    fetchSongDetails(songid, setSongDetail, setIsLiked);
    if(isloggedin){
      addHistory(songid);
    }
  }, [songid, setSongDetail, setIsLiked, isloggedin]);

  useEffect(() => {
    if (songid) {
      // Check if the songid has changed since the last render
      if (prevSongid !== songid) {
        // If it has, reset the similarSongs state to an empty array
        setSimilarSongs([]);
      }
      fetchSimilarSongs(songid, page, setSimilarSongs, setTotalPages);
      setPrevSongid(songid);
    }
  }, [page, songid, prevSongid]);

  useEffect(() => {
    const scrollContainer = document.getElementById("song-detail-page");
    const handleScrollWithArg = () => {
      handleScroll("song-detail-page", setPage, totalPages);
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
    <>
      {songDetail && (
        <div className="song-detail-page" id="song-detail-page">
          <div className="song-detail">
            <h3>Song Details</h3>
            <div>
              <div className="song-card">
                <img
                  src={
                    songDetail.image_url_300 ? songDetail.image_url_300 : music
                  }
                  alt={songDetail.name}
                  className="song-image"
                />
                <div className="song-info">
                  <h2>{formatName(songDetail.name, 50)}</h2>
                  <span className="artist-details">
                    {formatName(combineNames(songDetail.artists), 150)}
                  </span>
                  &nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;
                  <span>{formatDuration(songDetail.duration)}</span>
                  &nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;
                  <span>{songDetail.release_year}</span>
                  <p className="preview">
                    {songDetail.preview_url
                      ? ""
                      : "Preview not available"}
                  </p>
                  <audio controls key={songDetail.spotify_id}>
                    <source src={songDetail.preview_url} type="audio/mpeg" />
                  </audio>
                  <div className="genres">
                    <p>
                      {formatName(songDetail.genres
                        .map((genre) => `#${genre.split(" ").join("")}`)
                        .join(" "), 30)}
                    </p>
                  </div>
                </div>
                <div className="song-icons">
                  <i className={`${isLiked? 'ph-fill' : 'ph'} ph-heart`} id="like-icon" onClick={handleLikeToggle}></i>
                </div>
              </div>
            </div>
            {/* <SongCard song={songDetail} /> */}
          
          <div className="similar-songs">
            <h3>Similar Songs to {songDetail.name}</h3>
            <div className="similar-song-container">
              {similarSongs.map((song) => (
                <Link
                  to={`/song-detail/${song.spotify_id}`}
                  key={song.spotify_id}
                >
                  <Card
                    key={song.spotify_id}
                    SongName={song.name}
                    ArtistName={
                      song.artists.length > 0
                        ? song.artists[0]
                        : "Unknown Artist"
                    }
                    Duration={song.duration}
                    imgUrl={song.image_url_300}
                  />
                </Link>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SongDetail;
