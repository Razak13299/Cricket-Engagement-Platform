const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const socketio = require('socket.io');
require('dotenv').config();

// MongoDB Model
const Prediction = require('./models/Prediction');

// Setup
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true }
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/sample_avatars', express.static(path.join(__dirname, 'sample_avatars')));

// In-memory state
let predictions = {};
let scores = {};
let quizScores = {};
let countdown = 30;
let connectedUsers = {}; // { username: { socketId, avatar } }
let cricketQuestions = [];

// Load quiz questions
function loadCricketQuestions() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'cricket_quiz.json'), 'utf8');
        cricketQuestions = JSON.parse(data);
        console.log(`✅ Loaded ${cricketQuestions.length} quiz questions.`);
    } catch (err) {
        console.error('❌ Failed to load quiz:', err);
    }
}
loadCricketQuestions();

// Emit random quiz
function emitRandomCricketQuiz() {
    if (cricketQuestions.length === 0) return;
    const quiz = cricketQuestions[Math.floor(Math.random() * cricketQuestions.length)];
    io.emit('newQuizQuestion', quiz);
    console.log('🎯 Quiz sent:', quiz.question);
}

// WebSocket setup
io.on('connection', (socket) => {
    console.log('✅ New user connected');

    socket.on('login', ({ username, avatar }) => {
        if (connectedUsers[username]) {
            socket.emit('loginError', 'Username is already taken. Please choose another one.');
        } else {
            connectedUsers[username] = {
                socketId: socket.id,
                avatar: avatar || ''
            };
            socket.username = username;
            socket.avatar = avatar;
            socket.emit('loginSuccess', { username, avatar });
            console.log(`🔓 ${username} logged in with avatar: ${avatar}`);
        }
    });

    socket.on('chatMessage', (msg) => {
        console.log('💬', msg);
        io.emit('message', msg); // { username, avatar, text, time }
    });

    socket.on('submitPrediction', async ({ username, prediction }) => {
        predictions[username] = prediction;
        console.log(`📌 ${username} predicted: ${prediction}`);
        try {
            await Prediction.create({ username, prediction });
        } catch (err) {
            console.error('❌ Prediction DB Error:', err);
        }
    });

    socket.on('submitQuizAnswer', ({ username, answer, correctAnswer }) => {
        const isCorrect = answer === correctAnswer;
        if (isCorrect) {
            quizScores[username] = (quizScores[username] || 0) + 1;
        }

        io.emit('quizResult', {
            username,
            isCorrect,
            quizScores
        });
    });

    socket.on('disconnect', () => {
        const username = socket.username;
        if (username && connectedUsers[username]) {
            delete connectedUsers[username];
            console.log(`❌ ${username} disconnected.`);
        }
    });
});

// Countdown + Battle Result
setInterval(async () => {
    countdown--;
    io.emit('countdown', countdown);

    if (countdown === 0) {
        const outcomes = ["Dot Ball", "Single", "Double", "Triple", "Four", "Six", "Wicket", "Wide", "No Ball"];
        const actual = outcomes[Math.floor(Math.random() * outcomes.length)];
        let winners = [];

        console.log(`🎲 Simulated outcome: ${actual}`);

        for (const user in predictions) {
            const isCorrect = predictions[user] === actual;
            if (isCorrect) {
                scores[user] = (scores[user] || 0) + 1;
                winners.push(user);
            }

            try {
                await Prediction.findOneAndUpdate(
                    { username: user },
                    { actualOutcome: actual, isCorrect },
                    { sort: { createdAt: -1 } }
                );
            } catch (err) {
                console.error('❌ DB Update Error:', err);
            }
        }

        io.emit('battleResult', {
            actual,
            winners,
            leaderboard: scores
        });

        predictions = {};
        countdown = 30;
    }
}, 1000);

// Emit quiz every 45 seconds
setInterval(emitRandomCricketQuiz, 45000);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/cricket-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Health check
app.get('/', (req, res) => {
    res.send('Cricket Engagement Platform Backend');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
