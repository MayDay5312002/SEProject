#!/bin/bash
sudo apt install python3.12
sudo apt install python3.12-venv
sudo apt install python3-pip
# Creating venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Creates .env
echo "ANTHROPIC_API_KEY='<place_api_key_here>'" > .env