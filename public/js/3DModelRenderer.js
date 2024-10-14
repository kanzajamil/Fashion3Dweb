const scene = new THREE.Scene();


const modelViewDiv = document.getElementById('modelView');
const camera = new THREE.PerspectiveCamera(75, modelViewDiv.clientWidth / modelViewDiv.clientHeight, 0.01, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(modelViewDiv.clientWidth, modelViewDiv.clientHeight);
renderer.setPixelRatio( window.devicePixelRatio );
modelViewDiv.appendChild(renderer.domElement);

// OrbitControls for the camera
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth rotation
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;  // Prevent camera from flipping
controls.target.set(0, 0, 0); // Rotate around the center of the model

// Add lights to the scene

const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Lower intensity
scene.add(ambientLight);

// Add directional lights with controlled intensity
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight1.position.set(-1, 1, 1).normalize();
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight2.position.set(1, -1, -1).normalize();
scene.add(directionalLight2);

//const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
//directionalLight3.position.set(-1, -1, 1).normalize();
//scene.add(directionalLight3);

// Load the OBJ model without MTL
const objLoader = new THREE.OBJLoader();

objLoader.load('/3Dmodels/merged.obj', function (object) {
    // Center the model
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center); // Center the model

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
    scene.add(object);
}, undefined, function (error) {
    console.error('An error occurred while loading the OBJ model:', error);
});

// Camera positioning
camera.position.z = 1.5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', function () {

    const width = modelViewDiv.clientWidth;
    const height = modelViewDiv.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
