import { ACCESS_TOKEN, IsLoggedIn, REFRESH_TOKEN } from "./constants";
import API from "./API";
import { API_URL } from "./API";


export const combineNames = (artists) => {
  return artists.map((obj) => obj.name).join(", ");
};

export const formatDuration = (durationInMs) => {
  const totalSeconds = Math.floor(durationInMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const handleScroll = (Scrollableid, setPage, totalPages) => {
  console.log("scroll", totalPages);
  try {
    const scrollContainer = document.getElementById(Scrollableid);
    if (!scrollContainer) return;

    const { clientHeight, scrollTop, scrollHeight } = scrollContainer;

    if (clientHeight + scrollTop + 5 >= scrollHeight) {
      setPage((prevPage) =>
        prevPage + 1 < totalPages ? prevPage + 1 : prevPage
      );
    }
  } catch (error) {
    console.log(error);
  }
};

export const formatName = (name, length) => {
  return name && name.length > length ? `${name.slice(0, length)}...` : name;
};

export const checkLoggedIn = () => {
  return localStorage.getItem(IsLoggedIn) === "true" ? true : false;
};

export const fetchHomePage = async (setSongs, page, setTotalPages) => {
  // console.log("fetchHomepage", page)
  const randomSongsApi = API_URL + "/guest/random-songs/";
  try {
    //for logged in fetch recommended songs according to his user vector;
    if (checkLoggedIn()) {
      const response = await API.get(`/u/recommended-songs/?page=${page}`);
      setTotalPages(response.data.total_pages);
      setSongs((prevSongs) => [...prevSongs, ...response.data.data]);
    } else {
      //fetch random songs for guest user
      const response = await fetch(`${randomSongsApi}?page=${page}`);
      const data = await response.json();
      setTotalPages(data.total_pages);
      setSongs((prevSongs) => [...prevSongs, ...data.results]);
    }
  } catch (error) {
    console.error("Error fetching data for home page:", error);
    alert("Error something went wrong");
  }
};

export const fetchSongDetails = async (songid, setSongDetail, setIsLiked) => {
  const songDetailApi = API_URL + `/song/${songid}/`;
  try {
    if (checkLoggedIn()) {
      const data = await API.get(songDetailApi);
      // console.log("data",data.data,data.data.liked, typeof data.data.liked);
      setSongDetail(data.data);
      setIsLiked(data.data.liked);
    } else {
      const response = await fetch(songDetailApi);
      const data = await response.json();
      setSongDetail(data);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error something went wrong");
  }
};

export const fetchSimilarSongs = async (songid, page, setSimilarSongs, setTotalPages) => {
  const SimilarSongsApi = API_URL + `/get-similar-songs/${songid}`;
  try {
    const response = await fetch(`${SimilarSongsApi}?page=${page}`);
    const data = await response.json();
    console.log(data);
    setSimilarSongs((prevSongs) => [...prevSongs, ...data.data]);
    setTotalPages(data.total_pages);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error: something went wrong while fetching Similar Songs");
  }
};

export const fetchFavourites = async (setFavourites, page, setTotalPages) => {
  try {
    const data = await API.get(`/u/favourites/?page=${page}`);
    console.log(data.data.total_pages);
    setTotalPages(data.data.total_pages);
    setFavourites((prevSongs) => [...prevSongs, ...data.data.results]);
  } catch (error) {
    console.error("Error fetching data for Favourites:", error);
    alert("Error something went wrong");
  }
};

export const LikeSong = async (songid, setIsLiked) => {
  try {
    const data = await API.post("/u/like/", { song: songid });
    if (data.data.id) {
      setIsLiked(true);
      const heartIcon = document.getElementById("like-icon");
      if (heartIcon.classList.contains("ph")) {
        heartIcon.classList.replace("ph", "ph-fill");
      }
    }
  } catch (error) {
    console.error("Error liking a song:", error);
    alert("Error something went wrong");
  }
};

export const UnLikeSong = async (songid, setIsLiked) => {
  console.log(songid)
  try {
    const data = await API.delete("u/unlike/", { data: { song: songid } });
    console.log(data);
      setIsLiked(false);
      const heartIcon = document.getElementById("like-icon");
      if (heartIcon.classList.contains("ph")) {
        heartIcon.classList.replace("ph", "ph-fill");
      }
  
  } catch (error) {
    console.error("Error unliking a song:", error);
    alert("Error something went wrong");
  }
};

export const addHistory = async (songid) =>{
  try {
    const data = await API.post("/u/listening-history/add/", { song: songid });
    console.log("added to history", data);
  } catch (error) {
    console.error("Error liking a song:", error);
    alert("Error something went wrong");
  }
}

export const fetchHistory = async (setHistoryPage, page, setTotalPages) => {
  try {
    const data = await API.get(`/u/listening-history/?page=${page}`);
    console.log(data.data.total_pages);
    setTotalPages(data.data.total_pages);
    setHistoryPage((prevSongs) => [...prevSongs, ...data.data.results]);
  } catch (error) {
    console.error("Error fetching data for Favourites:", error);
    alert("Error something went wrong");
  }
}

export const handleLogout = async () =>{
  
  let refreshToken = localStorage.getItem(REFRESH_TOKEN);
  try {
    if(refreshToken){
    const data = await API.post("/logout/", { refresh: refreshToken });
    console.log(data);
    localStorage.clear();
    console.log("localStorage cleared", checkLoggedIn());
    }else{
      localStorage.clear();
    }
  } catch (error) {
    console.error("Error liking a song:", error);
    alert("Error something went wrong");
  }
}

