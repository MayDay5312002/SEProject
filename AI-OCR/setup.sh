#!/bin/bash

# Install required packages
sudo apt update
sudo apt upgrade
sudo apt install python3.12
sudo apt install python3.12-venv

# Set up python venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt