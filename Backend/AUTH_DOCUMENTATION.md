# Authentication API Documentation

## Overview
This backend provides a complete authentication system with JWT token-based authentication, supporting user registration (signup), login, profile management, and protected routes.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install the new packages:
- `bcryptjs` - For password hashing
- `jsonwebtoken` - For JWT token generation and verification

### 2. Environment Variables
Create a `.env` file in the backend folder with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=aisi_db
JWT_SECRET=your-super-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
```

**Important:** 
- Change `JWT_SECRET` to a strong random string in production
- The `JWT_SECRET` is used to sign and verify JWT tokens

### 3. Start the Server
```bash
npm run dev
```

The server will automatically create the `users` collection in MongoDB with a unique index on the email field.

---

## API Endpoints

### Authentication Routes Base: `/api/auth`

#### 1. **Signup (Register New User)**
- **Method:** `POST`
- **Endpoint:** `/api/auth/signup`
- **Requires Auth:** No
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "confirmPassword": "securePassword123"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "userId": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "User already exists with this email"
  }
  ```

---

#### 2. **Login**
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Requires Auth:** No
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "userId": "507f1f77bcf86cd799439011",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "user"
      }
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

#### 3. **Get User Profile** (Protected)
- **Method:** `GET`
- **Endpoint:** `/api/auth/profile`
- **Requires Auth:** Yes (Bearer Token)
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2024-03-14T10:00:00.000Z",
      "updatedAt": "2024-03-14T10:00:00.000Z"
    }
  }
  ```

---

#### 4. **Update User Profile** (Protected)
- **Method:** `PUT`
- **Endpoint:** `/api/auth/profile`
- **Requires Auth:** Yes (Bearer Token)
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Body:**
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Updated",
      "email": "john.updated@example.com",
      "role": "user",
      "status": "active",
      "updatedAt": "2024-03-14T11:00:00.000Z"
    }
  }
  ```

---

#### 5. **Verify Token**
- **Method:** `POST`
- **Endpoint:** `/api/auth/verify-token`
- **Requires Auth:** No (token in header)
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response (Valid Token):**
  ```json
  {
    "success": true,
    "message": "Token is valid",
    "data": {
      "userId": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "iat": 1710418800,
      "exp": 1710505200
    }
  }
  ```
- **Response (Invalid Token):**
  ```json
  {
    "success": false,
    "message": "Invalid or expired token"
  }
  ```

---

#### 6. **Logout** (Protected)
- **Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Requires Auth:** Yes (Bearer Token)
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## Using Authentication in Protected Routes

### How Token-Based Authentication Works

1. **User logs in** and receives a JWT token
2. **Token is stored** on the client (localStorage, sessionStorage, or secure cookie)
3. **Token is sent** with every request to protected endpoints in the Authorization header
4. **Server verifies** the token and processes the request if it's valid

### Adding Authentication to Your Existing Routes

To protect any of your other routes (audio, transcription, ai, dashboard), use the `authMiddleware`:

```javascript
import { authMiddleware } from "../../middlewares/auth.middleware.js";

router.get("/protected-route", authMiddleware, yourController);
```

Example:
```javascript
// Make audio routes protected
router.post("/upload", authMiddleware, upload.single("audio"), uploadAudio);
router.get("/:callId", authMiddleware, getAudioByCallId);
```

---

## Frontend Integration

### Login Example (JavaScript/React)
```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;

// Store token
localStorage.setItem('authToken', token);

// Use token in subsequent requests
const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Protected API Call Example
```javascript
const authToken = localStorage.getItem('authToken');

const uploadResponse = await fetch('http://localhost:5000/api/audio/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}` // Add token here
  },
  body: formData
});
```

---

## Error Codes and Messages

| Status Code | Message | Meaning |
|------------|---------|---------|
| 201 | User registered successfully | Signup successful |
| 200 | Login successful | Login successful |
| 400 | All fields are required | Missing required fields |
| 400 | Passwords do not match | Signup password mismatch |
| 400 | Password must be at least 6 characters long | Weak password |
| 400 | User already exists with this email | Email already registered |
| 401 | Invalid email or password | Login failed |
| 401 | Authorization token is missing | No token provided |
| 401 | Token has expired | Token expired, login again |
| 401 | Invalid token | Token tampered or invalid |
| 404 | User not found | User doesn't exist |
| 500 | Internal server error | Server error |

---

## Security Best Practices

1. **Password Requirements:**
   - Minimum 6 characters (in production, increase to 12+)
   - Always hashed with bcryptjs before storage
   - Never logged or exposed in API responses

2. **JWT Token:**
   - Expires in 24 hours (configurable)
   - Never share your `JWT_SECRET`
   - Store tokens securely on client (HttpOnly cookies recommended for production)

3. **CORS:**
   - Configured for specific frontend URLs
   - Add your production frontend URL to CORS whitelist in app.js

4. **Rate Limiting (Optional):**
   - Consider implementing rate limiting on authentication endpoints
   - Use packages like `express-rate-limit` to prevent brute force attacks

---

## Extending Authentication

### Adding Role-Based Access Control (RBAC)

The system already supports roles. Use the `adminMiddleware` for admin-only routes:

```javascript
import { authMiddleware, adminMiddleware } from "../../middlewares/auth.middleware.js";

router.delete("/users/:userId", authMiddleware, adminMiddleware, deleteUser);
```

### Password Reset (Optional)
You can extend the auth service to support password reset by:
1. Creating a password reset token
2. Sending email with reset link
3. Verifying reset token and updating password

---

## Troubleshooting

### "Database not connected" Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in .env file
- Verify database connection in `config/db.js`

### "Token has expired" Error
- User needs to login again
- Token expires after 24 hours
- Implement refresh token logic for production

### "Invalid token" Error
- Token may be malformed
- `JWT_SECRET` may not match between signing and verification
- Check header format: `Authorization: Bearer <token>`

### CORS Issues
- Add frontend URL to CORS origins in `app.js`
- Ensure credentials are included in frontend requests if needed

---

## Files Created/Modified

### New Files:
- `modules/auth/user.model.js` - User database model
- `modules/auth/auth.service.js` - Authentication business logic
- `modules/auth/auth.controller.js` - Request/response handlers
- `modules/auth/auth.routes.js` - Authentication routes
- `middlewares/auth.middleware.js` - JWT verification middleware
- `.env.example` - Environment variables template

### Modified Files:
- `package.json` - Added bcryptjs and jsonwebtoken dependencies
- `app.js` - Added auth routes
- `config/db.js` - Added users collection creation

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up `.env` file with required variables
3. ✅ Start the backend: `npm run dev`
4. 📝 Update your frontend to use authentication endpoints
5. 🔒 Protect your existing routes by adding `authMiddleware`
6. 🚀 Test all endpoints with Postman or similar tool

---

Happy coding! 🎉
