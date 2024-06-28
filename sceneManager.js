import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {StartScene} from './startScene.js'
import {HallwayScene} from './hallwayScene.js'



//init renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//init Scenes
const scene1 = new StartScene();
const scene2 = new HallwayScene();
var scenes = [scene1, scene2];
let activeScene = scene1;

function loadScene(i){
    activeScene = scenes[i];
    
    activeScene.start();
    renderer.setAnimationLoop(() => {
        activeScene.updateRender();
        renderer.render(activeScene.getScene(), activeScene.getCamera());
    });
}

loadScene(0);


document.addEventListener('keydown', function(e){
    if(e.code === 'Enter'){
        loadScene(1);
    }

    if(e.code === 'Escape'){
        loadScene(0);
    }
});


window.addEventListener('resize', () => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene1.getCamera().aspect = width / height;
    scene1.getCamera().updateProjectionMatrix();

    scene2.getCamera().aspect = width / height;
    scene2.getCamera().updateProjectionMatrix();
});
