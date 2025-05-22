const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    prediction: { type: String, required: true },
    actualOutcome: { type: String },
    isCorrect: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
// Prediction schema 
