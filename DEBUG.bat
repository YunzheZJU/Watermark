@echo off
set FLASK_APP=watermark.py
set FLASK_DEBUG=1
start flask run --host=0.0.0.0 --port=8080