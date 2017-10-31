# -*- coding: utf-8 -*-
import os
from PIL import Image
from config import SRC_PATH, DST_PATH, WM_PATH


def encode_color(s, w):
    return ((w & 192) >> 6) + (s & 252)


def decode_color(s):
    return (s & 3) << 6


def add_watermark(src, wm=WM_PATH):
    filename = src.split("\\")[-1].split(".")[0]
    path_png = os.path.join(DST_PATH, filename + "_converted.png")
    path_dst = os.path.join(DST_PATH, filename + "_result.png")
    # Convert the source image to PNG RGBA and save it
    s_img = Image.open(src)
    s_img.save(path_png)
    s_img.close()
    # Open the converted png image and load pixel info
    s_img = Image.open(path_png).convert("RGB")
    s_p = s_img.load()
    w, h = s_img.size
    # Open the watermark image and resize it
    w_img = Image.open(wm)
    w_p = w_img.resize((w, h)).load()
    # Create an image for storing results
    d_img = Image.new("RGB", (w, h))
    d_p = d_img.load()
    # print s_img.format, "%dx%d" % (w, h), s_img.mode
    for x in range(w):
        for y in range(h):
            (rw, gw, bw) = w_p[x, y]
            (rs, gs, bs) = s_p[x, y]
            rd = encode_color(rs, rw)
            gd = encode_color(gs, gw)
            bd = encode_color(bs, bw)
            d_p[x, y] = (rd, gd, bd)
            # print rs, rw, (rw & 248) >> 5, rs & 7, rs & 248
            # exit(0)
    # Save the result
    d_img.save(path_dst)
    # Close the files.
    s_img.close()
    w_img.close()
    d_img.close()
    return path_dst.split("static/")[-1].replace("\\", "/")


def read_watermark(src):
    filename = src.split("\\")[-1].split(".")[0]
    path_dst = os.path.join(DST_PATH, filename + "_afterread.png")
    # Open the source image
    s_img = Image.open(src)
    s_p = s_img.load()
    w, h = s_img.size
    # Create an image for storing results
    d_img = Image.new("RGB", (w, h))
    d_p = d_img.load()
    for x in range(w):
        for y in range(h):
            (rs, gs, bs) = s_p[x, y]
            rd = decode_color(rs)
            gd = decode_color(gs)
            bd = decode_color(bs)
            d_p[x, y] = (rd, gd, bd)
    # Save the result
    d_img.save(path_dst)
    # Close the files.
    s_img.close()
    d_img.close()
    return path_dst.split("static/")[-1].replace("\\", "/")


if __name__ == '__main__':
    src_file = os.path.join(SRC_PATH, "test.jpg")
    wm_file = os.path.join(SRC_PATH, "wm.jpg")
    result_file = os.path.join(SRC_PATH, "result.png")
    print add_watermark(src_file, wm_file)
    print read_watermark(result_file)
