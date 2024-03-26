import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { logout } from '../actions/userActions'; // Update path accordingly

const SessionCheck = () => {
  // const dispatch = useDispatch();
  // const history = useHistory();

  // // Replace 'userLogin' with your actual user state slice name
  // const { userInfo } = useSelector(state => state.userLogin);

  // useEffect(() => {
  //   // Function to check session validity
  //   const checkSession = () => {
  //     // If userInfo is null or undefined, consider the session invalid
  //     if (!userInfo) {
  //       alert('Your session has expired. Please log in again.');
  //       dispatch(logout()); // Ensure the logout action clears the userInfo and any other relevant states
  //       history.push('/login'); // Redirect to login page
  //     }
  //   };

  //   checkSession();
  //   // Optionally, set an interval to check session periodically
  //   // const interval = setInterval(checkSession, 10000); // Check every 10 seconds

  //   // Clean up interval on component unmount
  //   // return () => clearInterval(interval);
  // }, [dispatch, history, userInfo]);

  return null; // This component does not render anything
};

export default SessionCheck;
