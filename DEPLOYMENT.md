# PhotoBook Deployment Guide

## Environment Variables Setup

### Backend (.env file in photobook-backend)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend (.env file in photobook-frontend)
```
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

## Deployment Steps

### 1. Backend Deployment on Render
1. Create a new Web Service on Render
2. Connect your repository
3. Set the root directory to `photobook-backend`
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables in Render dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: 5000 (or leave empty, Render will set it)

### 2. Frontend Deployment on Render
1. Create a new Static Site on Render
2. Connect your repository
3. Set the root directory to `photobook-frontend`
4. Set build command: `npm install && npm run build`
5. Set publish directory: `build`
6. Add environment variable:
   - `REACT_APP_BACKEND_URL`: Your backend URL from step 1

### 3. CORS Configuration
The backend is configured to accept requests from any origin for maximum flexibility. No additional CORS configuration needed.

## Local Development
1. Backend: Set `REACT_APP_BACKEND_URL=http://localhost:5000` in frontend/.env
2. Frontend: The backend accepts requests from any origin including localhost:3000

## Default Admin Credentials
- Email: admin@example.com
- Password: admin123

## Features
- User registration and authentication
- Role-based access (Client, Photographer, Admin)
- File upload for portfolios and posts
- Agreement/booking system
- Review system
- Admin approval workflow
