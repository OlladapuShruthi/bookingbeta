import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Profiles() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    axios.get('https://booking-backend-1-u8m4.onrender.com/api/profiles').then((res) => setProfiles(res.data));
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