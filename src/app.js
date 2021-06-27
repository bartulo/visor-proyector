import {
	PlaneGeometry,
	Mesh,
	MeshBasicMaterial,
  TextureLoader,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
  VideoTexture,
  ShaderMaterial,
  WebGL1Renderer,
  RGBAFormat
} from 'three';

//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OrbitControls } from './OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { io } from 'socket.io-client';

import TerrainLoader from './terrain.js';
import TerrainMaterial from './terrainMaterial';
import { Sidebar } from './sidebar.js';

import Mdt from './images/mdt.bin';
import Pnoa from './images/pnoa.jpg';
import Topo from './images/topo.jpg';
import './css/sidebar.css';
import './icons/style.css';


let camera, scene, renderer, sidebar, labelRenderer;

class App {

	init() {

    const socket = io();
    const video = document.createElement('video');
    video.style['display'] = 'none';
    video.src = 'images/fajas_transparente3.webm';
    const body = document.body;
    body.appendChild( video );
    sidebar = new Sidebar();
    sidebar.init();

		camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
		camera.position.set( 0, 800, 0 );

		scene = new Scene();
    scene.background = 'black';

		renderer = new WebGL1Renderer( { antialias: true, alpha: true } );
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
      console.log( data );
      const geometry = new PlaneGeometry( 680, 384, 169, 95 );
      const texture = new TextureLoader().load(Pnoa);
      const textureVideo = new VideoTexture( video );
      textureVideo.format = RGBAFormat;
      texture.transparent = true;

      const texture2 = new TextureLoader().load(Topo);

      var uniforms = {
        texture: { type: 't', value: texture },
        texture2: { type: 't', value: textureVideo }
      }
      const material = new ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertex_shader' ).textContent,
        fragmentShader: document.getElementById( 'fragment_shader' ).textContent
      });

      const textureButton = document.querySelector('.textureButton')

      textureButton.addEventListener('click', function () {
        if ( material.uniforms.texture.value == texture ) {

          material.uniforms.texture.value = texture2;
          socket.emit( 'tecla', 'topo' );
          this.innerHTML = 'Ortofoto';

        } else {

          material.uniforms.texture.value = texture;
          socket.emit( 'tecla', 'pnoa' );
          this.innerHTML = 'Topo';

        }
      });

      document.addEventListener('keydown', ( event ) => {
        
        if (event.key == 'p') {

          video.play();
          console.log( 'p' );

        }

        if ( event.key == 't' ) {

          if ( material.uniforms.texture.value == texture ) {

            material.uniforms.texture.value = texture2;
            socket.emit( 'tecla', 'topo' );

          } else {

            material.uniforms.texture.value = texture;
            socket.emit( 'tecla', 'pnoa' );

          }

        }

      });

      for (let i = 0; i < data.length; i++) {
        geometry.attributes.position.array[(i*3) + 2] = data[i] / 65535 * 20000;
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
