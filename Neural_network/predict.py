import numpy as np
from model import create_model, predict
from data_processing import get_processed_data

train_images_flat, train_labels, test_images_flat, test_labels = get_processed_data()

model = create_model(path="weights.json")

count = 0
for i in range(10000):
    input_image = test_images_flat[i]
    true_label = test_labels[i]

    input_image = input_image.reshape(1, -1)
    predicted_class = predict(input_image, model)

    if (predicted_class == true_label):
        count += 1

print(f"Test accuracy: {((count/100)):.2f}%")