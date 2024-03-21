import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function ProfileManagementScreen() {
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const history = useHistory();

  useEffect(() => {
    // Fetch user info and populate the states
    const fetchUserInfo = async () => {
      try {
        const { data } = await axios.get('http://127.0.0.1:8000/auth/users/me/', {
          headers: {
            // Your auth token needs to be included here for authenticated requests
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setUsername(data.username);
        // Set other fields similarly, based on the data structure you receive
        // You may need to adjust this depending on how your backend sends the user's info
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Implement the update logic. This might involve sending a PUT or PATCH request to your backend.
      // Make sure to include the Authorization header if this endpoint is protected
      await axios.put('http://127.0.0.1:8000/path/to/update/profile', {
        username,
        birthday,
        email,
        password, // Be cautious with updating passwords. Ensure your backend handles it securely.
        address,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      history.push('/profile');
      // Optionally, show a success message to the user
    } catch (error) {
      // Handle errors, e.g., show error message
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <h2>Profile Management</h2>
      <form onSubmit={handleSubmit}>
        {/* Example of a text input for the username */}
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        {/* Add other form fields for birthday, email, etc., similar to the username field */}
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default ProfileManagementScreen;
