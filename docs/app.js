import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { FBXLoader } from './libs/three/jsm/FBXLoader.js';
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
        this.scene.background = new THREE.Color( 0xaaaaaa );
        
		this.ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 4);
		this.scene.add(this.ambient);
        
        // const light = new THREE.DirectionalLight( 0xFFFFFF, 1.5 );
        // light.position.set( 0.2, 1, 1);
        // this.scene.add(light);
        const light = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        container.appendChild( this.renderer.domElement );
		// this.setEnvironment();
		
        this.loadingBar = new LoadingBar();
        this.mouse = new THREE.Vector2();
            this.mouse.x = this.mouse.y = -1;

        this.raycaster = new THREE.Raycaster();
        this.gui = new dat.GUI();
        
        this.loadGLTF();
        
        this.init();
        // this.animate();
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        window.addEventListener('resize', this.resize.bind(this) );
        document.addEventListener("mousemove", this.onMouseMove, false)
	}	
    
    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( './assets/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
    init() {
        const axesHelper = new THREE.AxesHelper( 5 );
        this.scene.add( axesHelper );  
        
            }

    onMouseMove = (e) => {
        
        this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        // console.log(mouse)
        this.raycaster.setFromCamera( this.mouse, this.camera );
        if(this.scene) {

            var faceMesh = this.scene.children[3].children[0].children[0].children[0].children[1].children[0]
            
            var positions = new Float32Array() 
            positions = faceMesh.geometry.attributes.position;
            // let p1 = new THREE.Vector3();
                
            // var vert1 = new THREE.Vector3().fromArray(faceMesh.geometry.attributes.position.array);
            // console.log(vert1)
            // faceMesh.localToWorld(vert1);
            // faceMesh.updateMatrixWorld();

            // let positions: Float32Array = geo.attributes["position"].array;
            let p;
            let pointCount = positions.count / 3;
            for (let i = 0; i < pointCount; i++) {
                // p1.fromBufferAttribute(position, i * 3 + 0);
                p = new THREE.Vector3(positions.array[i * 3], positions.array[i * 3 + 1], positions.array[i * 3 + 2]);
                
                faceMesh.localToWorld(p);
                

            }
                        faceMesh.updateMatrixWorld();
                        

            var intersects = this.raycaster.intersectObjects( this.scene.children[3].children[0].children[0].children[0].children[1].children );
            // var intersectsHospital = raycaster.intersectObjects( pinGroup.children );
            if (intersects[0] )
            {
                 console.log(intersects[0].point)
                }
        }
            
        } 
        
        getWorldPosition(mesh) {
            

                
                var vertexCopy = mesh.geometry.attributes.position.array.clone();
                mesh.localToWorld(vertexCopy);
            
            
        }

        getMorphs(mesh){
            var params = {
                Blink_right: 0,
                Flex_right: 0,
            }
                
        
        var folder1 = this.gui.addFolder("light");
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
                self.chair = gltf.scene;
                self.chair.scale.set(4,4,4)
                // self.chair.rotation.z = Math.PI;

                
				self.scene.add( gltf.scene );
                
                self.loadingBar.visible = false;
                const mesh = gltf.scene.children[0].children[0].children[0].children[1].children[0]
                self.getMorphs(mesh)
                // self.getWorldPosition(mesh);
				
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

    
    animate() {
        render();
        requestAnimationFrame( animate );		
        }
    
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        // this.chair.rotateY( 0.01 );
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };