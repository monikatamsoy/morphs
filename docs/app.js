import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { RGBELoader } from './libs/three/jsm/RGBELoader.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { LoadingBar } from './libs/LoadingBar.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0.5, 2 );
        this.camera.lookAt(0,0,0)
        
		this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color( 0xaaaaaa );
        
		this.ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 4);
		this.scene.add(this.ambient);
        

        const light = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add( light );
        
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        this.scene.add( directionalLight );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        container.appendChild( this.renderer.domElement );
		
		
        this.loadingBar = new LoadingBar();
        this.mouse = new THREE.Vector2();
            this.mouse.x = this.mouse.y = -1;

        this.modelGroup = new THREE.Group();
            
        this.raycaster = new THREE.Raycaster();
        
        
        this.loadGLTF();
        this.clicked = false;
        this.init();
        
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        window.addEventListener('resize', this.resize.bind(this) );
        document.addEventListener("mousemove", this.onMouseMove, false)
        document.addEventListener("click", this.onMouseClick, false)

	}	
    
    
    getText(text,visibility, x,y,z) {
        const self = this;
        let fontLoader = new THREE.FontLoader();
                fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
                    const material = new THREE.MeshPhongMaterial({
                        color: 0x9e0031,
                        specular: 0x555555,
                        shininess: 30
                    });
                    const geometry = new THREE.TextGeometry(text, {
                        font: font,
                        size: 0.04,
                        height: 0.01,
                        curveSegments: 5,
                        // bevelEnabled: true,
                        material: 0,
                        extrudeMaterial: 1
                    });
                    geometry.castShadow = true

                    self.textMesh = new THREE.Mesh(geometry, material)
                    self.textMesh.position.set(x,y,z)
                    self.textMesh.name = text;
                    self.textMesh.visible = visibility;
                    // self.textMesh.lookAt(self.camera.position)
                    self.scene.add(self.textMesh)
                })
                
    }

    loadBackground = () => {
        // Load the images used in the background.
        var path = "assets/cubemap/";
        var format = ".jpeg";
        var urls = [
            path + "px" + format,
            path + "nx" + format,
            path + "py" + format,
            path + "ny" + format,
            path + "pz" + format,
            path + "nz" + format,
        ];
        var reflectionCube = new THREE.CubeTextureLoader().load(urls);
        reflectionCube.format = THREE.RGBFormat;
        this.scene.background = reflectionCube;
    }
    
    init() {
        const axesHelper = new THREE.AxesHelper( 5 );
        // this.scene.add( axesHelper );  
        this.getText("Load another model",true, -1,1,0)
        this.getText("Facing", false,0,0,0)
        this.loadBackground();
        
            }

    onMouseMove = (e) => {
        
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        // console.log(mouse)
        this.raycaster.setFromCamera( this.mouse, this.camera );
        if(this.scene) {

            var faceScene = this.scene.getObjectByName('tobey1')
            var faceMesh = faceScene.children[0].children[0].children[0].children[1].children[0]
            
            var positions = new Float32Array() 
            positions = faceMesh.geometry.attributes.position;
            let p;
            let pointCount = positions.count / 3;
            for (let i = 0; i < pointCount; i++) {
                p = new THREE.Vector3(positions.array[i * 3], positions.array[i * 3 + 1], positions.array[i * 3 + 2]);               
                faceMesh.localToWorld(p);
            }
            faceMesh.updateMatrixWorld();
            var intersectsModel = this.raycaster.intersectObjects( faceScene.children[0].children[0].children[0].children[1].children );
            if (intersectsModel[0] )
            {
                 console.log("model1",intersectsModel[0].point);
                //  this.getText(intersectsModel[0].point.x+","+intersectsModel[0].point.y+","+intersectsModel[0].point.z, intersectsModel[0].point.x,intersectsModel[0].point.y, intersectsModel[0].point.z)
                }
            
            if (this.scene.getObjectByName('tobey2')) {
                var intersectsModel2 = this.raycaster.intersectObjects( this.scene.getObjectByName('tobey2').children[0].children[0].children[0].children[1].children);
                if (intersectsModel2[0]) {
                    console.log("model2",intersectsModel2[0].point)
                }
            }
        }           
    } 

    onMouseClick = (e) => {
        
        e.preventDefault();
        
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        
        // console.log(mouse)
        this.raycaster.setFromCamera( this.mouse, this.camera );

        var intersects = this.raycaster.intersectObject( this.scene.getObjectByName('Load another model'));
        if (intersects[0] )
        {   
            this.clicked = true;
            this.loadGLTF();
            this.scene.getObjectByName('Load another model').visible = false
        } 
         
    
}


    getMorphs(mesh){
        this.gui = new dat.GUI();
        var params = {
            Blink_right: 0,
            Flex_right: 0,
        } 
        var folder1 = this.gui.addFolder("Light");
        folder1.add(this.ambient, "intensity", 0, 10);
        // folder1.open()


        var folder2 = this.gui.addFolder("Morph targets");
        folder2.add(params, 'Blink_right',0,1).step(0.01).onChange( value => { mesh.morphTargetInfluences[ 0 ] = value; })
        folder2.add(params, 'Flex_right',0,1).step(0.01).onChange( value => { mesh.morphTargetInfluences[ 1 ] = value; })
       
        }


    loadGLTF(){
        const loader = new GLTFLoader( ).setPath('./assets/');
        const self = this;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			'tobey.glb',
			// called when the resource is loaded
			function ( gltf ) {
                const bbox = new THREE.Box3().setFromObject( gltf.scene );
                console.log(`min:${bbox.min.x.toFixed(2)},${bbox.min.y.toFixed(2)},${bbox.min.z.toFixed(2)} -  max:${bbox.max.x.toFixed(2)},${bbox.max.y.toFixed(2)},${bbox.max.z.toFixed(2)}`);
                
                gltf.scene.traverse( ( child ) => {
                    if (child.isMesh){
                        child.material.metalness = 0.2;
                    }
                })
                gltf.scene.name = 'tobey1'

                if(self.clicked == true) {
                    gltf.scene.name = 'tobey2'
                    self.scene.getObjectByName('tobey1').position.set(2,0,0)
                    self.scene.getObjectByName('tobey1').rotateY(-Math.PI/8)
                    gltf.scene.rotateY(Math.PI/8)
                    gltf.scene.position.set(-2,0,0)
                }
                self.model = gltf.scene;
                self.model.scale.set(4,4,4)

                const modelAxesHelper = new THREE.AxesHelper( 0.5 );
                
                // gltf.scene.add( modelAxesHelper );  
                
                
				self.scene.add( gltf.scene );                
                self.loadingBar.visible = false;

                const mesh = gltf.scene.children[0].children[0].children[0].children[1].children[0]               
                self.getMorphs(mesh)                
				
				self.renderer.setAnimationLoop( self.render.bind(self));
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' )
                    
            }
        );
    }

    checkFacing = () => {
        const start = this.scene.getObjectByName('tobey1');
        const end = new THREE.Object3D() 
        var direction = new THREE.Vector3();
        // console.log(this.scene.children[5].quaternion)
        var directionQuaternion = new THREE.Vector3(0,0,-1).applyQuaternion(this.scene.getObjectByName('tobey1').quaternion)
        // console.log(direction)
        end.position.set(0,0,0)
        this.raycaster.set(start.position, direction.subVectors(end.position, directionQuaternion).normalize());

        const intersectsAnother = this.raycaster.intersectObjects(this.scene.getObjectByName('tobey2').children[0].children[0].children[0].children[1].children)
        if(intersectsAnother[0]) {
            
            let text = this.scene.getObjectByName('Facing')
            text.scale.set(2,2,2)
            text.visible = true

        } else {
            
            let text = this.scene.getObjectByName('Facing')
            
            text.visible = false

        }
            }
    
    
    resize(){
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        if(this.clicked == true && this.scene.getObjectByName('tobey2')) {
            this.scene.getObjectByName('tobey1').rotation.y -= 0.01;
            this.scene.getObjectByName('tobey2').rotation.y += 0.01;
            this.checkFacing()
            }
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };