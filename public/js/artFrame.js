import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

//class that containts and 3D Three Group-Object (multiple objects as a group).
//The group represents an ArtFrame, containing an Plane with an the  Art image as material.
export class ArtFrame{

    //constructor, store the db entry id, and the local image Path
    constructor(){
        this.group = new THREE.Group();      
    }

    loadPostImage(path, db_id){
        let planeHeight = 8; //default value for image size in 3d Scene
        let planeWidth = 8; //default value for image size in 3d Scene

        this.path = path;
        this.db_id = db_id;


        new THREE.TextureLoader().load(this.path, (artImage) =>{ //load texture from path and creat plane with texture on it
            
            planeWidth = planeHeight * (artImage.image.width/ artImage.image.height);
            let plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), new THREE.MeshBasicMaterial({map: artImage}));    
            plane.position.set(0, 4, 0);
            this.group.add(plane);
        }); 

        /*load 3d models and add it to group*/

        this.initModel("src/3d/pillar.glb", (pillar1) => {
            pillar1.position.set(-(planeWidth/2)-0.4, 0, 0);
            pillar1.scale.set(1.5, 1.3, 1.5);
            this.group.add(pillar1);

        });

        this.initModel("src/3d/red_velvet_rope.glb", (rope) => {
            rope.position.set(1.2, 0, 2);
            rope.scale.set(1.5, 1.5, 1.5);
            this.group.add(rope);

        });
        

        this.initModel('src/3d/pillar.glb', (pillar2) => {
            pillar2.position.set((planeWidth/2)+0.4, 0, 0);
            pillar2.scale.set(1.5, 1.3, 1.5);
            this.group.add(pillar2);
        });  
    }

    //function to load 3d models from file, returns 3d model data
    initModel(path, onLoadCallback) {
        const loader = new GLTFLoader();
        //load model
        loader.load(path, (gltf) => {
            //cast shadow (every Mesh in 3d obj)
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const model = gltf.scene;
            onLoadCallback(model); //return model
        }, undefined, (error) => {
            console.error(error);
        });
    }

    getDbId(){
        return this.db_id;
    }
    
    get3dObj(){
        return this.group;
    }

}