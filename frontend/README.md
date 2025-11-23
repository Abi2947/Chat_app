# Chat Application - Frontend

A modern, real-time chat application built with React, Socket.io, and Tailwind CSS.

## Features

✨ **Real-time Messaging** - Instant message delivery using WebSocket (Socket.io)
👥 **User Authentication** - Secure login and registration with JWT
🟢 **Online Status** - See who's online in real-time
🎨 **Dark Mode** - Toggle between light and dark themes
📱 **Responsive Design** - Works seamlessly on desktop and mobile
🔐 **Protected Routes** - Auto-redirect unauthenticated users

## Tech Stack

- **React 19** - UI Framework
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time WebSocket communication
- **Axios** - HTTP client for API requests
- **React Router v7** - Client-side routing
- **Context API** - State management

## Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── MessageInput.js
│   ├── MessageList.js
│   └── UserList.js
├── context/             # Global state management
│   ├── AuthContext.js   # Authentication & user state
│   ├── ChatContext.js   # Chat & messages state
│   └── ThemeContext.js  # Dark mode state
├── pages/               # Full page components
│   ├── LoginPage.js     # Auth page (login/register)
│   └── ChatPage.js      # Main chat interface
├── services/            # API & Socket.io utilities
│   ├── api.js           # Axios instance with interceptors
│   └── socket.js        # Socket.io connection & events
├── styles/              # Tailwind & custom CSS
├── App.jsx              # Root component with routing
└── index.js             # React DOM entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## API Integration

### Authentication APIs

- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Get Current User**: `GET /auth/me`
- **Logout**: `POST /auth/logout`

### Chat APIs

- **Get All Users**: `GET /users`
- **Get User Chats**: `GET /chat`
- **Create Chat**: `POST /chat/create`
- **Get Messages**: `GET /chat/:chatId/messages`

### Socket.io Events

**Client → Server:**
- `user-online` - Notify server user is online
- `send-message` - Send message

**Server → Client:**
- `online-users` - List of online user IDs
- `receive-message` - New incoming message

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.
