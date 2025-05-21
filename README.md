🏏 Cricket Engagement Platform

A real-time cricket fan engagement platform that includes chatrooms, prediction battles, AI match predictions, live cricket quizzes, and avatar personalization. Built with React, Node.js, Socket.io, and MongoDB.


🚀 Features

- 💬 Live Chatroom with AI generated avatars
- 🧠 AI-based next-ball prediction
- 🔮 Prediction Battle Game (next ball outcome)
- 🧾 Real-time Leaderboard for predictions
- ❓ Cricket Quiz Battles (custom cricket questions)



🛠 Tech Stack

| Frontend      | Backend         | Real-time & DB      |
|---------------|------------------|----------------------|
| React         | Node.js + Express | Socket.io + MongoDB  |



📂 Project Structure

```bash
cricket-engagement/
│
├── client/               # React frontend
│   ├── src/components/   # ChatRoom, AvatarPicker, LiveQuiz
│   └── public/
│
├── server/               # Express backend
│   ├── models/           # Mongoose Prediction model
│   ├── cricket_quiz.json # Local quiz questions
│   ├── sample_avatars/   # Sample avatar images
│   ├── uploads/          # User-uploaded images (gitignored)
│   └── server.js
│
├── .env.example          # Example environment variables
└── README.md
