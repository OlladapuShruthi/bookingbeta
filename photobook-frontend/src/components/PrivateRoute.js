import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  if (user.role === 'photographer' && user.verificationStatus !== 'approved') {
    toast.error('Verification is pending. Please wait for admin approval.');
    return <Navigate to="/login" />;
  }
  return children;
}

export default PrivateRoute;