import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function PhotographerProfile() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [photographer, setPhotographer] = useState(null);
  const [note, setNote] = useState('');
  const [agreementSent, setAgreementSent] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch photographer info
    axios.get(`https://booking-backend-1-u8m4.onrender.com/api/profiles`)
      .then(res => {
        const profile = res.data.find(p => p.userId._id === id);
        if (profile) setPhotographer(profile.userId);
      });

    // Fetch posts by photographer
    axios.get(`https://booking-backend-1-u8m4.onrender.com/api/posts/${id}`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));
  }, [id]);

  useEffect(() => {
    // Fetch reviews for this photographer
    axios.get(`https://booking-backend-1-u8m4.onrender.com/api/agreements/photographer`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      const filteredReviews = res.data
        .filter(a => a.photographerId._id === id && a.review)
        .map(a => a.review);
      setReviews(filteredReviews);
    });
  }, [id]);

  const handleAgreement = async () => {
    try {
      await axios.post('https://booking-backend-1-u8m4.onrender.com/api/agreements', {
        photographerId: id,
        note,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAgreementSent(true);
    } catch (err) {
      alert('Failed to send agreement');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl mb-4">Photographer Profile</h2>
      {photographer && (
        <div className="mb-6">
          <p><strong>Name:</strong> {photographer.name}</p>
          <p><strong>Email:</strong> {photographer.email}</p>
        </div>
      )}
      <h3 className="text-lg mb-2">Posts</h3>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div key={post._id} className="border p-4 mb-4">
            <img src={`https://booking-backend-1-u8m4.onrender.com/${post.image}`} alt={post.title} width={200} />
            <h4 className="font-bold mt-2">{post.title}</h4>
            <p>{post.description}</p>
          </div>
        ))
      )}
      <div className="mt-6">
        <h3>Send Agreement Request</h3>
        <textarea
          placeholder="Write your note for the photographer..."
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full p-2 border mb-2"
        />
        <button
          onClick={handleAgreement}
          className="bg-green-500 text-white p-2"
          disabled={agreementSent}
        >
          {agreementSent ? 'Agreement Sent' : 'Send Agreement'}
        </button>
      </div>
      {reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg mb-2">Client Reviews</h3>
          {reviews.map((r, idx) => (
            <div key={idx} className="border p-2 mb-2">{r}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotographerProfile;