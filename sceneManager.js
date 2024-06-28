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

renderer.setAnimationLoop(() => {
    scene1.updateRender();
    renderer.render(scene1.getScene(), scene1.getCamera());
});


document.addEventListener('keydown', function(e){
    if(e.code === 'Enter'){
        renderer.setAnimationLoop(() => {
            scene2.updateRender();
            renderer.render(scene2.getScene(), scene2.getCamera());
        });
    }

    if(e.code === 'Escape'){
        renderer.setAnimationLoop(() => {
            scene1.updateRender();
            renderer.render(scene1.getScene(), scene1.getCamera());
        });
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
