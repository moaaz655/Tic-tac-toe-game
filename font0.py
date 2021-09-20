import os

import numpy as np
import matplotlib.pyplot as plt
import cv2

if __name__ == '__main__':
    font = cv2.imread('font0.png', cv2.IMREAD_UNCHANGED)
    print(font.shape)

    font_width = 16

    font_text = open('font0.txt', mode='r', encoding='utf-8').read()
    print(len(font_text))
    print(repr(font_text))

    char2index = {c: i for i, c in enumerate(font_text)}
    print(char2index)

    text = 'START'
    text_indices = [char2index[c] for c in text]

    text_image = None
    for i in text_indices:
        char_image = font[:, i*16:(i+1)*16, :]
        if text_image is None:
            text_image = char_image
        else:
            text_image = cv2.hconcat([text_image, char_image])

        print(text_image.shape)

    plt.imshow(text_image)
    plt.show()

    cv2.imwrite(f'{text}.png', text_image)
