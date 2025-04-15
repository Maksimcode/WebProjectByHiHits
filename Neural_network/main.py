from flask import Flask, request, jsonify, render_template
import numpy as np
from model import create_model

app = Flask(__name__)

model = create_model(path="Neural_network\weights.json")

@app.route('/')
def index():
    return render_template('Neuro.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_image = np.array(data['image']).reshape(1, -1)

    output = model.forward(input_image, is_training=False)
    predicted_class = np.argmax(output, axis=1)[0]

    return jsonify({'prediction': int(predicted_class)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)