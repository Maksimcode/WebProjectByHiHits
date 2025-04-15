import numpy as np
from PIL import Image

def load_data():
    train_images_raw = np.load("C:/Users/Comp/source/projectByHiHits/WebProjectByHiHits/Neural_network/data/train_images.npy")
    train_labels = np.load("C:/Users/Comp/source/projectByHiHits/WebProjectByHiHits/Neural_network/data/train_labels.npy")
    test_images_raw = np.load("C:/Users/Comp/source/projectByHiHits/WebProjectByHiHits/Neural_network/data/test_images.npy")
    test_labels = np.load("C:/Users/Comp/source/projectByHiHits/WebProjectByHiHits/Neural_network/data/test_labels.npy")
    return train_images_raw, train_labels, test_images_raw, test_labels

def add_padding(image_array, new_size=(50, 50)):
    new_image = Image.new("L", new_size, color=0)
    offset = ((new_size[0] - image_array.shape[0]) // 2, (new_size[1] - image_array.shape[1]) // 2)
    new_image.paste(Image.fromarray((image_array * 255).astype(np.uint8)), offset)
    return np.array(new_image) / 255.0

def get_processed_data():
    train_images_raw, train_labels, test_images_raw, test_labels = load_data()

    train_images_flat, test_images_flat = image_processing(train_images_raw, test_images_raw)

    return train_images_flat, train_labels, test_images_flat, test_labels

def image_processing(train_images, test_images):
    train_images_padded = np.array([add_padding(img) for img in train_images])
    test_images_padded = np.array([add_padding(img) for img in test_images])

    train_images_flat = train_images_padded.reshape(train_images_padded.shape[0], -1)
    test_images_flat = test_images_padded.reshape(test_images_padded.shape[0], -1)

    return train_images_flat, test_images_flat