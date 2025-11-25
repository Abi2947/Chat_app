# Chat Application - Backend

A Node.js/Express server with real-time messaging via Socket.io, MongoDB persistence, and JWT authentication.

## 🚀 Features

✨ **Real-time Chat** - WebSocket communication via Socket.io
🔐 **JWT Authentication** - Secure token-based auth with refresh tokens
👥 **User Management** - Register, login, profile management
💬 **Message Storage** - Persistent message history in MongoDB
🟢 **Online Status** - Real-time user availability tracking
🔒 **Protected Routes** - Middleware-based access control

## 📋 Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Jest** - Testing framework

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── socket.js          # Socket.io setup
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── userController.js  # User logic
│   └── chatController.js  # Chat logic
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── autoRefresh.js     # Token refresh
│   └── errorHandler.js    # Error handling
├── models/
│   ├── User.js            # User schema
│   ├── Chat.js            # Chat schema
│   └── Message.js         # Message schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── userRoutes.js      # User endpoints
│   └── chatRoutes.js      # Chat endpoints
├── utils/
│   └── generateTokens.js  # JWT utilities
├── tests/                 # Test files
│   ├── auth.test.js       # Test case for auth testing
│   ├── chat.test.js       # Test case for chat testing
│   └── user.test.js       # Test case for user testing
├── uploads/               # Contains uploaded images in chat
│   ├── .gitkeep           # Git file for tracking changes
│   └── img1               # Uploaded images
├── .env                   # Environment variables
├── .env.example           # Example env file
├── package.json           # Dependencies
└── server.js              # Entry point
```

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chat_app

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_change_this
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. MongoDB Setup

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app
```

### 4. Start Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 🔌 API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new account | ❌ |
| POST | `/login` | Login with email/password | ❌ |
| GET | `/me` | Get current user | ✅ |
| POST | `/logout` | Logout | ✅ |

**Register Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Login Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

### User Routes (`/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all users | ✅ |
| GET | `/:id` | Get specific user | ✅ |
| PUT | `/:id` | Update user | ✅ |
| DELETE | `/:id` | Delete user | ✅ Admin |
| GET | `/dashboard` | User dashboard stats | ✅ |

### Chat Routes (`/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create private chat | ✅ |
| GET | `/` | Get user's chats | ✅ |
| GET | `/:id/messages` | Get messages in chat | ✅ |

**Create Chat Request:**
```json
{
  "recipientId": "507f1f77bcf86cd799439012"
}
```

## 🔌 WebSocket Events

### Client → Server

```javascript
// User comes online
socket.emit('user-online', userId)

// User goes offline
socket.emit('user-offline', userId)

// Send message
socket.emit('send-message', {
  chatId: '507f1f77bcf86cd799439011',
  content: 'Hello!',
  sender: '507f1f77bcf86cd799439012'
})
```

### Server → Client

```javascript
// List of online users updated
socket.on('online-users', (userIds) => {
  // ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
})

// New message received
socket.on('receive-message', (message) => {
  // {
  //   _id: '507f1f77bcf86cd799439013',
  //   content: 'Hello!',
  //   sender: { _id: '...', username: 'john' },
  //   chatId: '507f1f77bcf86cd799439011',
  //   createdAt: '2025-01-15T10:30:00Z'
  // }
})
```

## 📊 Database Models

### User Schema

```javascript
{
  firstName: String (required),
  lastName: String (required),
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  phone: String (required),
  address: String (required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Schema

```javascript
{
  isGroupChat: Boolean (default: false),
  name: String (required for groups),
  groupAdmin: ObjectId (required for groups),
  participants: [ObjectId] (required),
  latestMessage: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema

```javascript
{
  content: String (required),
  sender: ObjectId (ref: 'User', required),
  chat: ObjectId (ref: 'Chat', required),
  readBy: [{
    user: ObjectId (ref: 'User'),
    readAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication Flow

1. **Registration**
   - User submits registration form
   - Server validates input
   - Password hashed with bcryptjs (12 rounds)
   - User created in MongoDB
   - JWT token generated
   - Response: accessToken, refreshToken, user

2. **Login**
   - User submits email & password
   - Server finds user in database
   - Password compared with hash
   - If valid, tokens generated
   - Tokens sent to client

3. **Protected Routes**
   - Client sends token in Authorization header
   - Middleware verifies JWT signature
   - If valid, request continues
   - If invalid/expired, returns 401

4. **Token Refresh**
   - Access token expires after 7 days
   - Client automatically refreshes with refresh token
   - New access token issued

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test authController.test
```

## 🚀 Development

```bash
# Start with hot-reload (nodemon)
npm run dev

# Start production
npm start

# Run linter
npm run lint
```

## 📦 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time communication
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `express-validator` - Input validation
- `cookie-parser` - Cookie handling

### Development
- `nodemon` - Auto-restart on file change
- `jest` - Testing framework
- `supertest` - HTTP testing

## 🐛 Common Issues

### "Cannot connect to MongoDB"
```
✓ Ensure MongoDB is running
✓ Check MONGODB_URI is correct
✓ Verify username/password for Atlas
✓ Check firewall/network access
```

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### "Socket connection failed"
```
✓ Check ALLOWED_ORIGINS includes frontend
✓ Verify both servers have matching versions
✓ Check browser WebSocket not blocked
```

### "JWT token expired"
```
✓ Check JWT_EXPIRE value in .env
✓ Verify token is being refreshed
✓ Clear localStorage and re-login
```

## 📈 Performance Tips

1. **Database**
   - Add indexes to frequently queried fields
   - Use connection pooling
   - Implement query pagination

2. **Socket.io**
   - Use rooms for targeted broadcasts
   - Implement message queuing
   - Add Redis adapter for scaling

3. **API**
   - Add response caching
   - Implement rate limiting
   - Use gzip compression

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_uri
```

### AWS/Digital Ocean
1. Set up Node.js server
2. Configure environment variables
3. Set up MongoDB cluster
4. Configure reverse proxy (nginx)
5. Enable SSL/TLS

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT for authentication
- ✅ Protected routes with middleware
- ✅ CORS configured
- ✅ Input validation with express-validator
- ⚠️ Add rate limiting (production)
- ⚠️ Add HTTPS (production)
- ⚠️ Add security headers
- ⚠️ Database backup strategy

## 📚 Additional Resources

- [Express.js Guide](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Socket.io Guide](https://socket.io/docs/)
- [JWT Guide](https://jwt.io/)
- [MongoDB Guide](https://www.mongodb.com/docs/)

## 📝 License

MIT

## 👥 Support

For backend issues:
1. Check server logs: `npm run dev`
2. Verify .env configuration
3. Test API endpoints with Postman
4. Check MongoDB connection
5. Review error messages in browser console
