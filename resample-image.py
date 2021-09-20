import numpy as np
import matplotlib.pyplot as plt
import cv2

if __name__ == '__main__':
    infile = 'start.png'

    img = cv2.imread(infile, cv2.IMREAD_UNCHANGED)
    print(img.shape)

    # plt.imshow(img)
    # plt.show()

    scale = 3
    _img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST)
    print(_img.shape)
    plt.imshow(_img)
    plt.show()

    cv2.imwrite('start_x3.png', _img)
