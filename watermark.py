# -*- coding: utf-8 -*-
import os
from utils import add_watermark, read_watermark
from flask import Flask, render_template, request, url_for
from flask_uploads import UploadSet, configure_uploads, IMAGES, patch_request_class

app = Flask(__name__)
app.config['SECRET_KEY'] = 'I have a dream'
app.config['UPLOADED_PHOTOS_DEST'] = os.path.join(app.root_path, "static", "images", "upload")

photos = UploadSet('photos', IMAGES)
configure_uploads(app, photos)
patch_request_class(app)  # set maximum file size, default is 16MB


@app.route('/', methods=['GET', 'POST'])
def watermark():
    file_url = None
    if request.method == 'GET':
        return render_template('watermark.html', file_url=file_url)
    elif request.method == 'POST' and 'photo' in request.files:
        result_path = None
        filename = photos.save(request.files['photo'])
        file_path = os.path.join(app.config['UPLOADED_PHOTOS_DEST'], filename)
        if request.form['submit'] == u'添加水印':
            result_path = add_watermark(file_path)
        elif request.form['submit'] == u'提取水印':
            result_path = read_watermark(file_path)
        file_url = url_for('static', filename=result_path)
    return render_template('watermark.html', file_url=file_url)


if __name__ == '__main__':
    app.run()
