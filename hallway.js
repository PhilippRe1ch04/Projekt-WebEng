import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

//init enviroment
const scene = new THREE.Scene(); //init scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //init cam
const renderer = new THREE.WebGLRenderer(); //init renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

const amlight = new THREE.AmbientLight(0x404040, 80); // soft white light
scene.add(amlight);

const light = new THREE.DirectionalLight(0x404040, 80); // soft white light
light.position.set(5,5,0);
light.castShadow = true;
scene.add(light);

const way = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1000, 1, 1), new THREE.MeshStandardMaterial({color: 0x36454F}));
way.rotation.x = -Math.PI/2;
way.position.y = -0.01;
way.receiveShadow = true;
scene.add(way);

const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3, 1000, 32, 32), new THREE.MeshStandardMaterial({color: 0x8b0000}));
carpet.rotation.x = -Math.PI/2;
carpet.position.y = 0;
carpet.receiveShadow = true;
scene.add(carpet);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 32, 32), new THREE.MeshStandardMaterial({color: 0x010101}));
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.02;
ground.receiveShadow = true;
scene.add(ground);

const loader = new GLTFLoader();
let mixer;
let action;
let action2;

camera.position.z = 5;
camera.position.y = 5;
camera.rotation.x = -0.3;

const clock = new THREE.Clock();


loader.load('public/gentle_stickman.glb', function (gltf) {
    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    const model = gltf.scene;
    model.rotation.y = Math.PI;
    model.castShadow = true; //default is false
    model.receiveShadow = false; //default
	scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    action = mixer.clipAction(clips[0]);
    action2 = mixer.clipAction(clips[1]);
    action.play();

}, undefined, function (error) {

	console.error(error);
});

let animationState = 0;
window.addEventListener('keydown', function(e) {
    if(e.code === 'ArrowUp'){
        if(animationState != 1){
            animationState = 1;
            action2.reset();
            action2.play();
            action.crossFadeTo(action2, 1);
        } 
        
    }
});

window.addEventListener('keyup', function(e) {
    if(e.code === 'ArrowUp'){
        if(animationState != 0){
            animationState = 0;
            action.reset();
            action.play();
            action.crossFadeFrom(action2, 1);
        }
    }
});

window.addEventListener('resize', () => {
    // update display width and height
    let width = window.innerWidth;
    let height = window.innerHeight;
    // update camera aspect
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // update renderer
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);
});


function animate() {
    if(mixer) {
        const delta = clock.getDelta();
        mixer.update(delta/1.5);
    }
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);