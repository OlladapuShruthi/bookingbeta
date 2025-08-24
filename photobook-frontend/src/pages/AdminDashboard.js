import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/admin/profiles/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      })
      .then((res) => setProfiles(res.data))
      .catch((err) => toast.error('Failed to fetch profiles'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/profiles/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        }
      );
      setProfiles(profiles.filter((p) => p._id !== id));
      toast.success('Profile approved');
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <h2>Pending Photographer Profiles</h2>
      {profiles.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        profiles.map((profile) => (
          <div key={profile._id} className="border p-4 mb-2">
            <p>Name: {profile.userId.name}</p>
            <p>Email: {profile.userId.email}</p>
            <p>Location: {profile.location}</p>
            <button
              onClick={() => handleApprove(profile._id)}
              className="bg-green-500 text-white p-2"
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;