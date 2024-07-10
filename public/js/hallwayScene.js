import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ArtFrame} from './artFrame.js';

//HallwayScene class is instantiating a scene
export class HallwayScene{

    constructor(){ //called once at the beginning
        //main objects
        this._clock = new THREE.Clock();
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._scene = new THREE.Scene();

        this.animationState = 0; //animationState of stickmn (1 --> running, 0 --> idle)
        this.dir = 1; //direction in which the stickman is running
        this.artFrames = []; //stores all ArtFrames of scene
        this.curr = 0; //stores current artFrame which is next to stickman
        this.lastTimeRunning = 0; //stores time since last keypress --> to show reminder (arrow key animation) after 5 seconds in updateRenderer function
        //variables to hold states
        this.showArrowKeys = 0; 
        this.showEnterKey = 0;
        this.nextToImg = false;

        this.initEnv();
    }

    //called on scene load
    start(){ 
        this.loadOverlay();
        this.addListeners();

        this._clock.elapsedTime = 0;
    }

    //function to generate a random ArtFrame with image from database
    loadRandArtFrame(pos){
        //API call to get 
        fetch('/getRandomPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            //init artFrame
            let artFrame = new ArtFrame(data[0].href, data[0].id);
            this._scene.add(artFrame.get3dObj()); //add artFrame to scene
            artFrame.get3dObj().position.set(pos.x, pos.y, pos.z);
            artFrame.get3dObj().rotation.y = -Math.PI/40*pos.x;
            artFrame.get3dObj().castShadow = true;
            artFrame.get3dObj().receiveShadow = true;
            //add artFrame to list of all artFrames in scene
            this.artFrames.push(artFrame);
        })
        .catch(error => {
            console.error('Error:', error);
        });   
    }

    //function called by sceneManager to update renderer (called every frame)
    updateRender() {
        //var to get position artFrame which is the next to stickman
        var worldPos = new THREE.Vector3(); 
        this.artFrames[this.curr].get3dObj().getWorldPosition(worldPos);
        //init clock
        const delta = this._clock.getDelta();

        if(this.animmixer) { //update animation if stickman
            this.animmixer.update(delta/1.5);
        }

        if(this.animationState == 1){ //if running
            
            this.artFrames.forEach((element) =>{ //move all artFrames towards stickman (movement)
                element.get3dObj().position.z += 0.1*this.dir;
            });

            if(worldPos.z > 0){ //if artFrame next to stickman, spawn a new one
                this.curr += 1; //set current to the next artFrame (which is now next to stickman)
                //pos is determinating on which side of the way the artFrame is positioned 
                var pos = 1;
                if(this.curr%2) pos = -1;
                this.loadRandArtFrame(new THREE.Vector3(10*pos, 0, -45)); //load new ArtFrame
            }else if (worldPos.z < -15.5){ //if walking backwards, set current to previous
                if(this.curr != 0){
                    this.curr -= 1;
                }
            }
        }

        if(worldPos.z > -8 && worldPos.z < 0){ //show enter button if artFrame is next to stickman & play animation
            this.animmixer_enterkey.update(delta/1.5);
            this.nextToImg = true;
            if(this.showEnterKey == 0){
                //check on which side the ArtFrame is positioned to position the enter key model
                if(this.artFrames.at(this.curr).get3dObj().position.x < 0){
                    this.enterKey.position.x = -5;
                }else{
                    this.enterKey.position.x = 5;
                }
                this._scene.add(this.enterKey);
                this.showEnterKey = 1;
            }
        }else{ //if stickman is between artFrames
            this.nextToImg = false;
            if(this.showEnterKey == 1){ //remove EnterKey from scene
                this._scene.remove(this.enterKey);
                this.showEnterKey = 0;
            }
        }

        if(this._clock.elapsedTime > this.lastTimeRunning + 5){ //show arrow keys if no movement
            if(this.showArrowKeys == 0){
                this.showArrowKeys = 1;
                this._scene.add(this.arrowKeys);
            }
            this.animmixer_key.update(delta/2.2);
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

        dirlight.shadow.bias = -0.001; //remove shadow noice
        //camera render settings for shadow
        dirlight.shadow.camera.left = 30;
        dirlight.shadow.camera.right = -30;
        dirlight.shadow.camera.top = 30;
        dirlight.shadow.camera.bottom = -30;

    }

    //function to load 3d model and return it
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

    
    //load first three art frames (afterwards generated dynamically)
    loadArtFrames(){
        this.loadRandArtFrame(new THREE.Vector3(10, 0, -15));
        this.loadRandArtFrame(new THREE.Vector3(-10, 0, -30));
        this.loadRandArtFrame(new THREE.Vector3(10, 0, -45));
    }

    //function to init Enviroment (Light, Ground, Stickman,...)
    initEnv(){
        this.initLight();
        this._camera.position.set(0, 5, 5);
        this._camera.rotation.x = -0.3;

        this._scene.background = new THREE.Color(0xe88504);

        const way = new THREE.Mesh(new THREE.PlaneGeometry(3, 1000, 32, 32), new THREE.MeshStandardMaterial({color: 0xffffff}));
        way.rotation.x = -Math.PI/2;
        way.position.y = 0;
        way.receiveShadow = true;
        this._scene.add(way);

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 100, 32, 32), new THREE.MeshStandardMaterial({color: 0xe88504}));
        ground.rotation.x = -Math.PI/2;
        ground.position.y = -0.02;
        ground.receiveShadow = true;
        this._scene.add(ground);

        this._scene.fog = new THREE.Fog( 0xe88504, 10, 50 );

        //load stickman in scene
        this.initModel('src/3d/gentle_stickman.glb', (stickman, animations) => {
            this.stickman = stickman;

            //create animation mixer to controll animations
            this.animmixer = new THREE.AnimationMixer(stickman);
            this.anim_idle = this.animmixer.clipAction(animations[0]);
            this.anim_running = this.animmixer.clipAction(animations[1]);
            this.anim_idle.play();
            this._scene.add(this.stickman);
        });

        //load arrow keys
        this.initModel('src/3d/keyboard_arrows.glb', (arrowKeys, animations) => {
            this.arrowKeys = arrowKeys;
            this.arrowKeys.position.set(3, 0, -1);

            //create animation mixer to controll animations
            this.animmixer_key = new THREE.AnimationMixer(arrowKeys);
            animations.forEach((clip) => {
                const action = this.animmixer_key.clipAction(clip);
                action.play();
            });
        });

        //load enter key
        this.initModel('src/3d/keyboard_enter.glb', (enterKey, animations) => {
            this.enterKey = enterKey;
            this.enterKey.position.set(5, 0, -1);
            //create animation mixer to controll animations
            this.animmixer_enterkey = new THREE.AnimationMixer(this.enterKey);
            animations.forEach((clip) => {
                const action = this.animmixer_enterkey.clipAction(clip);
                action.play();
            });
        });
        //load initial three artFrames
        this.loadArtFrames();
    }

    getScene() {
        return this._scene;
    }

    getCamera() {
        return this._camera;
    }

    //add and bind EventListeners to class (handle input)
    addListeners(){
        this.boundKeydown = this.keydown.bind(this);
        this.boundKeyup = this.keyup.bind(this);

        document.addEventListener('keydown', this.boundKeydown);
        document.addEventListener('keyup', this.boundKeyup);
    }

    //remove EventListeners
    removeListeners(){
        document.removeEventListener('keydown', this.boundKeydown);
        document.removeEventListener('keyup', this.boundKeyup);
    }
    
    //handle keydown input
    keydown(e){
        if(e.code === 'ArrowUp'){
            //running forwards
            if(this.animationState != 1){ //if not running --> start running animation
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
            //runnning backwards
            if(this.animationState != 1){ //if not running --> start running animation
                this._scene.remove(this.arrowKeys);
                this.showArrowKeys = 1;
                this.animationState = 1;
                //play running animation
                this.anim_running.reset();
                this.anim_running.play();
                this.anim_idle.crossFadeTo(this.anim_running, 0.5);
                this.stickman.rotation.y = 0;
                this.dir = -1;
            }            
        }else if(e.code === 'Escape'){ //exit scene, load startScene
            loadScene(0);
        }else if(e.code === 'Enter'){ //view content of artFrame
            if(this.nextToImg == true){ //only open content of current artFrame, if stickman is next to it
                viewContent(this.artFrames.at(this.curr).getDbId()); 
                this.removeListeners();
            }
        }
    }

    //handle keypress release input
    keyup(e){
        if(e.code === 'ArrowUp' || e.code === 'ArrowDown'){
            if(this.animationState != 0){ //if running --> stop running & play idle animation
                this.lastTimeRunning = this._clock.elapsedTime;
                this.showArrowKeys = 0;    
                this.animationState = 0;
                //play new animation
                this.anim_idle.reset();
                this.anim_idle.play();
                this.anim_running.crossFadeTo(this.anim_idle, 0.5);
            }
        }
    }

    //load overlay (exit button)
    loadOverlay(){
        var overlayDiv = document.getElementById("overlay");
        var exitDiv = document.createElement('div');
        exitDiv.id = 'exitDiv';
        exitDiv.innerHTML = "<img id='exit' src='src/exit.png' onclick='loadScene(0);' alt='exit'>"
        overlayDiv.appendChild(exitDiv);
    }

    //exit Scene
    exit(){
        this.removeListeners();
        document.getElementById("overlay").removeChild(document.getElementById("exitDiv"));
    }

}