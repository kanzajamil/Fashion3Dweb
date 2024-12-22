const fs = require('fs');
const path = require('path');

function mergeObjFiles(filePaths, outputFile, invertAxes = []) {
    console.log("i ran");
    let vertexOffset = 0;
    let objectCounter = 1; // Counter to generate unique object names
    let output = '';

    filePaths.forEach(filePath => {
        // Add a unique object name for each OBJ file
        const newObjectName = `o MyObject${objectCounter}`;
        output += newObjectName + '\n';
        objectCounter++;

        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');

        lines.forEach(line => {
            if (line.startsWith('v ')) {
                // Vertex line
                let parts = line.split(' ');
                
                // Apply axis inversions
                if (invertAxes.includes('y')) {
                    parts[2] = (-parseFloat(parts[2])).toString();
                }
                if (invertAxes.includes('z')) {
                    parts[3] = (-parseFloat(parts[3])).toString();
                }
                
                output += parts.join(' ') + '\n';
            } else if (line.startsWith('f ')) {
                // Face line, adjust indices with the vertex offset
                const parts = line.split(' ');
                const faceIndices = parts.slice(1).map(idx => {
                    const vertexIndex = parseInt(idx.split('/')[0]);
                    return (vertexIndex + vertexOffset).toString();
                });
                output += `f ${faceIndices.join(' ')}\n`;
            }
        });

        // Update vertex offset by counting vertex lines in the current file
        const vertexCount = lines.filter(line => line.startsWith('v ')).length;
        vertexOffset += vertexCount;
    });

    // Write merged data to the output file
    fs.writeFileSync(outputFile, output);
    console.log(`Merged OBJ saved to ${outputFile}`);
}

// Example usage
module.exports = mergeObjFiles;