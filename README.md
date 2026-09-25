# ChatFlow — AI Powered Chat Application

ChatFlow is a modern AI-powered chat application built with React.js, Node.js, Express.js, MongoDB, Firebase Authentication, and OpenRouter AI.

The application provides a secure and interactive chat experience with user authentication, AI-powered responses, image analysis, voice input, Markdown support, and chat storage.

## Live Demo

**Live Application:**
[ChatFlow Live Demo](https://chatflow-frontend-zhcn.onrender.com?utm_source=chatgpt.com)

## GitHub Repository

**Source Code:**
[ChatFlow on GitHub](https://github.com/Kadambari12345/ChatFlow-AI-Powered-Chat-Application?utm_source=chatgpt.com)

---

## Features

* User authentication using Firebase
* Email and password authentication
* Google authentication
* AI-powered conversations using OpenRouter
* Text-based chat
* Image upload and AI image analysis
* Voice input support
* Markdown and GitHub-Flavored Markdown rendering
* Chat history and database storage
* User profile and application settings
* Dark mode support
* Responsive and modern user interface
* Error handling and loading states
* MongoDB-based chat data storage
* Deployed frontend and backend using Render

---

## Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* React Markdown
* Remark GFM
* Firebase Authentication

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* CORS
* dotenv

### AI

* OpenRouter API
* AI-powered text generation
* AI-powered image analysis

### Deployment

* Render
* MongoDB Atlas
* Firebase

---

## Application Architecture

```text
User
  |
  v
React.js Frontend
  |
  | Firebase Authentication
  |
  v
Node.js + Express Backend
  |
  +--------------------+
  |                    |
  v                    v
MongoDB Atlas       OpenRouter AI
  |                    |
  +--------------------+
           |
           v
      AI Response
           |
           v
      React Frontend
```

---

## Authentication

ChatFlow uses Firebase Authentication to provide:

* Email and password sign-in
* New account registration
* Google sign-in
* Password reset
* User session management
* Secure logout

---

## AI Chat

Users can communicate with the AI through natural-language conversations.

The backend sends requests to OpenRouter and processes the AI response before returning it to the React frontend.

The application supports both:

* Text-only conversations
* Image-based conversations

---

## Image Analysis

Users can upload an image directly from the chat interface.

The application sends the image along with the user's message to the AI service, allowing the AI to analyze the provided image and generate a response.

---

## Voice Input

ChatFlow includes voice input functionality that allows users to enter messages using their microphone instead of typing.

This provides an alternative interaction method for users who prefer voice-based input.

---

## Database

MongoDB Atlas is used to store chat information.

Stored information includes:

* User ID
* Chat title
* User messages
* AI responses
* Image information
* Creation timestamp
* Update timestamp

Mongoose is used to define and manage the MongoDB data models.

---

## Project Structure

```text
ChatFlow/
│
├── backend/
│   ├── models/
│   │   └── Chat.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── main.jsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Kadambari12345/ChatFlow-AI-Powered-Chat-Application.git
```

### 2. Navigate to the Project

```bash
cd ChatFlow-AI-Powered-Chat-Application
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000
```

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

### 4. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will provide a local URL, typically:

```text
http://localhost:5173
```

---

## Environment Variables

The backend requires the following environment variables:

| Variable             | Purpose                         |
| -------------------- | ------------------------------- |
| `MONGODB_URI`        | MongoDB Atlas connection string |
| `OPENROUTER_API_KEY` | OpenRouter API authentication   |
| `PORT`               | Backend server port             |

Do not commit `.env` files or API keys to GitHub.

---

## Deployment

The application is deployed using Render.

### Frontend

The React/Vite frontend is deployed as a Render Static Site.

```text
Build Command:
npm install && npm run build

Publish Directory:
dist
```

### Backend

The Node.js/Express backend is deployed as a Render Web Service.

```text
Build Command:
npm install

Start Command:
npm start
```

MongoDB Atlas provides the cloud database and Firebase provides authentication services.

---

## Key Learning Outcomes

Through this project, I worked with:

* React component development
* REST API integration
* Node.js and Express backend development
* MongoDB database integration
* Firebase Authentication
* Third-party AI API integration
* Image processing with AI APIs
* Voice input integration
* Environment variable management
* Git and GitHub
* Full-stack application deployment
* Frontend-backend communication
* Error handling and API debugging

---

## Future Improvements

Potential improvements include:

* Persistent conversation threads
* Improved chat history management
* Streaming AI responses
* File and document analysis
* Firebase Storage or cloud image storage
* Enhanced backend authentication and authorization
* Rate limiting and API protection
* More advanced user profile management
* Improved mobile responsiveness
* AI model selection

---

## Author

**Kadambari Dhok**

Computer Science & Engineering Student
Interested in Full Stack Development, AI Applications, and Modern Web Technologies.

### Connect

* GitHub: [Kadambari12345](https://github.com/Kadambari12345?utm_source=chatgpt.com)
* LinkedIn: [Kadambari Dhok on LinkedIn](https://www.linkedin.com/in/kadambari-dhok-881a86383/?utm_source=chatgpt.com)

---

## License

This project is created for educational and portfolio purposes.
