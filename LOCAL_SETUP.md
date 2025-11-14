# Local Development Setup Guide

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Car-Detail-and-Management-System/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file in backend directory:**
   ```bash
   # Create .env file with the following content:
   MONGODB_URI=mongodb://localhost:27017/car-management-system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   PORT=5000
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Start MongoDB:**
   - Install MongoDB locally or use MongoDB Atlas
   - If using local MongoDB, make sure it's running on port 27017

5. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Car-Detail-and-Management-System/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file in frontend directory (optional for local development):**
   ```bash
   # Create .env file with the following content:
   VITE_API_URL=http://localhost:5000
   VITE_CLIENT_URL=http://localhost:3000
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

## Testing the Setup

1. **Backend Health Check:**
   - Open: http://localhost:5000/api/health
   - Should return: `{"success":true,"message":"Car Management System API is running"}`

2. **Frontend:**
   - Open: http://localhost:3000
   - Should load the Car Management System interface

3. **Test Login:**
   - Try to register a new account
   - Try to login with the registered account

## Troubleshooting

### Common Issues:

1. **Backend not starting:**
   - Check if MongoDB is running
   - Check if port 5000 is available
   - Verify .env file exists and has correct values

2. **Frontend can't connect to backend:**
   - Ensure backend is running on port 5000
   - Check browser console for CORS errors
   - Verify API_BASE_URL in frontend config

3. **Database connection issues:**
   - Verify MongoDB URI in .env file
   - Check if MongoDB service is running
   - For MongoDB Atlas, check network access settings

4. **CORS errors:**
   - Ensure CLIENT_URL in backend .env matches frontend URL
   - Check if backend is running and accessible

### Environment Variables Reference:

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/car-management-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
VITE_CLIENT_URL=http://localhost:3000
```
