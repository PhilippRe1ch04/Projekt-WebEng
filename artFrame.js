import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export class ArtFrame{

    constructor(path){
        this.path = path;

        let group = new THREE.Group();

        let planeHeight = 8;
        let planeWidth = 0;
        new THREE.TextureLoader().load(path, function(artImage){
            
            planeWidth = planeHeight * (artImage.image.width/ artImage.image.height);
            let plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), new THREE.MeshBasicMaterial({map: artImage}));    
            plane.position.set(0, 4, 0);
            group.add(plane)
        }); 

        
    
        this.initModel("src/3d/pillar.glb", (pillar1) => {
            pillar1.position.set(-(planeWidth/2)-0.4, 0, 0);
            pillar1.scale.set(1.5, 1.3, 1.5);
            group.add(pillar1);

        });

        this.initModel("src/3d/red_velvet_rope.glb", (rope) => {
            rope.position.set(1.2, 0, 2);
            rope.scale.set(1.5, 1.5, 1.5);
            group.add(rope);

        });
        

        this.initModel('src/3d/pillar.glb', (pillar2) => {
            pillar2.position.set((planeWidth/2)+0.4, 0, 0);
            pillar2.scale.set(1.5, 1.3, 1.5);
            group.add(pillar2);
        });    

        return group;
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
            onLoadCallback(model); //return model and animations
        }, undefined, (error) => {
            console.error(error);
        });
    }
    
}