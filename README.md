# Previa - Preventive Healthcare Platform

Previa is a digital healthcare platform that helps people stay healthy before they fall sick by detecting health patterns early and suggesting small, smart changes.

## Features

- User authentication system
- Daily health tracking (sleep, mood, energy, water, exercise, nutrition, symptoms)
- AI-powered health insights based on patterns in your data
- Health score calculation to monitor your overall well-being
- Trend visualization for key health metrics
- Personalized suggestions for improving health

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- RESTful API design

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Chart.js for data visualization
- Axios for API requests

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/previa.git
cd previa
```

2. Install backend dependencies
```
cd server
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following content:
```
NODE_ENV=development
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. Install frontend dependencies
```
cd ../frontend
npm install
```

5. Run the development server
```
# Start backend only
cd ../server
npm run server

# Start frontend only
cd ../frontend
npm start

# Start both concurrently (from server directory)
cd ../server
npm run dev
```

## Project Structure

```
preventive-health-app/
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   └── src/                  # React source files
│       ├── components/       # Reusable components
│       ├── context/          # React context providers
│       ├── pages/            # Page components
│       └── utils/            # Utility functions
└── server/                   # Node.js backend
    ├── middleware/           # Express middleware
    ├── models/               # Mongoose models
    └── routes/               # API routes
```

## How it Works

1. Users create an account and log in to the platform
2. They track their daily health metrics through the health log form
3. The system calculates a health score based on the logged data
4. Over time, the AI analyzes patterns and generates insights
5. Users receive personalized suggestions to improve their health
6. The dashboard displays trends and progress

## License

This project is licensed under the MIT License. 