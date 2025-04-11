#!/bin/bash
# Install required packages
sudo apt=get update
sudo apt-get upgrade
sudo apt install python3.12
sudo apt install python3.12-venv
sudo apt install tesseract-ocr
sudo apt install libtesseract-dev
# Creating venv
python3 -m venv .venv
source .venv/bin/activ
pip install -r requirements.txt