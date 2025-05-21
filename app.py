from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Simple cricket outcome predictor
def predict_cricket_outcome():
    outcomes = ["Dot Ball", "Single", "Double", "Triple", "Four", "Six", "Wicket", "Wide", "No Ball"]
    return random.choice(outcomes)

@app.route('/predict', methods=['GET'])
def predict():
    prediction = predict_cricket_outcome()
    return jsonify({"prediction": prediction})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
