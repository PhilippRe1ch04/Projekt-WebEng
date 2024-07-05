import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

var mouseX = 0, mouseY = 0;

export class StartScene {
    constructor() {
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();

        this.initEnv();

        this._clock.start();
    }

    start(){
        this.loadOverlay();
        this.addListeners();
    }

    updateRender() {
        if (this.skybox) { //rotate sky
            this.skybox.rotation.y += 0.0001;
        }
        if (this.animmixer_pl) { //play stickman idle animation
            const delta = this._clock.getDelta();
            this.animmixer_pl.update(delta / 1.5);
        }

        if(this._clock.elapsedTime > 5){
            this._scene.add(this.enterKey);
            const delta = this._clock.getDelta();
            this.animmixer_key.update(delta * 80);
        }

        
        if(this.stickman) this.stickman.lookAt(mouseX, 0, 30); //stickman look at mouse
    }

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

    initModel(path, onLoadCallback) {
        const loader = new GLTFLoader();
        //load model
        loader.load(path, (gltf) => {
            //cast shadow = true
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

    initEnv() {
        this.initLight();

        this.initModel('src/3d/Art_Gallery.glb', (artGallery) => {
            artGallery.rotation.y = Math.PI; //rotate obj
            this._scene.add(artGallery);
        });

        this.initModel('src/3d/skybox.glb', (skybox) => {
            this.skybox = skybox;
            this._scene.add(this.skybox);
        });

        this.initModel('src/3d/gentle_stickman.glb', (stickman, animations) => {
            this.stickman = stickman;
            this.stickman.position.set(1, 0, 5); //set pos
            

            //play idle anim of stickman
            this.animmixer_pl = new THREE.AnimationMixer(stickman);
            const action = this.animmixer_pl.clipAction(animations[0]);
            action.play();
            this._scene.add(this.stickman);
        });

        this.initModel('src/3d/keyboard_enter.glb', (enterKey, animations) => {
            this.enterKey = enterKey;
            this.enterKey.position.set(-0.5, 0, 6);

            this.animmixer_key = new THREE.AnimationMixer(enterKey);
            
            animations.forEach((clip) => {
                const action = this.animmixer_key.clipAction(clip);
                action.play();
            });
        });

        this._camera.position.set(0, 5, 14);
    }

    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }

    addListeners(){
        this.boundMousemove = this.mousemove.bind(this);
        this.boundKeydown = this.keydown.bind(this);
        
        document.addEventListener('mousemove', this.boundMousemove);
        document.addEventListener('keydown', this.boundKeydown);
    }

    keydown(e){
        if(e.code === 'Enter'){
            loadScene(1);
        }
    }

    mousemove(e){
        mouseX = (e.clientX - window.innerWidth / 2) *0.02;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.02;
    }

    loadOverlay(){
        var overlayDiv = document.getElementById("overlay");
        var welcomeSection = document.createElement('div');
        welcomeSection.id = 'welcomeDiv';
        welcomeSection.innerHTML = '<p>Welcome to the first online Art Gallery <br>Please enter to see the most famous arts. <br>Have fun!</p>';
        overlayDiv.appendChild(welcomeSection);
    }

    exit(){
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('keydown', this.keydown);

        document.getElementById("overlay").removeChild(document.getElementById("welcomeDiv"));
    }
}
