import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Profiles from './pages/Profiles';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import PhotographerPost from './pages/PhotographerPost';
import PhotographerProfile from './pages/PhotographerProfile';
import PhotographerDashboard from './pages/PhotographerDashboard';
import ClientDashboard from './pages/ClientDashboard';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/profiles" element={<PrivateRoute role="client"><Profiles /></PrivateRoute>} />
          <Route path="/photographer/post" element={<PhotographerPost />} />
          <Route path="/photographer/:id" element={<PhotographerProfile />} />
          <Route path="/provider/dashboard" element={<PhotographerDashboard />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/admin/dashboard" element={
            localStorage.getItem('adminToken')
              ? <AdminDashboard />
              : <Navigate to="/admin/login" />
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;