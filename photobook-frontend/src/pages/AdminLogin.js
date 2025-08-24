import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    // 🔑 Redirect to login if token is missing
    if (!token) {
      toast.error("You must log in as admin first");
      navigate("/admin-login");
      return;
    }

    axios
      .get('https://booking-backend-1-u8m4.onrender.com/api/admin/profiles/pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfiles(res.data))
      .catch((err) => {
        console.error(err);
        toast.error('Failed to fetch profiles');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleApprove = async (id) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error("No token found, please log in again");
      navigate("/admin-login");
      return;
    }

    try {
      await axios.post(
        `https://booking-backend-1-u8m4.onrender.com/api/admin/profiles/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfiles(profiles.filter((p) => p._id !== id));
      toast.success('Profile approved');
    } catch (err) {
      console.error(err);
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
            <p><strong>Name:</strong> {profile.userId.name}</p>
            <p><strong>Email:</strong> {profile.userId.email}</p>
            <p><strong>Location:</strong> {profile.location}</p>
            <button
              onClick={() => handleApprove(profile._id)}
              className="bg-green-500 text-white p-2 rounded"
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
