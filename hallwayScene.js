import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export class HallwayScene{

    constructor(){
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();

        this.animationState = 0;

        this.initEnv();
        this.addListeners();
    }

    updateRender() {
        if(this.animmixer) { //update animation if stickman
            const delta = this._clock.getDelta();
            this.animmixer.update(delta/1.5);
            
        }
        
    }

    initLight(){
        const amlight = new THREE.AmbientLight(0x404040, 80); // soft white light
        this._scene.add(amlight);

        const light = new THREE.DirectionalLight(0x404040, 80); // soft white light
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

        this.initModel('public/gentle_stickman.glb', (stickman, animations) => {
            stickman.rotation.y = Math.PI;

            //play anim of stickman
            this.animmixer = new THREE.AnimationMixer(stickman);
            this.anim_idle = this.animmixer.clipAction(animations[0]);
            this.anim_running = this.animmixer.clipAction(animations[1]);
            this.anim_idle.play();
        });

    }

    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }

    addListeners(){
        window.addEventListener('keydown', (e) => {
            if(e.code === 'ArrowUp'){
                if(this.animationState != 1){
                    this.animationState = 1;
                    this.anim_running.reset();
                    this.anim_running.play();
                    this.anim_idle.crossFadeTo(this.anim_running, 0.5);
                } 
                
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if(e.code === 'ArrowUp'){
                if(this.animationState != 0){
                    this.animationState = 0;
                    this.anim_idle.reset();
                    this.anim_idle.play();
                    this.anim_running.crossFadeTo(this.anim_idle, 0.5);
                }
            }
        });
    }

}