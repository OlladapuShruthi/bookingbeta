import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function Profiles() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/profiles`).then((res) => setProfiles(res.data));
  }, []);

  return (
    <div>
      <h1>Browse Verified Photographers</h1>
      {profiles.map(profile => (
        <div key={profile._id}>
          <p>Name: {profile.userId.name}</p>
          <p>Email: {profile.userId.email}</p>
          <Link to={`/photographer/${profile.userId._id}`}>View Profile & Posts</Link>
        </div>
      ))}
    </div>
  );
}

export default Profiles;