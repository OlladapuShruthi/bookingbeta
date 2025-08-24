import { useEffect, useState } from 'react';
import axios from 'axios';

function PhotographerDashboard() {
  const [agreements, setAgreements] = useState([]);
  const [contactDetails, setContactDetails] = useState('');

  useEffect(() => {
    axios.get('https://booking-backend-1-u8m4.onrender.com/api/agreements/photographer', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setAgreements(res.data));
  }, []);

  const handleAccept = async (id) => {
    await axios.post(`https://booking-backend-1-u8m4.onrender.com/api/agreements/${id}/accept`, { contactDetails }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setAgreements(agreements.filter(a => a._id !== id));
  };

  const handleReject = async (id) => {
    await axios.post(`https://booking-backend-1-u8m4.onrender.com/api/agreements/${id}/reject`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setAgreements(agreements.filter(a => a._id !== id));
  };
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
                axios.post(`https://booking-backend-1-u8m4.onrender.com/api/agreements/${a._id}/contract`, {
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
                  axios.post(`https://booking-backend-1-u8m4.onrender.com/api/agreements/${a._id}/contract`, {
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
                axios.post(`https://booking-backend-1-u8m4.onrender.com/api/agreements/${a._id}/payment`, {
                  paymentDone: e.target.checked
                }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                .then(() => window.location.reload());
              }}
            />
          </label>
        </div>
        {a.review && (
          <div>
            <strong>Client Review:</strong> {a.review}
          </div>
        )}
      </>
    )}
  </div>
))}
// ...existing code...

  return (
    <div>
      <h2>Pending Agreements</h2>
      {agreements.length === 0 ? <p>No pending agreements.</p> : agreements.map(a => (
        <div key={a._id} className="border p-4 mb-2">
          <p>Client: {a.clientId.name} ({a.clientId.email})</p>
          <p>Note: {a.note}</p>
          <input
            type="text"
            placeholder="Your contact details"
            value={contactDetails}
            onChange={e => setContactDetails(e.target.value)}
          />
          <button onClick={() => handleAccept(a._id)}>Accept</button>
          <button onClick={() => handleReject(a._id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}

export default PhotographerDashboard;