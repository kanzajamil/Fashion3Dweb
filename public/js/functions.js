let renderedobj;
let summodel;
var textureimage;
var toptexture="";
var bodytexture="";
var bottomtexture="";
var objecttype="";
let selectedObject;
const objects = []; // To store each part



function imo(){
    console.log("hbjvkmc");
   
}

let currentModelPath = ''; // Global variable to keep track of the current model path

function initializeFileInput(model, objtype) {
    console.log(renderedobj);
    objecttype=objtype;
    console.log(objecttype)

    removeHighlightIfApplied(selectedObject);
    
    applyHighlightMaterial(model);
    
    // Only proceed if the model path is different
    /**  if (currentModelPath === modelpath) {
        return; // No need to re-initialize if the same model is already loaded
    }

    console.log("Initializing model with path:", modelpath);*/

    const fileInput = document.getElementById('inputGroupFile01');

    // Clear the current scene or model here
    
    //updateselectedModel(modelpath);
    // Update the current model path
    //currentModelPath = modelpath;

    // Reset and reattach the file input event listener
    //const newFileInput = fileInput.cloneNode(true);
    //fileInput.parentNode.replaceChild(newFileInput, fileInput);
    
    renderedobj=model;
    fileInput.addEventListener('change', function(event) {
        filetinker(event.target, model); // Pass modelpath dynamically
    });
    
}
function loadtextures(t,b,bd){
    console.log("summoned");
}

async function savechanges() {
    closedownloadModal2();
    const urlParts = window.location.pathname.split('/');
    const modelId = urlParts[urlParts.length - 1]; 

    const textures = {
        top: toptexture,
        bottom: bottomtexture,
        body: bodytexture,
    };

    console.log(textures);

    try {
        const response = await fetch(`/modeledit/${modelId}/save-textures`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(textures),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Changes Saved!');
            console.log('Textures saved successfully:', result);
        } else {
            console.error('Failed to save textures:', response.status);
        }
    } catch (error) {
        console.error('Error saving textures:', error);
    }
}



function selectTexture(texturePath) {
    // Get the file input element
    const fileInput = document.getElementById("inputGroupFile01");

    // Notify the user about the selected texture
    console.log("Texture selected:", texturePath);

    // Create a Blob object for the texture file
    fetch(texturePath)
        .then((response) => response.blob())
        .then((blob) => {
            // Create a File object
            const file = new File([blob], "selectedTexture.jpeg", { type: "image/jpeg" });

            // Simulate the file selection
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            // Log the file for debugging
            //console.log(selectedObject);
            //filetinker(fileInput.files[0],selectedObject);
            console.log("File added to input:", fileInput.files[0]);
            filetinker(fileInput, selectedObject); 
            console.log("textureapplied bfghjnkm");

        })
        .catch((error) => {
            console.error("Error selecting texture:", error);
        });
        
    
}


// Function to clear the current model/scene
function clearCurrentModel() {
    // Your logic to clear the current model or scene
    const modelViewDiv = document.getElementById('modelViewDiv');
    // Assuming you have a method to clear or dispose of the current THREE.js model
    if (modelViewDiv) {
        // For example, if you are using THREE.js:
        while (modelViewDiv.firstChild) {
            modelViewDiv.removeChild(modelViewDiv.firstChild);
        }
    }
    
}

function updateselectedModel(objPath) {
    const loader = new THREE.OBJLoader();
    loader.load(
        objPath,
        (object) => {
            renderedobj = object;
        
        },
        (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
        (error) => console.error('Error loading OBJ file:', error)
    );
}

function loadTexturelessModel(objPath) {
    const loader = new THREE.OBJLoader();
    loader.load(
        objPath,
        (object) => {
            renderedobj = object;
            render3DModelFromObj(renderedobj); // Render the model without any texture
        },
        (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
        (error) => console.error('Error loading OBJ file:', error)
    );
}

function exportToGLB(object) {
    closedownloadModal();
    object=summodel;
    const exporter = new THREE.GLTFExporter();

    exporter.parse(object, (gltf) => {
        const blob = new Blob([gltf], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'model.glb'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }, { binary: true });
}
function exportToSTL(object) {
    // Assuming 'renderedobj' contains your Three.js object
    closedownloadModal();
    const exporter = new THREE.STLExporter();

    // Export the object to STL format
    const stlString = exporter.parse(object);

    // Create a Blob from the STL string
    const blob = new Blob([stlString], { type: 'application/octet-stream' });

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'model.stl'; // Specify the STL filename

    // Append the link to the document, trigger the download, and remove the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(link.href);
}
function filetinker(inputElement,model) {
    // Your original filetinker logic here
    console.log("File selected.");
    if (inputElement.files.length > 0) {
        const file = inputElement.files[0];  // Get the selected file
        const reader = new FileReader();

        reader.onload = function(event) {
            const textureDataURL = event.target.result; 
            textureimage=textureDataURL; // This is the image file as a Data URL
            
            generateTexture(model,textureDataURL , 1.0);  // Pass the Data URL to your function
        };

        // Read the file as a Data URL (base64 string)
        reader.readAsDataURL(file);
    } else {
        alert('No file selected.');
    }
}

function toggleMenu() {
    const menu = document.getElementById('formatSelect');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
  function toggleMenu2() {
    const menu = document.getElementById('formatSelectt');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
  

 
  function closedownloadModal(){
    document.getElementById('formatSelect').style.display = 'none';
  }

  function closedownloadModal2(){
    document.getElementById('formatSelectt').style.display = 'none';
  }
  
  

  let firsttexture=false;
  function generateTexture(obj, texturePath, scaleFactor = 1.0) {
    if (!texturePath) {
        console.error('Texture data URL is not defined!');
        return;
    }
    console.log("Texture Path:", texturePath);  // Check this in the console

    if(objecttype=="top"){
        console.log("xaviersobased");
        toptexture=texturePath;
    }
    if(objecttype=="bottom"){
        console.log("xaviercring");
        bottomtexture=texturePath;
    }
    if(objecttype=="body"){
        console.log("xanoy");
        bodytexture=texturePath;
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


let bodyModel,bottomModel,topModel;
function loadcombineModel(objPath, name) {
    const loader = new THREE.OBJLoader();
    loader.load(
        objPath,
        (object) => {
            object.name = name;
            object.scale.set(1, -1, 1);
            objects.push(object); // Add to the raycasting array
            if (name === 'body') {
                bodyModel = object;
            } else if (name === 'top') {
                topModel = object;
            } else if (name === 'bottom') {
                bottomModel = object;
            }
            centerAndAddObject(object);
        
        },
        (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
        (error) => console.error('Error loading OBJ file:', error)
    );
}


let isLightRotating = false; 
function render3DModelFromObj(obj) {
    const scenee = new THREE.Scene();

const modelViewDive = document.getElementById('modelViewDiv');
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
gridHelper.position.set(0, 0, 0); 
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
let isGrayBackground = false;
const backTooltip = document.getElementById('backTooltip');
document.getElementById('togglebackground').addEventListener('click', function () {

    isGrayBackground = !isGrayBackground;
    if (isGrayBackground) {

        scenee.background = new THREE.Color('#767676');
        backTooltip.textContent = 'Background- On';
        // Switch back to the gradient background
    } else {
        // Switch to solid gray background
        backTooltip.textContent = 'Background - Off';
        scenee.background = texture;
    }


    // Optionally, show tooltip on hover dynamically
    backTooltip.classList.add('show');

    // Hide tooltip after a short delay (optional)
    setTimeout(() => {
        backTooltip.classList.remove('show');
    }, 1000);
});

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

const originalLightPosition = {
    x: directionalLightt2.position.x,
    y: directionalLightt2.position.y,
    z: directionalLightt2.position.z,
};

let initialCameraPosition = {
    x: cameraa.position.x,
    y: cameraa.position.y,
    z: cameraa.position.z
};
let initialCameraTarget = {
    x: controlss.target.x,
    y: controlss.target.y,
    z: controlss.target.z
};

let isWireframeVisible = false;

if (obj instanceof THREE.Object3D) {
    // Center the model
    const boxx = new THREE.Box3().setFromObject(obj);
    const centerr = boxx.getCenter(new THREE.Vector3());
    const size = boxx.getSize(new THREE.Vector3()); 
    obj.position.sub(centerr);  // Center the model

    const tiltAngle = Math.PI / 32; // Adjust this for more/less tilt
    obj.rotation.x = -tiltAngle;

    const heightt = boxx.max.y - boxx.min.y; // Get the height of the model
    obj.position.y += heightt + 0.3;

        pivot = new THREE.Group();
        pivot.add(obj);
        scenee.add(pivot);
    
    console.log(`Model Size: ${size.x}, ${size.y}, ${size.z}`);
    console.log(`Model Position: ${obj.position.x}, ${obj.position.y}, ${obj.position.z}`);

    // Change the material for better lighting response
    obj.traverse(function (child) {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0xffffff,  // Default color; change as needed
                roughness: 0,  // Adjust to control surface roughness
                metalness: 0,  // Adjust for a more realistic look
                side: THREE.DoubleSide  // Render both sides
            });
            
            const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
            const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

            // Initially hide the wireframe
            wireframe.visible = false;

            // Add wireframe as a child object
            child.add(wireframe);
            wireframe.renderOrder = 1; 
            
        }
    });

   

    scenee.add(obj);
    
    const modelHeight = boxx.max.y - boxx.min.y;
    const modelWidth = boxx.max.x - boxx.min.x;
    cameraa.position.set(0, modelHeight / 2, modelHeight); // Position the camera higher based on model height
    controlss.target.set(0, modelHeight / 2, 0);
} else {
    console.error('The object passed is not a valid THREE.Object3D instance.');
    return;
}
// Camera positioning
cameraa.position.z = 2;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (isLightRotating) {
        directionalLightt2.position.x = 10 * Math.cos(Date.now() * 0.001);
        directionalLightt2.position.z = 10 * Math.sin(Date.now() * 0.001);
    }
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


function toggleWireframe() {
    isWireframeVisible = !isWireframeVisible;
    if (wirefTooltip) {
        wirefTooltip.textContent = isWireframeVisible ? 'Wireframe - On' : 'Wireframe - Off';
    } else {
        console.warn("Tooltip element with ID 'tooltip0' not found.");
    }
    scenee.traverse(function (child) {
        if (child.isMesh) {
            // Traverse children to find the wireframe
            child.children.forEach((subChild) => {
                if (subChild.type === 'LineSegments') {
                    subChild.visible = isWireframeVisible; // Toggle visibility
                }
            });
        }
    });

    // Toggle the flag for next use
    
}

// Attach toggle function to the button
const toggleButton = document.getElementById('toggleWireframe');
const wirefTooltip = document.getElementById('wirefTooltip');
if (toggleButton) {
    toggleButton.addEventListener('click', toggleWireframe);
} else {
    console.error("Button with ID 'toggleWireframe' not found.");
}

const toggleGridButton = document.getElementById('togglegrid');
const gridTooltip = document.getElementById('gridTooltip');


toggleGridButton.addEventListener('click', function () {
    // Toggle the grid visibility
    gridHelper.visible = !gridHelper.visible;

    // Update the tooltip text
    if (gridHelper.visible) {
        gridTooltip.textContent = 'Grid - On';
    } else {
        gridTooltip.textContent = 'Grid - Off';
    }

    // Optionally, show tooltip on hover dynamically
    gridTooltip.classList.add('show');

    // Hide tooltip after a short delay (optional)
    setTimeout(() => {
        gridTooltip.classList.remove('show');
    }, 1000); // Hide after 2 seconds
});


const modelTooltip = document.getElementById('modelTooltip');
const toggleModelButton = document.getElementById('toggleModel');
if (toggleModelButton) {
    toggleModelButton.addEventListener('click', function () {
        controlss.autoRotate = !controlss.autoRotate; // Toggle autoRotate
        if (controlss.autoRotate) {
            modelTooltip.textContent = 'Model Rotation - On';
        } else {
            modelTooltip.textContent = 'Model Rotation - Off';
        }
    
        // Optionally, show tooltip on hover dynamically
        modelTooltip.classList.add('show');
    
        // Hide tooltip after a short delay (optional)
        setTimeout(() => {
            modelTooltip.classList.remove('show');
        }, 1000); // Hide after
        console.log("AutoRotate toggled:", controlss.autoRotate);
    });
} else {
    console.error("Button with id 'toggleModel' not found.");
}


const toggleLightRotationButton = document.getElementById('toggleLightRotation');
const lightTooltip = document.getElementById('LightTooltip');


// Add event listener for toggling light rotation
toggleLightRotationButton.addEventListener('click', () => {
    isLightRotating = !isLightRotating; // Toggle the state
    if (isLightRotating) {
        lightTooltip.textContent = 'Lights Auto-Rotate - On';
        directionalLightt2.intensity = 0.2; // Set intensity for rotation mode
    } else {
        lightTooltip.textContent = 'Lights Auto-Rotatie - Off';
        directionalLightt2.intensity = 0.7; // Set default intensity
        directionalLightt2.position.set(
            originalLightPosition.x,
            originalLightPosition.y,
            originalLightPosition.z
        );
    }
    lightTooltip.classList.add('show');

    // Hide tooltip after a short delay (optional)
    setTimeout(() => {
        lightTooltip.classList.remove('show');
    }, 1000); // H
});

}

/*
    const scene = new THREE.Scene();

    // Reference a specific div by its ID (you can change 'modelViewDiv' to your desired div ID)
    const modelViewDiv = document.getElementById('modelViewDiv');
    
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
    });*/
    
// Function to open the modal
function openSaveAsModal() {
    closedownloadModal2();
    document.getElementById('saveAsModal').style.display = 'block';
}
// Function to close the modal
function closeSaveAsModal() {
    document.getElementById('saveAsModal').style.display = 'none';
}

async function saveAsModel() {
    const newTitle = document.getElementById('newModelName').value; // Get the new model name from the input
    if (!newTitle) {
        alert('Please enter a model name.');
        return;
    }

    const urlParts = window.location.pathname.split('/');
    const modelId = urlParts[urlParts.length - 1]; // Extract model ID from URL

    const textures = {
        top: toptexture,
        bottom: bottomtexture,
        body: bodytexture,
        newTitle, // Send the new title along with the textures
    };
    closeSaveAsModal();
    try {
        const response = await fetch(`/modeledit/${modelId}/save-as`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(textures),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Model saved as new model successfully:', result);
            alert('Model saved as new model!');
            closeSaveAsModal(); // Close the modal after successful save
        } else {
            console.error('Failed to save model as new model:', response.status);
            alert('Failed to save model as. Please try again.');
        }
    } catch (error) {
        console.error('Error saving model as:', error);
        alert('An error occurred while saving model as.');
    }
}





function saveOBJWithMTLLocally(object, textureDataUrl) {
    const mtlExporter = (object) => {
        let mtlContent = '';
        let hasMaterials = false;

        object.traverse((child) => {
            if (child.isMesh && child.material) {
                hasMaterials = true;
                const material = child.material;

                // Check if the material has a texture map
                if (textureDataUrl) {
                    mtlContent += `newmtl ${material.name || 'Material'}\n`;
                    mtlContent += `map_Kd ${textureDataUrl}\n`; // Use the texture data URL for the diffuse map
                    mtlContent += '\n';
                }
            }
        });

        // Only return MTL content if there are materials with a texture
        return hasMaterials && textureDataUrl ? mtlContent : null;
    };

    const objExporter = new THREE.OBJExporter();
    const objContent = objExporter.parse(object);

    // Check if the object has materials and generate MTL content
    const mtlContent = mtlExporter(object);

    // Save the OBJ file
    const objBlob = new Blob([objContent], { type: 'text/plain' });
    const objLink = document.createElement('a');
    objLink.href = URL.createObjectURL(objBlob);
    objLink.download = 'exported_model.obj'; // Specify the OBJ filename
    objLink.click();
    URL.revokeObjectURL(objLink.href);

    // Save the MTL file if there are materials and a texture
    if (mtlContent) {
        const mtlBlob = new Blob([mtlContent], { type: 'text/plain' });
        const mtlLink = document.createElement('a');
        mtlLink.href = URL.createObjectURL(mtlBlob);
        mtlLink.download = 'material.mtl'; // Specify the MTL filename
        mtlLink.click();
        URL.revokeObjectURL(mtlLink.href);

        // Update the OBJ file to reference the MTL file
        const updatedObjContent = `mtllib material.mtl\n` + objContent; // Reference the MTL file
        const updatedObjBlob = new Blob([updatedObjContent], { type: 'text/plain' });
        const updatedObjLink = document.createElement('a');
        updatedObjLink.href = URL.createObjectURL(updatedObjBlob);
        updatedObjLink.download = 'exported_model_with_mtl.obj'; // Updated OBJ filename
        updatedObjLink.click();
        URL.revokeObjectURL(updatedObjLink.href);
    }
}
let scene, camera, renderer, controls, raycaster;

const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 }); // Red color for highlighting
function applyHighlightMaterial(object) {
    object.traverse((child) => {
        if (child.isMesh) {
            // Store original material if not already stored
            if (!child.userData.originalMaterial) {
                child.userData.originalMaterial = child.material;
            }
            child.material = highlightMaterial; // Apply highlight material
            
            child.userData.isHighlighted = true; // Set highlight flag
            
        }
    });
    selectedObject = object;
}
function removeHighlightIfApplied(obj) {
    
    if (!obj || !(obj instanceof THREE.Object3D)) {
        console.error("Invalid object passed to removeHighlightIfApplied");
        return;
    }
    obj.traverse((child) => {
      
        if (child.isMesh) {
            // Check if the object has a highlighted material
            if (child.userData.isHighlighted) {
                
                // Remove the highlight by restoring the original material
                child.material = child.userData.originalMaterial;
                child.userData.isHighlighted = false;
            }
        }
    });
}


function applyColorTexture(objPath, colorHex, scaleFactor = 1.0) {
    const color = new THREE.Color(colorHex);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (optional: adjust for your use case)
    canvas.width = 512;
    canvas.height = 512;

    // Fill the canvas with the color
    ctx.fillStyle = color.getStyle();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Convert the canvas to a Data URL (base64 string)
    const texturePath = canvas.toDataURL(); // This is the base64 encoded string
    if(objecttype=="top"){
        console.log("xaviersobased");
        toptexture=texturePath;
    }
    if(objecttype=="bottom"){
        console.log("xaviercring");
        bottomtexture=texturePath;
    }
    if(objecttype=="body"){
        console.log("xanoy");
        bodytexture=texturePath;
    } 
   

    

    renderedobj.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            geometry.computeBoundingBox();
            const min = geometry.boundingBox.min;
            const max = geometry.boundingBox.max;
            const size = new THREE.Vector3().subVectors(max, min);

            const uvAttribute = geometry.getAttribute('position').array;
            const uvs = [];

            // Normalize UVs based on geometry's bounding box
            for (let i = 0; i < uvAttribute.length; i += 3) {
                const x = (uvAttribute[i] - min.x) / size.x;
                const y = (uvAttribute[i + 1] - min.y) / size.y;
                uvs.push(x * scaleFactor, y * scaleFactor);
            }

            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

            // Use MeshPhongMaterial and apply the generated texture
            child.material = new THREE.MeshPhongMaterial({
                map: texture,  // Set the generated texture
                roughness: 1,  // High roughness for a matte finish
                metalness: 0,  // Ensure no metallic effect
                flatShading: false,
            });

            child.userData.originalMaterial = child.material;
            child.userData.isHighlighted = false;
        }
    });

}







function updateStats() {
    if (!renderedobj) return;

    let totalVertices = 0;
    let totalTriangles = 0;
    let totalFaces = 0;

    renderedobj.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            const verticesCount = geometry.attributes.position.count;
            totalVertices += verticesCount;

            if (geometry.index) {
                // Indexed geometry, we can count triangles directly
                totalTriangles += geometry.index.count / 3;
            } else {
                // Non-indexed geometry
                totalTriangles += verticesCount / 3;
            }

            // Assuming each triangle represents a face
            totalFaces += totalTriangles;
        }
    });

    // Update the stats display
    const statsDiv = document.getElementById("stats");
    statsDiv.innerHTML = `
        <strong>Model Stats:</strong><br>
        Vertices: ${totalVertices}<br>
        Triangles: ${totalTriangles}<br>
        Faces (polygons): ${totalFaces}
    `;
}




// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});


function init2(combinepath,t,b,bd){
    const loader = new THREE.OBJLoader();
    console.log(combinepath);
    loader.load(combinepath, function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                if (child.name === 'MyObject1') {
                    console.log(child);
                    console.log(t);
                    topModel=child;
                    
                } else if (child.name === 'MyObject2') {
                    // Apply texture to MyObject2
                    console.log(child);
                    console.log(b);
                    bottomModel=child;
                   
                    
                }
                else if (child.name === 'MyObject3') {
                    console.log(child);
                    console.log(bd);
                    // Apply texture to MyObject2
                    bodyModel=child;
                    if(bd!==null){
                        generateTexture(child,bd,1.0);}
                }
                
            }
    });
    summodel=object;
    render3DModelFromObj(summodel)
    if(t!==null){
        generateTexture(topModel,t,1.0);}
    if(b!==null){
            generateTexture(bottomModel,b,1.0);}
    if(bd!==null){
                generateTexture(bodyModel,bd,1.0);}
    //scene.add(object); // Add the loaded object to the scene
    
});
}

