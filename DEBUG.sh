#!/bin/bash
export FLASK_APP=watermark.py
export FLASK_DEBUG=1
flask run --host=0.0.0.0 --port=8080
