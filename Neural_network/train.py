import numpy as np
from model import create_model, save_weights, cross_entropy_loss
from data_processing import get_processed_data

learning_rate = 0.01
epochs = 15
batch_size = 64

def one_hot_encode(labels, num_classes=10):
    return np.eye(num_classes)[labels]

train_images_flat, train_labels, test_images_flat, test_labels = get_processed_data()

train_labels_onehot = one_hot_encode(train_labels)
test_labels_onehot = one_hot_encode(test_labels)

model = create_model(path="weights.json")

for epoch in range(epochs):
    for i in range(0, len(train_images_flat), batch_size):

        batch_images = train_images_flat[i:i + batch_size]
        batch_labels = train_labels_onehot[i:i + batch_size]

        output = model.forward(batch_images)

        loss, grad_output = cross_entropy_loss(output, batch_labels)

        model.backward(grad_output, learning_rate)

    print(f"Epoch {epoch + 1}/{epochs} Loss: {loss:.4f}")

save_weights(model, "weights.json")