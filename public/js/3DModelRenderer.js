const scenee = new THREE.Scene();

const modelViewDive = document.getElementById('modelViewCheck');
const cameraa = new THREE.PerspectiveCamera(75, modelViewDive.clientWidth / modelViewDive.clientHeight, 0.01, 2000);
const rendererr = new THREE.WebGLRenderer({ antialias: true });
rendererr.setSize(modelViewDive.clientWidth, modelViewDive.clientHeight);
rendererr.setPixelRatio(window.devicePixelRatio);
modelViewDive.appendChild(rendererr.domElement);

// Create the canvas for the gradient background
const canvas = document.createElement('canvas');
canvas.width = 512; // Texture resolution
canvas.height = 512;
const context = canvas.getContext('2d');

const gridHelper = new THREE.GridHelper(5, 5,0x555555, 0x555555); // Size and divisions
scenee.add(gridHelper);


// Create a gradient from dark gray in the center to black at the edges
const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
gradient.addColorStop(0, '#333333'); // Dark gray (center)
gradient.addColorStop(1, '#0a0a0a'); // Black (outer edges)

// Apply the gradient to the canvas
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

// Create a texture from the canvas
const texture = new THREE.CanvasTexture(canvas);

// Set the texture as the background of the scene
scenee.background = texture;

// OrbitControls for the cameraa
const controlss = new THREE.OrbitControls(cameraa, rendererr.domElement);
controlss.enableDamping = true;  // Smooth rotation
controlss.dampingFactor = 0.25;
controlss.screenSpacePanning = false;
controlss.maxPolarAngle = Math.PI / 2;  // Prevent cameraa from flipping
controlss.target.set(0, 0, 0); // Rotate around the center of the model

controlss.autoRotate = false; // Enables automatic rotation
controlss.autoRotateSpeed = 2.0;

// Add lights to the scenee
const ambientLightt = new THREE.AmbientLight(0x404040, 0.5); // Lower intensity
scenee.add(ambientLightt);

// Add directional lights with controlled intensity
const directionalLightt1 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLightt1.position.set(-1, 1, 1).normalize();
scenee.add(directionalLightt1);

const directionalLightt2 = new THREE.DirectionalLight(0xffffff, 0.7); //0.2 for the rotation of lights other wise 0.7
directionalLightt2.position.set(1, -1, -1).normalize();
scenee.add(directionalLightt2);

// Load the OBJ model without MTL
const objLoaderr = new THREE.OBJLoader();

objLoaderr.load('/3Dmodels/merged.obj', function (object) {
    // Center the model
    const boxx = new THREE.Box3().setFromObject(object);
    const centerr = boxx.getCenter(new THREE.Vector3());
    object.position.sub(centerr); // Center the model

    // Move the model up so that it stands on the grid
    const heightt = boxx.max.y - boxx.min.y; // Get the height of the model
    object.position.y += heightt / 2; // Adjust

    // Change the material for better lighting response
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0xffffff, // Default color; change as needed
                roughness: 0, // Adjust to control surface roughness
                metalness: 0, // Adjust for a more realistic look
                side: THREE.DoubleSide // Render both sides
            });
        }
    });
    scenee.add(object);

    const modelHeight = boxx.max.y - boxx.min.y;
    const modelWidth = boxx.max.x - boxx.min.x;
    cameraa.position.set(0, modelHeight / 2, modelHeight); // Position the camera higher based on model height
    controlss.target.set(0, modelHeight / 2, 0);
}, undefined, function (error) {
    console.error('An error occurred while loading the OBJ model:', error);
});

// Camera positioning
cameraa.position.z = 2;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    //for the rotation of lights
    //directionalLightt2.position.x = 10 * Math.cos(Date.now() * 0.001);
    //directionalLightt2.position.z = 10 * Math.sin(Date.now() * 0.001);
    controlss.update(); // Update controls
    rendererr.render(scenee, cameraa);
}

animate();

// Handle window resizing
window.addEventListener('resize', function () {
    const widthh = modelViewDive.clientWidth;
    const heightt = modelViewDive.clientHeight;
    cameraa.aspect = widthh / heightt;
    cameraa.updateProjectionMatrix();
    rendererr.setSize(widthh, heightt);
});
