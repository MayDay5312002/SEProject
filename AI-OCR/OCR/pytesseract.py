from PIL import Image
import pytesseract
import re

image = Image.open("test.png")
text = pytesseract.image_to_string(image)

print(text)