import React, { useEffect } from 'react';
import { handleLogout } from '../utils';
import { useNavigate } from "react-router-dom";

// import { ACCESS_TOKEN, REFRESH_TOKEN, USER, IsLoggedIn } from '../constants';
const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      await handleLogout();
      navigate('/signup', { replace: true });
    };
    logout();
  }, [navigate]);

  return null;
};
export default Logout;
