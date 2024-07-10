import * as THREE from 'three';
import {StartScene} from './startScene.js'
import {HallwayScene} from './hallwayScene.js'

var scenes; //store scenes in array
var activeScene; //stores active scene

var renderer; //stores active renderer

//function to show login as PopUp 
function viewLogin(){
    if(sessionStorage.getItem("uname") != null){
        sessionStorage.removeItem("uname");
        sessionStorage.removeItem("psw");
        document.getElementById("username").innerText = "guest";
        document.getElementById("loginbutton").innerText = "Login";
        return;
    }
    closeContent();
    activeScene.removeListeners();
    document.getElementById("overlay").style.backgroundColor = '#00000098';
    let loginDiv = document.getElementById("loginPopUp");
    loginDiv.style.visibility = 'visible';
}

//function to hide login PopUp
function closeLogin(){
    activeScene.addListeners();
    document.getElementById("overlay").style.backgroundColor = null;
    let loginDiv = document.getElementById("loginPopUp");
    loginDiv.style.visibility = 'hidden';
}

//function to show content of Frame as PopUp
//export --> so scene Objects can call this function
export function viewContent(postId){
    document.getElementById("overlay").style.backgroundColor = '#00000098';
    //Api call --> get all information from post
    fetch('/getPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id : postId})
    })
    .then(response => response.json())
    .then(data => {
        //set content of PopUp
        document.getElementById('content').style.visibility = "visible";
        document.getElementById('image-holder').childNodes[1].src = data[0].href;
        document.getElementById('title').innerHTML = data[0].title;
        document.getElementById('artist').innerHTML = "@" + data[0].artist;
        document.getElementById('date').innerHTML = data[0].date;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//close content PopUp
function closeContent(){
    document.getElementById("overlay").style.backgroundColor = null;
    document.getElementById('content').style.visibility = "hidden";
    activeScene.addListeners();
}

//function which is closing old scene and opening new Scene (i --> SceneID of new Scene) 
//export --> so scene Objects can call this function
export function loadScene(i){ //function to switch between scenes
    if(activeScene) activeScene.exit(); //exit old scene
    activeScene = scenes[i];
    activeScene.start(); //open new scene

    //update Renderer to render new scene on every frame
    renderer.setAnimationLoop(() => {
        activeScene.updateRender();
        renderer.render(activeScene.getScene(), activeScene.getCamera());
    });
}

//function returns current scene
//export --> so scene Objects can call this function
export function getActiveScene(){
    return activeScene;
}

//function to init Renderer
function initRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight);

    //add renderer to html document
    renderer.domElement.style.position = 'absolute';
    document.body.appendChild(renderer.domElement);
}

//function to initScenes (create scenes and add them to array)
function initScenes(){
    //init Scenes
    const scene1 = new StartScene();
    const scene2 = new HallwayScene();
    scenes = [scene1, scene2];
}

/*=================*/
//on page load:

initRenderer();
initScenes();
loadScene(0); //load startScene

window.loadScene = loadScene;
window.viewLogin = viewLogin;
window.closeLogin = closeLogin;
window.closeLogin = closeLogin;
window.closeContent = closeContent;

//add Resize-EventListener -> so renderer is responsive
window.addEventListener('resize', () => {
    //get window size
    let width = window.innerWidth;
    let height = window.innerHeight;

    //update renderer size
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //update camera aspect of both scenes
    scenes.forEach((scene) => {
        scene.getCamera().aspect = width / height;
        scene.getCamera().updateProjectionMatrix();
    });
});

