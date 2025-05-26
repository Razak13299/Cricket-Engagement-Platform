import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://cricket-backend-uswr.onrender.com');

const LiveQuiz = ({ username }) => {
    const [quiz, setQuiz] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [quizScores, setQuizScores] = useState({});
    const [feedback, setFeedback] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false); // 🟡 New state to prevent multiple submits

    useEffect(() => {
        socket.on('newQuizQuestion', (question) => {
            console.log('📥 Received quiz question:', question);
            setQuiz(question);
            setSelectedAnswer('');
            setFeedback('');
            setIsSubmitted(false); // 🔄 Re-enable on new question
        });

        socket.on('quizResult', ({ username: user, isCorrect, quizScores }) => {
            setQuizScores(quizScores || {});
            if (user === username) {
                setFeedback(isCorrect ? '✅ Correct!' : '❌ Wrong answer!');
            }
        });

        return () => {
            socket.off('newQuizQuestion');
            socket.off('quizResult');
        };
    }, [username]);

    const submitAnswer = () => {
        if (selectedAnswer && quiz && !isSubmitted) {
            socket.emit('submitQuizAnswer', {
                username,
                answer: selectedAnswer,
                correctAnswer: quiz.correctAnswer
            });
            setIsSubmitted(true); // ✅ Disable button after submitting
        }
    };

    return (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <h3>🧠 Live Quiz</h3>
            {quiz ? (
                <>
                    <p><strong>{quiz.question}</strong></p>
                    {quiz.options.map((option, index) => (
                        <div key={index}>
                            <label>
                                <input
                                    type="radio"
                                    name="quiz"
                                    value={option}
                                    checked={selectedAnswer === option}
                                    onChange={(e) => setSelectedAnswer(e.target.value)}
                                    disabled={isSubmitted} // 🔒 prevent further input
                                />{' '}
                                {option}
                            </label>
                        </div>
                    ))}
                    <button
                        onClick={submitAnswer}
                        disabled={isSubmitted || !selectedAnswer} // ✅ prevent resubmits
                        style={{
                            marginTop: '10px',
                            padding: '8px 20px',
                            backgroundColor: isSubmitted ? '#999' : '#444',
                            color: 'white',
                            border: 'none',
                            cursor: isSubmitted ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitted ? 'Submitted' : 'Submit Answer'}
                    </button>
                    {feedback && <p style={{ marginTop: '10px' }}>{feedback}</p>}
                </>
            ) : (
                <p>Waiting for quiz question...</p>
            )}

            {/* 🔢 Quiz Leaderboard */}
            <div style={{ marginTop: '30px' }}>
                <h4>🧾 Quiz Leaderboard</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {Object.entries(quizScores)
                        .sort((a, b) => b[1] - a[1])
                        .map(([user, score], index) => (
                            <li key={index}>
                                {index + 1}. {user} — {score} point{score !== 1 ? 's' : ''}
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default LiveQuiz;
