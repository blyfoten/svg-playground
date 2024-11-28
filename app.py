from flask import Flask, render_template, request, jsonify
from svgpathtools import parse_path, Path, Line
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
import json
import numpy as np

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_contour', methods=['POST'])
def generate_contour():
    data = request.json
    shapes = data['shapes']
    margin = float(data.get('margin', 10))
    
    # Convert shapes to Shapely polygons
    polygons = []
    for shape in shapes:
        if shape['type'] == 'rect':
            x, y = float(shape['x']), float(shape['y'])
            width, height = float(shape['width']), float(shape['height'])
            polygons.append(box(x, y, x + width, y + height))
        elif shape['type'] == 'circle':
            x, y = float(shape['cx']), float(shape['cy'])
            r = float(shape['r'])
            # Approximate circle with regular polygon
            points = []
            for i in range(32):
                angle = 2 * np.pi * i / 32
                points.append((x + r * np.cos(angle), y + r * np.sin(angle)))
            polygons.append(Polygon(points))
    
    # Create union of all shapes
    if not polygons:
        return jsonify({'error': 'No shapes provided'})
    
    union = unary_union(polygons)
    
    # Create buffer around union (margin)
    contour = union.buffer(margin, join_style=2)
    
    # Convert to SVG path
    coords = list(contour.exterior.coords)
    path_data = f"M {coords[0][0]},{coords[0][1]}"
    for coord in coords[1:]:
        path_data += f" L {coord[0]},{coord[1]}"
    path_data += " Z"
    
    return jsonify({
        'contour': path_data
    })

if __name__ == '__main__':
    app.run(debug=True) 