#!/bin/bash

# Install required packages
sudo apt update
sudo apt upgrade
sudo apt install python3.12
sudo apt install python3.12-venv
sudo apt-get install tesseract-ocr libtesseract-dev libleptonica-dev
sudo apt-get install libpango1.0-dev libcairo2-dev
sudo apt-get install libicu-dev libpango1.0-dev libcairo2-dev
sudo apt-get install tesseract-ocr-eng

# Creating venv
python3 -m venv .venv
pip install -r requirements.txt