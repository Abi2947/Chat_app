# Frontend Setup Guide

## Quick Start (Windows)

### Automated Setup

1. Navigate to the frontend folder
2. Double-click **`setup.bat`** file
3. Wait for installation to complete
4. Update `.env` file if needed
5. Run `npm start`

---

## Manual Setup Guide

### Prerequisites

- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- Git (optional)

### Step 1: Install Node.js and npm

**Windows:**

1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer and follow the prompts
3. Restart your computer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

---

### Step 2: Navigate to Frontend Folder

**Using Command Prompt (Windows):**

```bash
cd c:\Users\aabin\Desktop\intern_tasks\palm_mind\chat_app\frontend
```

Or open the folder in VS Code and use the integrated terminal.

---

### Step 3: Install Dependencies

Run this command to install all required packages:

```bash
npm install
```

This will install:

- React
- React Router
- Axios
- Socket.IO Client
- Tailwind CSS
- And other dependencies

**Expected output:**

```
added 1500+ packages in 2m
```

---

### Step 4: Create .env File

Create a file named `.env` in the frontend root folder:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Or copy from .env.example:**

```bash
copy .env.example .env
```

---

### Step 5: Start Development Server

```bash
npm start
```

**Expected output:**

```
Compiled successfully!

You can now view chat-app-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

The application will automatically open in your default browser at `http://localhost:3000`

---

## Common Issues & Solutions

### Issue 1: "npm: command not found"

**Solution:**

- Node.js is not installed or not in PATH
- Reinstall Node.js from [https://nodejs.org/](https://nodejs.org/)
- Restart your computer after installation

### Issue 2: Port 3000 already in use

**Solution:**

```bash
# Set a different port
set PORT=3001
npm start
```

### Issue 3: "Cannot find module" errors

**Solution:**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -r node_modules
npm install
```

### Issue 4: Backend connection fails

**Solution:**

- Ensure backend is running on `http://localhost:5000`
- Check `.env` file has correct API URL
- Verify CORS is enabled on backend

---

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatWindow.js
│   │   ├── MessageList.js
│   │   └── MessageInput.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── ChatContext.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   └── ChatPage.js
│   ├── services/
│   │   ├── api.js
│   │   └── socket.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   └── index.js
├── .env
├── .env.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── setup.bat
└── README.md
```

---

## Available Commands

### Development

```bash
npm start
```

Runs the app in development mode at `http://localhost:3000`

### Production Build

```bash
npm run build
```

Builds the app for production in the `build` folder

### Run Tests

```bash
npm test
```

Launches the test runner in interactive watch mode

### Eject (Advanced)

```bash
npm run eject
```

⚠️ **Warning:** This is irreversible. Only use if you need full control.

---

## Environment Variables

Create a `.env` file in the root folder:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Socket.IO Server URL
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Local Development:**

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Production:**

```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
```

---

## Connecting to Backend

### Ensure Backend is Running

1. Open a new terminal/command prompt
2. Navigate to backend folder:
   ```bash
   cd c:\Users\aabin\Desktop\intern_tasks\palm_mind\chat_app\backend
   ```
3. Install dependencies (if not done):
   ```bash
   npm install
   ```
4. Start backend server:
   ```bash
   npm start
   ```

**Expected output:**

```
Server running on port 5000
Connected to MongoDB
```

### Frontend & Backend Both Running

**Terminal 1 (Backend):**

```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## Testing the Application

### 1. Registration

- Go to `http://localhost:3000`
- Click "Register"
- Fill in all required fields
- Click "Register" button

### 2. Login

- Use registered email and password
- Click "Login"

### 3. Create a Chat

- Select a user from "Start New Chat" section
- Click on the user to create a chat

### 4. Send Messages

- Type message in input box
- Press Enter or click "Send"
- See message appear in real-time

### 5. See Statistics

- Check "Chats" and "Users" count in sidebar
- Should update as you create chats

---

## Troubleshooting Checklist

- [ ] Node.js is installed (`node --version` works)
- [ ] npm is installed (`npm --version` works)
- [ ] Dependencies are installed (`node_modules` folder exists)
- [ ] `.env` file exists with correct URLs
- [ ] Backend is running on `http://localhost:5000`
- [ ] Frontend runs without errors (`npm start` successful)
- [ ] Can see login page at `http://localhost:3000`

---

## File Descriptions

### `/public/index.html`

Main HTML file - entry point for React app

### `/src/App.js`

Main App component with routing setup

### `/src/index.js`

React app initialization

### `/src/components/`

Reusable UI components:

- **ChatWindow.js** - Main chat interface
- **MessageList.js** - Display messages
- **MessageInput.js** - Message input box

### `/src/pages/`

Full page components:

- **LoginPage.js** - Registration & login
- **ChatPage.js** - Main chat interface

### `/src/context/`

React Context for state management:

- **AuthContext.js** - User authentication
- **ChatContext.js** - Chat data & messages

### `/src/services/`

API and Socket.IO integration:

- **api.js** - HTTP requests
- **socket.js** - WebSocket connection

### `/src/styles/index.css`

Global styles with Tailwind CSS

### `/.env`

Environment variables (create from .env.example)

### `/package.json`

Project dependencies and scripts

### `/tailwind.config.js`

Tailwind CSS configuration

### `/postcss.config.js`

PostCSS configuration

### `/setup.bat`

Automated setup script for Windows

---

## Next Steps

1. ✅ Run `setup.bat` or follow manual setup
2. ✅ Update `.env` with correct URLs
3. ✅ Start backend server
4. ✅ Start frontend server (`npm start`)
5. ✅ Test registration and login
6. ✅ Create a chat and send messages
7. ✅ Push to GitHub

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review backend logs for API errors
3. Check browser console (F12) for frontend errors
4. Verify backend is running and accessible

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)

---

**Created for Palm Mind Technology Internship Task**
