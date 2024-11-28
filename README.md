# SVG Shape Contour Generator

An interactive web application that allows users to draw shapes and automatically generate an outer contour around them.

## Features

- Draw rectangles and circles on an interactive canvas
- Adjust margin width for the outer contour
- Generate outer contour that encompasses all shapes
- Download the result as an SVG file
- Clear canvas functionality

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

3. Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage

1. Select a shape type (Rectangle or Circle) from the dropdown menu
2. Click and drag on the canvas to draw shapes
3. Adjust the margin value using the input field
4. Click "Generate Outer Contour" to create the contour around all shapes
5. Use "Download SVG" to save your work
6. Click "Clear Canvas" to start over

## Requirements

- Python 3.7+
- Flask
- svgpathtools
- shapely
- numpy

## License

MIT License 