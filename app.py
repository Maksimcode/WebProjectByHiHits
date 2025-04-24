from flask import Flask, redirect, request, jsonify,  url_for
import numpy as np
from Neural_network import bp as neural_bp
from AStar_algorithm import bp as astar_bp
from Clusterization import bp as clusterization_bp
from Decision_tree import bp as tree_bp
from Genetic_algorithm import bp as genetic_bp
from Ant_algorithm import bp as ant_bp
from main_page import bp as main_bp
from Neural_network.model import create_model

app = Flask(__name__)

app.register_blueprint(neural_bp, url_prefix = "/neural_network")
app.register_blueprint(astar_bp, url_prefix = "/astar_algorithm")
app.register_blueprint(clusterization_bp, url_prefix = "/clusterization")
app.register_blueprint(tree_bp, url_prefix = "/decision_tree")
app.register_blueprint(genetic_bp, url_prefix = "/genetic_algorithm")
app.register_blueprint(main_bp, url_prefix = "/main_page")
app.register_blueprint(ant_bp, url_prefix = "/ant_algorithm")

@app.route('/')
def index():
    return redirect(url_for('main_page.main_page'))


model = create_model(path="Neural_network\weights.json")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_image = np.array(data['image']).reshape(1, -1)
    output = model.forward(input_image, is_training=False)

    predicted_class = np.argmax(output, axis=1)[0]

    probabilities = {i: round(prob * 100, 2) for i, prob in enumerate(output[0])}

    return jsonify({
        "prediction": int(predicted_class),
        "probabilities": probabilities
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)