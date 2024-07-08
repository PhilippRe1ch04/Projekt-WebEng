import * as THREE from 'three';
import {StartScene} from './startScene.js'
import {HallwayScene} from './hallwayScene.js'

var scenes;
var activeScene;

var renderer;

export function viewLogin(){
    let loginDiv = document.getElementById("loginPopUp");
    loginDiv.style.visibility = 'visible';
}

export function closeLogin(){
    let loginDiv = document.getElementById("loginPopUp");
    loginDiv.style.visibility = 'hidden';
}

export function viewContent(){
    document.getElementById('content').style.visibility = "visible";
}

export function closeContent(){
    document.getElementById('content').style.visibility = 'hidden';
    activeScene.addListeners();
}


export function loadScene(i){ //function to switch between scenes
    if(activeScene == scenes[0]){
        console.log("active scene: start");
    }else if (activeScene == scenes[1]){
        console.log("active scene: hallway");
    }

    if(activeScene) activeScene.exit(); //exit old scene
    activeScene = scenes[i];

    activeScene.start(); //open new scene
    if(activeScene == scenes[0]){
        console.log("active scene: start");
    }else if (activeScene == scenes[1]){
        console.log("active scene: hallway");
    }
    renderer.setAnimationLoop(() => {
        activeScene.updateRender();
        renderer.render(activeScene.getScene(), activeScene.getCamera());
    });
}

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

initRenderer();
initScenes();
loadScene(0);
window.loadScene = loadScene;
window.viewLogin = viewLogin;
window.closeLogin = closeLogin;
window.closeContent = closeContent;

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

export function getActiveScene(){
    return activeScene;
}