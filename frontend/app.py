from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest
import pandas as pd

app = Flask(__name__)
CORS(app) # Allows your React frontend to talk to this Python backend

def verify_data_consensus(data_points):
    df = pd.DataFrame(data_points, columns=['reported_value'])
    
    # AI identifies outliers/malicious nodes
    model = IsolationForest(contamination=0.2, random_state=42)
    df['anomaly'] = model.fit_predict(df[['reported_value']])
    
    # Filter out anomalies (-1) and keep valid data (1)
    valid_data = df[df['anomaly'] == 1]
    
    if valid_data.empty:
        return {"consensus_reached": False, "final_value": None, "confidence": 0}
        
    final_value = valid_data['reported_value'].median()
    confidence = (len(valid_data) / len(df)) * 100
    
    return {
        "consensus_reached": True, 
        "final_value": float(final_value), 
        "confidence": float(confidence)
    }

@app.route('/verify', methods=['POST'])
def verify_endpoint():
    request_data = request.json
    node_submissions = request_data.get('node_data', [])
    
    if not node_submissions:
        return jsonify({"error": "No data provided"}), 400
        
    result = verify_data_consensus(node_submissions)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5001, debug=True)

