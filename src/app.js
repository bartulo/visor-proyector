import {
	PlaneGeometry,
	Mesh,
	MeshBasicMaterial,
  TextureLoader,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three';

//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OrbitControls } from './OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

import TerrainLoader from './terrain.js';
import { Sidebar } from './sidebar.js';

import Mdt from './images/mdt.bin';
import Pnoa from './images/pnoa.jpg';
import './css/sidebar.css';
import './icons/style.css';


let camera, scene, renderer, sidebar, labelRenderer;

class App {

	init() {

    sidebar = new Sidebar();
    sidebar.init();

		camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.set( 0, 400, 0 );

		scene = new Scene();

		renderer = new WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
		document.body.appendChild( labelRenderer.domElement );


		window.addEventListener( 'resize', onWindowResize, false );

		const controls = new OrbitControls( camera, renderer.domElement );

    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    var terrainLoader = new TerrainLoader();
    terrainLoader.load(Mdt, function(data) {
      const geometry = new PlaneGeometry( 300, 300, 239, 239 );
      const texture = new TextureLoader().load(Pnoa);
      const material = new MeshBasicMaterial({map: texture});
      for (let i = 0; i < data.length; i++) {
        geometry.attributes.position.array[(i*3) + 2] = data[i] / 65535 * 8000;
      }
      const plane = new Mesh(geometry, material);
      plane.rotation.set( Math.PI / 2, Math.PI, Math.PI );
      scene.add(plane);
    });

		animate();

	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	labelRenderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	labelRenderer.render( scene, camera );

}

export { App };
export { sidebar, scene, camera };
