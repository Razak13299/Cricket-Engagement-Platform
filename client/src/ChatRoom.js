import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import LiveQuiz from './LiveQuiz';
import AvatarPicker from './AvatarPicker';

const socket = io('https://cricket-backend-uswr.onrender.com');

const ChatRoom = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [leaderboard, setLeaderboard] = useState({});
  const [countdown, setCountdown] = useState(30);
  const [loginError, setLoginError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [userAvatars, setUserAvatars] = useState({});

  useEffect(() => {
    socket.on('message', (msg) => {
      setChat((prevChat) => [...prevChat, msg]);
      setUserAvatars((prevAvatars) => ({
        ...prevAvatars,
        [msg.username]: msg.avatar,
      }));
    });

    socket.on('battleResult', ({ actual, winners, leaderboard }) => {
      const resultMessage = winners.length > 0
        ? `🎯 The correct outcome was "${actual}". Winner(s): ${winners.join(', ')}!`
        : `❌ The correct outcome was "${actual}". No one guessed correctly.`;
      setChat((prevChat) => [...prevChat, { username: 'System', text: resultMessage }]);
      setLeaderboard(leaderboard || {});
    });

    socket.on('countdown', setCountdown);
    socket.on('loginError', setLoginError);
    socket.on('loginSuccess', () => {
      setIsLoggedIn(true);
      setLoginError(null);
    });

    return () => {
      socket.off('message');
      socket.off('battleResult');
      socket.off('countdown');
      socket.off('loginError');
      socket.off('loginSuccess');
    };
  }, []);

  const handleLogin = () => {
    if (username.trim() && selectedAvatar) {
      socket.emit('login', { username, avatar: selectedAvatar });
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      const chatMessage = {
        username,
        avatar: selectedAvatar,
        text: message.trim(),
        time: timestamp
      };
      socket.emit('chatMessage', chatMessage);
      setMessage('');
    }
  };

  const getPrediction = async () => {
    try {
      const response = await fetch('https://cricket-backend-uswr.onrender.com/predict');
      const data = await response.json();
      setChat((prevChat) => [...prevChat, {
        username: "AI",
        avatar: "",
        text: `🧠 AI Prediction: ${data.prediction}`,
        time: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      console.error("Error fetching prediction:", err);
    }
  };

  const submitPrediction = () => {
    if (prediction && username) {
      socket.emit('submitPrediction', { username, prediction });
      setChat((prev) => [...prev, {
        username,
        avatar: selectedAvatar,
        text: `📢 You predicted: ${prediction}`,
        time: new Date().toLocaleTimeString()
      }]);
      setPrediction('');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '30px' }}>
      {!isLoggedIn ? (
        <div style={{ maxWidth: '500px', margin: 'auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
          <h2>🏏 Cricket Engagement Platform</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
            style={{ padding: '10px', width: '80%', marginBottom: '10px' }}
          />
          <AvatarPicker selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} />
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
          <button onClick={handleLogin} style={{ padding: '10px 20px', marginTop: '10px' }}>Join</button>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: 'auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Live Cricket Chat Room</h2>
            {selectedAvatar && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={selectedAvatar} alt="avatar" style={{ height: '30px', borderRadius: '50%', marginRight: '10px' }} />
                <strong>{username}</strong>
              </div>
            )}
          </div>

          <h4 style={{ textAlign: 'center' }}>⏱️ Next Ball In: {countdown}s</h4>

          <div style={{ border: '1px solid #ccc', height: '250px', overflowY: 'scroll', padding: '10px', background: '#f9f9f9' }}>
            {chat.map((msg, idx) => (
              <p key={idx}>
                {msg.avatar && <img src={msg.avatar} alt="" style={{ height: '20px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '6px' }} />}
                <strong>{msg.username}</strong>: {msg.text}
              </p>
            ))}
          </div>

          <div style={{ display: 'flex', marginTop: '10px' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flexGrow: 1, padding: '10px' }}
            />
            <button onClick={sendMessage} style={{ marginLeft: '10px', padding: '10px' }}>Send</button>
            <button onClick={getPrediction} style={{ marginLeft: '10px', padding: '10px', backgroundColor: 'green', color: 'white' }}>
              Get AI Prediction
            </button>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <h3>Prediction Battle</h3>
            <select
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              style={{ padding: '10px', marginRight: '10px' }}
            >
              <option value="">Select Prediction</option>
              {["Dot Ball", "Single", "Double", "Triple", "Four", "Six", "Wicket", "Wide", "No Ball"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button onClick={submitPrediction} style={{ padding: '10px 20px' }}>Submit Prediction</button>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <h3>🏆 Leaderboard</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Object.entries(leaderboard).sort((a, b) => b[1] - a[1]).map(([user, score], index) => (
                <li key={index}>
                  {userAvatars[user] && (
                    <img
                      src={userAvatars[user]}
                      alt="avatar"
                      style={{ height: '20px', borderRadius: '50%', verticalAlign: 'middle', marginRight: '6px' }}
                    />
                  )}
                  {index + 1}. {user} — {score} point{score !== 1 ? 's' : ''}
                </li>
              ))}
            </ul>
          </div>

          <LiveQuiz username={username} />
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
