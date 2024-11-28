document.addEventListener('DOMContentLoaded', function() {
    // Initialize SVG.js
    const svgCanvas = SVG().addTo('#drawing-area').size(800, 600);
    
    // Add a group for shapes and a path for contour
    const shapesGroup = svgCanvas.group();
    const contourPath = svgCanvas.path().fill('none').stroke({ color: 'red', width: 2 }).attr('stroke-dasharray', '5,5');
    
    let isDrawing = false;
    let currentShape = null;
    let startX, startY;
    const shapes = [];

    const shapeType = document.getElementById('shapeType');
    const marginInput = document.getElementById('margin');
    const clearButton = document.getElementById('clearCanvas');
    const generateButton = document.getElementById('generateContour');
    const downloadButton = document.getElementById('downloadSVG');

    svgCanvas.on('mousedown', startDrawing);
    svgCanvas.on('mousemove', drawShape);
    svgCanvas.on('mouseup', stopDrawing);
    svgCanvas.on('mouseleave', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        const point = svgCanvas.point(e.clientX, e.clientY);
        startX = point.x;
        startY = point.y;

        if (shapeType.value === 'rect') {
            currentShape = shapesGroup.rect().attr({
                fill: 'transparent',
                stroke: '#000',
                'stroke-width': 2,
                x: startX,
                y: startY,
                width: 0,
                height: 0
            });
        } else if (shapeType.value === 'circle') {
            currentShape = shapesGroup.circle().attr({
                fill: 'transparent',
                stroke: '#000',
                'stroke-width': 2,
                cx: startX,
                cy: startY,
                r: 0
            });
        }
    }

    function drawShape(e) {
        if (!isDrawing || !currentShape) return;
        
        const point = svgCanvas.point(e.clientX, e.clientY);
        const currentX = point.x;
        const currentY = point.y;

        if (shapeType.value === 'rect') {
            const width = currentX - startX;
            const height = currentY - startY;
            currentShape.attr({
                width: Math.abs(width),
                height: Math.abs(height),
                x: width < 0 ? currentX : startX,
                y: height < 0 ? currentY : startY
            });
        } else if (shapeType.value === 'circle') {
            const radius = Math.sqrt(
                Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
            );
            currentShape.attr({
                r: radius
            });
        }
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        if (currentShape) {
            shapes.push({
                element: currentShape,
                type: shapeType.value,
                ...getShapeData(currentShape, shapeType.value)
            });
        }
        currentShape = null;
    }

    function getShapeData(shape, type) {
        if (type === 'rect') {
            return {
                x: shape.attr('x'),
                y: shape.attr('y'),
                width: shape.attr('width'),
                height: shape.attr('height')
            };
        } else if (type === 'circle') {
            return {
                cx: shape.attr('cx'),
                cy: shape.attr('cy'),
                r: shape.attr('r')
            };
        }
    }

    clearButton.addEventListener('click', () => {
        shapes.forEach(shape => shape.element.remove());
        shapes.length = 0;
        contourPath.plot('');  // Clear the contour path
    });

    generateButton.addEventListener('click', async () => {
        const shapesData = shapes.map(shape => ({
            type: shape.type,
            ...getShapeData(shape.element, shape.type)
        }));

        const response = await fetch('/generate_contour', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shapes: shapesData,
                margin: parseFloat(marginInput.value)
            })
        });

        const data = await response.json();
        if (data.contour) {
            contourPath.plot(data.contour);
        }
    });

    downloadButton.addEventListener('click', () => {
        const svgData = svgCanvas.svg();
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}); 