import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto p-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-blue-600">PhotoBook</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover and book talented photographers for your special events. 
            From weddings to corporate events, find the perfect match for your photography needs.
          </p>
          <Link 
            to="/profiles" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg inline-block"
          >
            Browse Photographer Profiles
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">📸</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Professional Photographers</h3>
            <p className="text-gray-600">Connect with verified professional photographers</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">Simple and secure booking process</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">⭐</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quality Assurance</h3>
            <p className="text-gray-600">Only verified and reviewed professionals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;