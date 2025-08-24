import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold hover:text-blue-200 transition-colors duration-200">PhotoBook</Link>
        <div className="flex space-x-6 items-center">
          <Link to="/" className="text-white hover:text-blue-200 transition-colors duration-200">Home</Link>
          <Link to="/profiles" className="text-white hover:text-blue-200 transition-colors duration-200">Browse Profiles</Link>
          {/* Show Add Post only for verified photographers */}
          {user && user.role === 'photographer' && user.verificationStatus === 'approved' && (
          <Link to={`/photographer/${user._id}`} className="text-white hover:text-blue-200 transition-colors duration-200">My Profile & Posts</Link>
          )}
          {user && user.role === 'client' && (
          <Link to="/client/dashboard" className="text-white hover:text-blue-200 transition-colors duration-200">My Dashboard</Link>
          )}
          <div className="flex space-x-4 items-center">
            {user ? (
              <>
                <span className="text-white text-sm">Welcome, {user.name}</span>
                {user.role === 'client' && (
                  <Link to="/profiles" className="text-white hover:text-blue-200 transition-colors duration-200 text-sm">Browse Profiles</Link>
                )}
                {user.role === 'photographer' && (
                  <Link to="/provider/dashboard" className="text-white hover:text-blue-200 transition-colors duration-200 text-sm">Dashboard</Link>
                )}
                <button onClick={handleLogout} className="text-white hover:text-blue-200 transition-colors duration-200 text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-blue-200 transition-colors duration-200 text-sm">Login</Link>
                <Link to="/register" className="text-white hover:text-blue-200 transition-colors duration-200 text-sm">Register</Link>
                <Link to="/admin/login" className="text-white hover:text-blue-200 transition-colors duration-200 text-sm">Admin Login</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;