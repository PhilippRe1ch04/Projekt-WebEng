import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ArtFrame} from './artFrame.js';

export class HallwayScene{

    constructor(){ //called once at the beginning
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();

        this.animationState = 0;
        this.dir = 1;
        this.artFrames = [];
        this.curr = 0;

        this.initEnv();
    }

    start(){ //called on scene load
        this.loadOverlay();
        this.addListeners();


    }

    updateRender() {
        if(this.animmixer) { //update animation if stickman
            const delta = this._clock.getDelta();
            this.animmixer.update(delta/1.5);
            
        }

        if(this.animationState == 1){
            
            this.artFrames.forEach((element) =>{
                element.position.z += 0.1*this.dir;
            });

            var worldPos = new THREE.Vector3();
            this.artFrames[this.curr].getWorldPosition(worldPos);
            if(worldPos.z > -1){
                //view image in full size
                this.curr += 1;

                let artFrameX = new ArtFrame("src/klimaleugner.jpg");
                this._scene.add(artFrameX);
                var pos = 1;
                if(this.curr%2) pos = -1;
                artFrameX.position.set(10*pos, 0, -45);
                artFrameX.rotation.y = Math.PI/4*-pos;
                this.artFrames.push(artFrameX);
            }
        }
        
    }

    initLight(){
        const amlight = new THREE.AmbientLight(0x404040, 30); // soft white light
        this._scene.add(amlight);

        const light = new THREE.DirectionalLight(0x404040, 50); // soft white light
        light.position.set(5,5,0);
        light.castShadow = true;
        this._scene.add(light);

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


    initEnv(){
        this.initLight();
        this._camera.position.set(0, 5, 5);
        this._camera.rotation.x = -0.3;

        const way = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1000, 1, 1), new THREE.MeshStandardMaterial({color: 0x36454F}));
        way.rotation.x = -Math.PI/2;
        way.position.y = -0.01;
        way.receiveShadow = true;
        this._scene.add(way);

        const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3, 1000, 32, 32), new THREE.MeshStandardMaterial({color: 0x8b0000}));
        carpet.rotation.x = -Math.PI/2;
        carpet.position.y = 0;
        carpet.receiveShadow = true;
        this._scene.add(carpet);

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 32, 32), new THREE.MeshStandardMaterial({color: 0x010101}));
        ground.rotation.x = -Math.PI/2;
        ground.position.y = -0.02;
        ground.receiveShadow = true;
        this._scene.add(ground);

        this._scene.fog = new THREE.Fog( 0x040404, 10, 50 );

        this.initModel('src/3d/gentle_stickman.glb', (stickman, animations) => {
            this.stickman = stickman;

            //play anim of stickman
            this.animmixer = new THREE.AnimationMixer(stickman);
            this.anim_idle = this.animmixer.clipAction(animations[0]);
            this.anim_running = this.animmixer.clipAction(animations[1]);
            this.anim_idle.play();
        });

        let artFrame = new ArtFrame("src/monalisa.jpg");
        this._scene.add(artFrame);
        artFrame.position.set(10, 0, -15);
        artFrame.rotation.y = -Math.PI/4;
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

        window.addEventListener('keydown', this.boundKeydown);
        window.addEventListener('keyup', this.boundKeyup);
    }
    
    keydown(e){
        if(e.code === 'ArrowUp'){
            if(this.animationState != 1){
                this.animationState = 1;
                this.anim_running.reset();
                this.anim_running.play();
                this.anim_idle.crossFadeTo(this.anim_running, 0.5);
                this.stickman.rotation.y = Math.PI;
                this.dir = 1;
            } 
            
        }else if(e.code === 'ArrowDown'){
            if(this.animationState != 1){
                this.animationState = 1;
                this.anim_running.reset();
                this.anim_running.play();
                this.anim_idle.crossFadeTo(this.anim_running, 0.5);
                this.stickman.rotation.y = 0;
                this.dir = -1;
            }            
        }else if(e.code === 'Escape'){
            loadScene(0);
        }
    }

    keyup(e){
        if(e.code === 'ArrowUp' || e.code === 'ArrowDown'){
            if(this.animationState != 0){
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
        document.removeEventListener('keydown', this.keydown);
        document.removeEventListener('keyup', this.keyup);

        document.getElementById("overlay").removeChild(document.getElementById("exitDiv"));
    }

}