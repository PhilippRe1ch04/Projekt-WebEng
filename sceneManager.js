import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {StartScene} from './startScene.js'
import {HallwayScene} from './hallwayScene.js'

var scenes;
var activeScene;

var renderer;

function initRenderer(){
    //init renderer
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function initScenes(){
    //init Scenes
    const scene1 = new StartScene();
    const scene2 = new HallwayScene();
    scenes = [scene1, scene2];
}

export function loadScene(i){ //function to switch between scenes
    if(activeScene) activeScene.exit(); //exit old scene
    activeScene = scenes[i];

    activeScene.start(); //open new scene
    renderer.setAnimationLoop(() => {
        activeScene.updateRender();
        renderer.render(activeScene.getScene(), activeScene.getCamera());
    });
}

initRenderer();
initScenes();
loadScene(0);
window.loadScene = loadScene;

window.addEventListener('resize', () => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scenes.forEach((scene) => {
        scene.getCamera().aspect = width / height;
        scene.getCamera().updateProjectionMatrix();
    });
});
