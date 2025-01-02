var toptexturee="";
var bodytexturee="";
var bottomtexturee="";
var objecttypee="";
let bodyModell,bottomModell,topModell;
let summodell;

function render3DModelObj(obj, divId) {
//window.render3DModel = function(modelPath, divId) {
    const scene = new THREE.Scene();

    // Get the div where the model will be rendered
    const modelViewDiv = document.getElementById(divId);

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, modelViewDiv.clientWidth / modelViewDiv.clientHeight, 0.01, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(modelViewDiv.clientWidth, modelViewDiv.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    modelViewDiv.appendChild(renderer.domElement);

    // OrbitControls for the camera
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // Smooth rotation
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;  // Prevent camera from flipping
    controls.target.set(0, 0, 0);  // Rotate around the center of the model

    // Add lights to the scene
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);  // Lower intensity
    scene.add(ambientLight);
    scene.background = new THREE.Color('#1e1e1e');
    // Add directional lights with controlled intensity
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight1.position.set(-1, 1, 1).normalize();
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight2.position.set(1, -1, -1).normalize();
    scene.add(directionalLight2);
    obj.scale.set(.8, .8, .8);
    // Check if the object is valid
    if (obj instanceof THREE.Object3D) {
        // Center the model
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        obj.position.sub(center);  // Center the model
       
        // Change the material for better lighting response
        obj.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,  // Default color; change as needed
                    roughness: 0,  // Adjust to control surface roughness
                    metalness: 0,  // Adjust for a more realistic look
                    side: THREE.DoubleSide  // Render both sides
                });
            }
        });

        // Add the model to the scene
        // Assuming 'model' is your 3D object loaded into the scene
       // Invert vertically by scaling Y by -1

        scene.add(obj);
    } else {
        console.error('The object passed is not a valid THREE.Object3D instance.');
        return;
    }

    // Camera positioning
    camera.position.z = 1.5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();  // Update controls
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
}

window.init = function(combinepath,t,b,bd, divId) {
    const loader = new THREE.OBJLoader();
    console.log(combinepath);
    loader.load(combinepath, function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                if (child.name === 'MyObject1') {
                    console.log(child);
                    console.log(t);
                    topModell=child;
                    
                } else if (child.name === 'MyObject2') {
                    // Apply texture to MyObject2
                    console.log(child);
                    console.log(b);
                    bottomModell=child;
                   
                    
                }
                else if (child.name === 'MyObject3') {
                    console.log(child);
                    console.log(bd);
                    // Apply texture to MyObject2
                    bodyModell=child;
                    if(bd!==null){
                        generateTexture(child,bd,1.0);}
                }
                
            }
    });
    summodell=object;
    render3DModelObj(summodell, divId)
    if(t!==null){
        generateTexture(topModell,t,1.0);}
    if(b!==null){
            generateTexture(bottomModell,b,1.0);}
    if(bd!==null){
                generateTexture(bodyModell,bd,1.0);}
    //scene.add(object); // Add the loaded object to the scene
    
});
}

function generateTexture(obj, texturePath, scaleFactor = 1.0) {
    if (!texturePath) {
        console.error('Texture data URL is not defined!');
        return;
    }
    console.log("Texture Path:", texturePath);  // Check this in the console

    if(objecttypee=="top"){
        console.log("xaviersobased");
        toptexturee=texturePath;
    }
    if(objecttypee=="bottom"){
        console.log("xaviercring");
        bottomtexturee=texturePath;
    }
    if(objecttypee=="body"){
        console.log("xanoy");
        bodytexturee=texturePath;
    } 
   
    firsttexture=true;
    console.log("successs");
    // Load texture and apply it to the existing model
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath, () => {
        console.log('Texture loaded successfully'); // Add this line to confirm it's loaded
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
    }, undefined, (error) => {
        console.error('Error loading texture:', error);
    });
    
    
    // Apply texture to the rendered object (assuming it's already rendered)
    obj.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            geometry.computeBoundingBox();
            const min = geometry.boundingBox.min;
            const max = geometry.boundingBox.max;
            const size = new THREE.Vector3().subVectors(max, min);

            const uvAttribute = geometry.getAttribute('position').array;
            const uvs = [];

            for (let i = 0; i < uvAttribute.length; i += 3) {
                const x = (uvAttribute[i] - min.x) / size.x;
                const y = (uvAttribute[i + 1] - min.y) / size.y;
                uvs.push(x * scaleFactor, y * scaleFactor);
            }
          

            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            child.material = new  THREE.MeshStandardMaterial({
                map: texture,       // Apply the texture
                roughness: 1,       // Adjust roughness for material surface appearance
                side: THREE.DoubleSide, // Make sure both sides of the geometry are visible
                flatShading: false, // Ensure smooth shading (not flat)
                metalness: 0.1,     // Low metalness for a more matte look
                normalMap: child.material.normalMap,
            });
            child.userData.originalMaterial = child.material;

            child.userData.isHighlighted=false;
        }
    });
}
