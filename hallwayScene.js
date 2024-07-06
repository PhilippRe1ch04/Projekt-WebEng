import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ArtFrame} from './artFrame.js';
import { viewContent } from './sceneManager.js';

export class HallwayScene{

    constructor(){ //called once at the beginning
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();

        this.animationState = 0;
        this.dir = 1;
        this.artFrames = [];
        this.curr = 0;
        this.lastTimeRunning = 0;
        this.showArrowKeys = 0;
        this.showEnterKey = 0;
        this.nextToImg = false;

        this.initEnv();
    }

    start(){ //called on scene load
        this.loadOverlay();
        this.addListeners();

        this._clock.elapsedTime = 0;
    }

    updateRender() {
        var worldPos = new THREE.Vector3();
        this.artFrames[this.curr].getWorldPosition(worldPos);
        const delta = this._clock.getDelta();

        if(this.animmixer) { //update animation if stickman
            this.animmixer.update(delta/1.5);
        }

        if(this.animationState == 1){ //if running
            
            this.artFrames.forEach((element) =>{ //move all artFrames towards stickman (movement)
                element.position.z += 0.1*this.dir;
            });

            if(worldPos.z > 0){ //if artFrame next to stickman, spawn a new one
                //view image in full size
                this.curr += 1;

                let artFrameX = new ArtFrame("src/klimaleugner.jpg");
                this._scene.add(artFrameX);
                var pos = 1;
                if(this.curr%2) pos = -1;
                artFrameX.position.set(10*pos, 0, -45);
                artFrameX.rotation.y = Math.PI/4*-pos;
                this.artFrames.push(artFrameX);
            }else if (worldPos.z < -15.5){
                if(this.curr != 0){
                    this.curr -= 1;
                }
            }
        }

        if(worldPos.z > -8 && worldPos.z < 0){ //show enter button if artFrame is next to stickman   
            this.animmixer_enterkey.update(delta);
            this.nextToImg = true;
            if(this.showEnterKey == 0){
                if(this.artFrames.at(this.curr).position.x < 0){
                    this.enterKey.position.x = -5;
                }else{
                    this.enterKey.position.x = 5;
                }
                this._scene.add(this.enterKey);
                this.showEnterKey = 1;
            }
        }else{
            this.nextToImg = false;
            if(this.showEnterKey == 1){
                this._scene.remove(this.enterKey);
                this.showEnterKey = 0;
            }
        }

        if(this._clock.elapsedTime > this.lastTimeRunning + 5){ //show arrow keys if no movement
            if(this.showArrowKeys == 0){
                this.showArrowKeys = 1;
                this._scene.add(this.arrowKeys);
            }
            this.animmixer_key.update(delta/2);
        }
        
    }

    initLight(){
        const amlight = new THREE.AmbientLight(0x404040, 40); // soft white light
        this._scene.add(amlight);

        const dirlight = new THREE.DirectionalLight(0x404040, 40); // soft white light
        dirlight.position.set(20, 20, 5);
        dirlight.castShadow = true;
        this._scene.add(dirlight);

        //Set up shadow properties for the light
        dirlight.shadow.mapSize.width = 4096;
        dirlight.shadow.mapSize.height = 4096;

        dirlight.shadow.bias = -0.001; //remove noice
        //camera render settings for shadow
        dirlight.shadow.camera.left = 30;
        dirlight.shadow.camera.right = -30;
        dirlight.shadow.camera.top = 30;
        dirlight.shadow.camera.bottom = -30;

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


    initEnv(){
        this.initLight();
        this._camera.position.set(0, 5, 5);
        this._camera.rotation.x = -0.3;

        this._scene.background = new THREE.Color(0xe88504);

        const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3, 1000, 32, 32), new THREE.MeshStandardMaterial({color: 0xffffff}));
        carpet.rotation.x = -Math.PI/2;
        carpet.position.y = 0;
        carpet.receiveShadow = true;
        this._scene.add(carpet);

        const line = new THREE.Mesh(new THREE.PlaneGeometry(.2, 1000, 32, 32), new THREE.MeshStandardMaterial({color: 0x000000}));
        line.rotation.x = -Math.PI/2;
        line.position.x = -20;
        //this._scene.add(line);

        const line2 = new THREE.Mesh(new THREE.PlaneGeometry(.2, 1000, 32, 32), new THREE.MeshStandardMaterial({color: 0x000000}));
        line2.rotation.x = -Math.PI/2;
        line2.position.x = 20;
        //this._scene.add(line2);

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 100, 32, 32), new THREE.MeshStandardMaterial({color: 0xe88504}));
        ground.rotation.x = -Math.PI/2;
        ground.position.y = -0.02;
        ground.receiveShadow = true;
        this._scene.add(ground);

        //this._scene.fog = new THREE.Fog( 0xe88504, 10, 50 );

        this.initModel('src/3d/gentle_stickman.glb', (stickman, animations) => {
            this.stickman = stickman;

            //play anim of stickman
            this.animmixer = new THREE.AnimationMixer(stickman);
            this.anim_idle = this.animmixer.clipAction(animations[0]);
            this.anim_running = this.animmixer.clipAction(animations[1]);
            this.anim_idle.play();
            this._scene.add(this.stickman);
        });

        this.initModel('src/3d/keyboard_arrows.glb', (arrowKeys, animations) => {
            this.arrowKeys = arrowKeys;
            this.arrowKeys.position.set(3, 0, -1);

            this.animmixer_key = new THREE.AnimationMixer(arrowKeys);
            
            animations.forEach((clip) => {
                const action = this.animmixer_key.clipAction(clip);
                action.play();
            });
        });

        this.initModel('src/3d/keyboard_enter.glb', (enterKey, animations) => {
            this.enterKey = enterKey;
            this.enterKey.position.set(5, 0, -1);

            this.animmixer_enterkey = new THREE.AnimationMixer(this.enterKey);
            animations.forEach((clip) => {
                const action = this.animmixer_enterkey.clipAction(clip);
                action.play();
            });
        });


        let artFrame = new ArtFrame("src/monalisa.jpg");
        this._scene.add(artFrame);
        artFrame.position.set(10, 0, -15);
        artFrame.rotation.y = -Math.PI/4;
        artFrame.castShadow = true;
        artFrame.receiveShadow = true;
        this.artFrames.push(artFrame);

        let artFrame2 = new ArtFrame("src/sbahn.png");
        this._scene.add(artFrame2);
        artFrame2.position.set(-10, 0, -30);
        artFrame2.rotation.y = Math.PI/4;
        this.artFrames.push(artFrame2);

        let artFrame3 = new ArtFrame("src/heulsuse.png");
        this._scene.add(artFrame3);
        artFrame3.position.set(10, 0, -45);
        artFrame3.rotation.y = -Math.PI/4;
        this.artFrames.push(artFrame3);
    }

    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }

    addListeners(){
        this.boundKeydown = this.keydown.bind(this);
        this.boundKeyup = this.keyup.bind(this);

        document.addEventListener('keydown', this.boundKeydown);
        document.addEventListener('keyup', this.boundKeyup);
    }

    removeEventListeners(){
        document.removeEventListener('keydown', this.boundKeydown);
        document.removeEventListener('keyup', this.boundKeyup);
    }
    
    keydown(e){
        if(e.code === 'ArrowUp'){
            if(this.animationState != 1){
                this._scene.remove(this.arrowKeys);
                this.showArrowKeys = 1;
                this.animationState = 1;
                this.anim_running.reset();
                this.anim_running.play();
                this.anim_idle.crossFadeTo(this.anim_running, 0.5);
                this.stickman.rotation.y = Math.PI;
                this.dir = 1;
            } 
            
        }else if(e.code === 'ArrowDown'){
            if(this.animationState != 1){
                this._scene.remove(this.arrowKeys);
                this.showArrowKeys = 1;
                this.animationState = 1;
                this.anim_running.reset();
                this.anim_running.play();
                this.anim_idle.crossFadeTo(this.anim_running, 0.5);
                this.stickman.rotation.y = 0;
                this.dir = -1;
            }            
        }else if(e.code === 'Escape'){
            loadScene(0);
        }else if(e.code === 'Enter'){
            if(this.nextToImg == true){
                viewContent();
                this.removeEventListeners();
            }
        }
    }

    keyup(e){
        if(e.code === 'ArrowUp' || e.code === 'ArrowDown'){
            if(this.animationState != 0){
                this.lastTimeRunning = this._clock.elapsedTime;
                this.showArrowKeys = 0;    
                this.animationState = 0;
                this.anim_idle.reset();
                this.anim_idle.play();
                this.anim_running.crossFadeTo(this.anim_idle, 0.5);
            }
        }
    }

    loadOverlay(){
        var overlayDiv = document.getElementById("overlay");
        var exitDiv = document.createElement('div');
        exitDiv.id = 'exitDiv';
        exitDiv.innerHTML = "<img id='exit' src='src/exit.png' onclick='loadScene(0);' alt='exit'>"
        overlayDiv.appendChild(exitDiv);
    }

    exit(){
        this.removeEventListeners();
        document.getElementById("overlay").removeChild(document.getElementById("exitDiv"));
    }

}