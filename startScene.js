import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

//init renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/ window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setAnimationLoop(animate);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const amlight = new THREE.AmbientLight(0x404040, 30); // soft white light
scene.add(amlight);

const dirlight = new THREE.DirectionalLight(0x404040, 80); //soft light
dirlight.position.set(-5,5,3);
dirlight.castShadow = true;
scene.add(dirlight);


//Set up shadow properties for the light
dirlight.shadow.mapSize.width = 2024;
dirlight.shadow.mapSize.height = 2024;
dirlight.shadow.camera.near = 0.5;
dirlight.shadow.camera.far = 500;

const loader = new GLTFLoader();
let skybox;
loader.load('public/skybox.glb', function (gltf){
    skybox = gltf.scene;
    scene.add(skybox);

}, undefined, function (error){
    console.error(error);
});

let mixer;
let action;

loader.load('public/gentle_stickman.glb', function (gltf){
    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    const model = gltf.scene;
    model.position.set(1, 0, 5);
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    action = mixer.clipAction(clips[0]);
    action.play();

}, undefined, function (error){
    console.error(error);
});

loader.load('public/Art_Gallery.glb', function (gltf){
    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    const model = gltf.scene;
    model.rotation.y = Math.PI;
    scene.add(model);

}, undefined, function (error){
    console.error(error);
});

camera.position.z = 12;
camera.position.y = 5;


const clock = new THREE.Clock();


function animate() {
    if(skybox){
        skybox.rotation.y += 0.0001;
    }
    if(mixer){
        const delta = clock.getDelta();
        mixer.update(delta/1.5);
    }
    
	renderer.render(scene, camera);
}

