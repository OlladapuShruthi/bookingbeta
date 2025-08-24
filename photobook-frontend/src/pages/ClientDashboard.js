import { useEffect, useState } from 'react';
import axios from 'axios';

function ClientDashboard() {
  const [agreements, setAgreements] = useState([]);

  useEffect(() => {
    axios.get('https://booking-backend-1-u8m4.onrender.com/api/agreements/client', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setAgreements(res.data));
  }, []);
  // ...existing code...
{agreements.map(a => (
  <div key={a._id} className="border p-4 mb-2">
    {/* ...existing info... */}
    {a.status === 'accepted' && (
      <>
        <div>
          <label>
            Is contract agreement done?
            <input
              type="checkbox"
              checked={a.contractDone || false}
              onChange={e => {
                axios.post(`http://localhost:5000/api/agreements/${a._id}/contract`, {
                  contractDone: e.target.checked,
                  contractDuration: a.contractDuration || ''
                }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                .then(() => window.location.reload());
              }}
            />
          </label>
        </div>
        {a.contractDone && (
          <div>
            <label>
              Duration (days/months):
              <input
                type="text"
                value={a.contractDuration || ''}
                onChange={e => {
                  axios.post(`http://localhost:5000/api/agreements/${a._id}/contract`, {
                    contractDone: true,
                    contractDuration: e.target.value
                  }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                  .then(() => window.location.reload());
                }}
              />
            </label>
          </div>
        )}
        <div>
          <label>
            Is payment done?
            <input
              type="checkbox"
              checked={a.paymentDone || false}
              onChange={e => {
                axios.post(`http://localhost:5000/api/agreements/${a._id}/payment`, {
                  paymentDone: e.target.checked
                }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                .then(() => window.location.reload());
              }}
            />
          </label>
        </div>
        {!a.review && a.paymentDone && (
          <div>
            <label>
              Leave a review for the photographer:
              <input
                type="text"
                onBlur={e => {
                  axios.post(`http://localhost:5000/api/agreements/${a._id}/review`, {
                    review: e.target.value
                  }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                  .then(() => window.location.reload());
                }}
              />
            </label>
          </div>
        )}
        {a.review && (
          <div>
            <strong>Your Review:</strong> {a.review}
          </div>
        )}
      </>
    )}
    {a.status === 'rejected' && (
      <p style={{ color: 'red' }}>Rejected by photographer</p>
    )}
    {a.status === 'pending' && (
      <p style={{ color: 'orange' }}>Pending photographer response</p>
    )}
  </div>
))}
// ...existing code...

  return (
    <div>
      <h2>My Agreements</h2>
      {agreements.length === 0 ? (
        <p>No agreements yet.</p>
      ) : (
        agreements.map(a => (
          <div key={a._id} className="border p-4 mb-2">
            <p>Photographer: {a.photographerId.name} ({a.photographerId.email})</p>
            <p>Note: {a.note}</p>
            {a.status === 'accepted' && (
              <p>Contact Details: {a.contactDetails}</p>
            )}
            {a.status === 'rejected' && (
              <p style={{ color: 'red' }}>Rejected by photographer</p>
            )}
            {a.status === 'pending' && (
              <p style={{ color: 'orange' }}>Pending photographer response</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ClientDashboard;