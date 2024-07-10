import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

var mouseX = 0, mouseY = 0; //store value of mouse position on screen

//HallwayScene class is instantiating a scene
export class StartScene {
    constructor() {//called once at the beginning
        //init main objecs
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();
        
        //init enviroment
        this.initEnv();

        //init clock
        this._clock.start();
    }

    //function called everytime the scene is loaded
    start(){
        this.loadOverlay();
        this.addListeners();

        this._clock.elapsedTime = 0;
    }

    //function called by sceneManager to update renderer (called every frame)
    updateRender() {
        const delta = this._clock.getDelta();

        //rotate sky
        if (this.skybox) { 
            this.skybox.rotation.y += 0.0001;
        }

        //play stickman idle animation
        if (this.animmixer_pl) { 
            this.animmixer_pl.update(delta / 1.5);
        }

        //if 5 seconds elapsed --> show enter key reminder
        if(this._clock.elapsedTime > 5){
            this._scene.add(this.enterKey);
            this.animmixer_key.update(delta/1.5);
        }

         //stickman look at mouse position
        if(this.stickman) this.stickman.lookAt(mouseX, 0, 30);
    }

    //function to init light in scene
    initLight() {
        const amlight = new THREE.AmbientLight(0x404040, 30); // soft white background light
        this._scene.add(amlight);

        const dirlight = new THREE.DirectionalLight(0xFFFF9D, 5); //soft sun light
        dirlight.position.set(-50, 50, 30);
        dirlight.castShadow = true;
        this._scene.add(dirlight);

        //Set up shadow properties for the light
        dirlight.shadow.mapSize.width = 2048;
        dirlight.shadow.mapSize.height = 2048;

        dirlight.shadow.bias = -0.001; //remove noice
        //camera render settings for shadow
        dirlight.shadow.camera.left = -50;
        dirlight.shadow.camera.right = 50;
        dirlight.shadow.camera.top = 50;
        dirlight.shadow.camera.bottom = -50;
    }

    //function to load and return 3d model
    initModel(path, onLoadCallback) {
        const loader = new GLTFLoader();
        //load model
        loader.load(path, (gltf) => {
            //cast shadow --> every mesh in model
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const model = gltf.scene;
            onLoadCallback(model, gltf.animations); //return model and animations
        }, undefined, (error) => {
            console.error(error);
        });
    }

    //function to init enviroment of scene
    initEnv() {
        this.initLight();

        //add building to scene
        this.initModel('src/3d/Art_Gallery.glb', (artGallery) => {
            artGallery.rotation.y = Math.PI; //rotate obj
            this._scene.add(artGallery);
        });
        //add skybox
        this.initModel('src/3d/skybox.glb', (skybox) => {
            this.skybox = skybox;
            this._scene.add(this.skybox);
        });
        //add stickman
        this.initModel('src/3d/gentle_stickman.glb', (stickman, animations) => {
            this.stickman = stickman;
            this.stickman.position.set(1, 0, 5); //set pos
            

            //play idle anim of stickman
            this.animmixer_pl = new THREE.AnimationMixer(stickman);
            const action = this.animmixer_pl.clipAction(animations[0]);
            action.play();
            this._scene.add(this.stickman);
        });

        //init enter key (reminder after 5 seconds)
        this.initModel('src/3d/keyboard_enter.glb', (enterKey, animations) => {
            this.enterKey = enterKey;
            this.enterKey.position.set(-0.5, 0, 6);

            this.animmixer_key = new THREE.AnimationMixer(enterKey);
            
            animations.forEach((clip) => {
                const action = this.animmixer_key.clipAction(clip);
                action.play();
            });
        });

        this._camera.position.set(0, 5, 14); //set camera position
    }

    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }

    //add listeners and bind them to this scene object (variable access)
    addListeners(){
        this.boundMousemove = this.mousemove.bind(this);
        this.boundKeydown = this.keydown.bind(this);
        
        document.addEventListener('mousemove', this.boundMousemove);
        document.addEventListener('keydown', this.boundKeydown);
    }

    //remove EventListeners
    removeListeners(){
        document.removeEventListener('keydown', this.boundKeydown);
        document.removeEventListener('mousemove', this.boundMousemove);
    }

    //on keydown input
    keydown(e){
        //if enter is pressed --> load hallway scene
        if(e.code === 'Enter'){
            loadScene(1);
        }
    }

    //if mouse moves --> update variables
    mousemove(e){
        mouseX = (e.clientX - window.innerWidth / 2) *0.02;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.02;
    }

    //load overlay (welcomeText)
    loadOverlay(){
        var overlayDiv = document.getElementById("overlay");
        var welcomeSection = document.createElement('div');
        welcomeSection.id = 'welcomeDiv';
        welcomeSection.innerHTML = '<p>Welcome to the first online Art Gallery <br>Please enter to see the most famous arts. <br>Have fun!</p>';
        overlayDiv.appendChild(welcomeSection);
    }

    //function called by sceneManager on exiting scene
    exit(){
        document.removeEventListener('mousemove', this.boundMousemove);
        document.removeEventListener('keydown', this.boundKeydown);

        document.getElementById("overlay").removeChild(document.getElementById("welcomeDiv"));
    }
}
