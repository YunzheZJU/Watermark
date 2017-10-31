# -*- coding: utf-8 -*-
import os
import numpy as np
from PIL import Image


def add_watermark(file_path):
    # Convert the source image to PNG RGBA and save it
    img = Image.open(file_path)
    filename_png = file_path.split("\\")[-1].split(".")[0] + ".png"
    path_png = os.path.join(os.path.abspath('.'), filename_png)
    img.save(path_png)
    img.close()
    # Open the converted png image
    img = Image.open(path_png).convert("RGBA")
    w, h = img.size
    print img.format, "%dx%d" % (w, h), img.mode
    for (x, y) in (w, h):  # FIXME
        (r, g, b, a) = img.getpixel((x, y))
        img.putpixel((r, g, b, 128))
    path_dst = os.path.join(os.path.abspath('.'), "result.png")
    img.save(path_dst)
    img.show()
    img.close()
    # img.show()


if __name__ == '__main__':
    file_path = os.path.join(os.path.abspath('.'), "test.jpg")
    add_watermark(file_path)
