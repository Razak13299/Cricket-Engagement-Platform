import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling', 'flashsocket']
});

const ChatRoom = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [prediction, setPrediction] = useState('');
    const [leaderboard, setLeaderboard] = useState({});

    useEffect(() => {
        socket.on('message', (msg) => {
            setChat((prevChat) => [...prevChat, msg]);
        });

        socket.on('battleResult', ({ actual, winners, leaderboard }) => {
            const resultMessage = winners.length > 0
                ? `🎯 The correct outcome was "${actual}". Winner(s): ${winners.join(', ')}!`
                : `❌ The correct outcome was "${actual}". No one guessed correctly.`;
            setChat((prevChat) => [...prevChat, resultMessage]);
            setLeaderboard(leaderboard || {});
        });

        return () => {
            socket.off('message');
            socket.off('battleResult');
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            const timestamp = new Date().toLocaleTimeString();
            const chatMessage = `${username} (${timestamp}): ${message}`;
            socket.emit('chatMessage', chatMessage);
            setMessage('');
        }
    };

    const handleLogin = () => {
        if (username.trim()) {
            setIsLoggedIn(true);
        }
    };

    const getPrediction = async () => {
        try {
            const response = await fetch('http://localhost:5001/predict');
            const data = await response.json();
            const predictionMessage = `🧠 AI Prediction: ${data.prediction}`;
            setChat((prevChat) => [...prevChat, predictionMessage]);
        } catch (error) {
            console.error("Error fetching prediction:", error);
        }
    };

    const submitPrediction = () => {
        if (prediction && username) {
            socket.emit('submitPrediction', { username, prediction });
            setChat(prev => [...prev, `📢 You predicted: ${prediction}`]);
            setPrediction('');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '100vh',
            backgroundColor: '#f4f4f4',
            padding: '40px'
        }}>
            <div style={{
                maxWidth: '700px',
                width: '100%',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                {!isLoggedIn ? (
                    <div>
                        <h2>Enter Your Username</h2>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            style={{ padding: '10px', margin: '10px', width: '80%' }}
                        />
                        <br />
                        <button onClick={handleLogin} style={{ padding: '10px 20px' }}>Join</button>
                    </div>
                ) : (
                    <div>
                        <h2>🏏 Live Cricket Chat Room</h2>

                        <div style={{
                            border: '1px solid #ccc',
                            height: '300px',
                            overflowY: 'scroll',
                            marginBottom: '20px',
                            padding: '10px',
                            backgroundColor: '#fdfdfd',
                            textAlign: 'left'
                        }}>
                            {chat.map((msg, index) => (
                                <p key={index}>{msg}</p>
                            ))}
                        </div>

                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            style={{ padding: '10px', width: '65%' }}
                        />
                        <button onClick={sendMessage} style={{ marginLeft: '5px', padding: '10px' }}>Send</button>

                        <button
                            onClick={getPrediction}
                            style={{
                                marginLeft: '10px',
                                padding: '10px',
                                backgroundColor: 'green',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            Get AI Prediction
                        </button>

                        <div style={{ marginTop: '30px' }}>
                            <h3>🎮 Prediction Battle</h3>
                            <select
                                value={prediction}
                                onChange={(e) => setPrediction(e.target.value)}
                                style={{ padding: '10px', marginRight: '10px', width: '60%' }}
                            >
                                <option value="">Select Prediction</option>
                                <option value="Dot Ball">Dot Ball</option>
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Triple">Triple</option>
                                <option value="Four">Four</option>
                                <option value="Six">Six</option>
                                <option value="Wicket">Wicket</option>
                                <option value="Wide">Wide</option>
                                <option value="No Ball">No Ball</option>
                            </select>
                            <button
                                onClick={submitPrediction}
                                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
                            >
                                Submit Prediction
                            </button>
                        </div>

                        <div style={{ marginTop: '40px', textAlign: 'left' }}>
                            <h3>🏆 Leaderboard</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {Object.entries(leaderboard)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([user, score], index) => (
                                        <li key={index}>
                                            {index + 1}. {user} — {score} point{score !== 1 ? 's' : ''}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;
