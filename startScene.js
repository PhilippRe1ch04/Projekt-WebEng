import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

var mouseX = 0, mouseY = 0;

export class StartScene {
    constructor() {
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();

        this.initEnv();
        this.addListeners();
    }

    updateRender() {
        if (this.skybox) { //rotate sky
            this.skybox.rotation.y += 0.0001;
        }
        if (this.animmixer) { //play stickman idle animation
            const delta = this._clock.getDelta();
            this.animmixer.update(delta / 1.5);
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
            this._scene.add(model);
            onLoadCallback(model, gltf.animations); //return model and animations
        }, undefined, (error) => {
            console.error(error);
        });
    }

    initEnv() {
        this.initLight();

        this.initModel('public/Art_Gallery.glb', (artGallery) => {
            artGallery.rotation.y = Math.PI; //rotate obj
        });

        this.initModel('public/skybox.glb', (skybox) => {
            this.skybox = skybox;
        });

        this.initModel('public/gentle_stickman.glb', (stickman, animations) => {
            this.stickman = stickman;
            this.stickman.position.set(1, 0, 5); //set pos
            

            //play idle anim of stickman
            this.animmixer = new THREE.AnimationMixer(stickman);
            const action = this.animmixer.clipAction(animations[0]);
            action.play();
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
        document.addEventListener('mousemove', function(e){
            mouseX = (e.clientX - window.innerWidth / 2) *0.02;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.02;
        
        });
    }
}