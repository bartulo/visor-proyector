import JsTabs from 'js-tabs';
import 'js-tabs/src/_js-tabs-base.scss';
import { scene, sidebar } from './app';
import { BufferGeometry, LineBasicMaterial, Line, Group, BufferAttribute } from 'three';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';
import {io} from 'socket.io-client';

class Sidebar {
  constructor () {
    this.menu = document.querySelector('#menuIcon');
    this.sidenav = document.querySelector('#sidenav');
    this.closeButton = document.querySelector('.closebtn');
    this.socket = io();
    this.state = null;
    this.color = '#ffd700';
    this.icon = 'binoculars';
    this.iconClass = 'icon-binoculars';
    this.video = document.querySelector('video');
    this.play = document.getElementById('play');
    this.pause = document.getElementById('pause');

  }

  init () {
    this.menu.addEventListener('click', this.openSidebar.bind(this));

    this.closeButton.addEventListener('click', this.closeSidebar.bind(this))
    const myTabs = new JsTabs({
      elm: '#jsTabs',
      onClickHandlerComplete: this.changeState.bind(this)
    });
    document.querySelectorAll('.colors li').forEach( item => {
  /// TODO mirar a ver si estos dos métodos se pueden fusionar en uno
      item.addEventListener('click', this.colorClicked );
      item.addEventListener('click', this.prueba );
    });

    document.querySelectorAll('.icon div').forEach( item => {
      item.addEventListener('click', this.iconClicked);
      item.addEventListener('click', this.iconClicked2);
    });
    myTabs.init();

    this.play.addEventListener('click', () => {
      this.video.play();
      this.socket.emit('playVideo');
    })

    this.pause.addEventListener('click', () => {
      this.video.pause();
      this.socket.emit('pauseVideo');
    })

  }

  openSidebar () {
    this.state = document.querySelector('.js-tabs__tab.active').title;
    if ( window.innerWidth > 1024 ) {
      this.sidenav.style.width = '350px';
    } else {
      this.sidenav.style.width = '232px';
    }
  }

  closeSidebar () {
    this.state = null;
    this.sidenav.style.width = 0;
  }

  changeState () {
    let state = document.querySelector('.js-tabs__tab.active');
    this.state = state.title;
  }

  /// TODO mirar a ver si estos dos métodos se pueden fusionar en uno

  colorClicked () {
    let oldColor = document.querySelector('.active-color');
    oldColor.classList.remove('active-color');
    this.classList.add('active-color');
  }

  prueba = () => {
    this.color = document.querySelector('.active-color').dataset.color;
  }

  iconClicked () {
    let oldIcon = document.querySelector('.active-icon');
    oldIcon.classList.remove('active-icon');
    this.classList.add('active-icon');
  }

  iconClicked2 = () => {
    this.icon = document.querySelector('.active-icon').dataset.image;
    this.iconClass = document.querySelector('.active-icon').classList[0];
  }
}

class LineSidebar {
  constructor () {
    this._id = LineSidebar.incrementId();
    sidebar.lineId = this._id;
  }

  static incrementId() {

    if (!this.latestId) this.latestId = 1;
    else this.latestId++;
    return this.latestId;

  }

  createObject () {

    const geometry = new BufferGeometry();

    let matLine = new LineBasicMaterial( {
      color: sidebar.color,
      linewidth: 2,
      alphaToCoverage: true
    } );

    let line = new Line( geometry, matLine );
    line.scale.set( 1, 1, 1 );
    line.frustumCulled = false;
    this.line = line;

  }

  createElement () {
    console.log( this );
    this.elem = document.createElement('DIV');
    this.elem.classList.add( 'line' );
    this.elem.style.border = 'solid 3px ' + sidebar.color;
    this.elem.style.boxShadow = '2px 2px 4px rgb(0, 0, 0, 0.6)';
    const container = document.querySelector('.linesToDelete');
    container.appendChild(this.elem);
    this.elem.addEventListener('mouseover', this.hover);
    this.elem.addEventListener('mouseout', this.unHover);
    this.elem.addEventListener('click', this.erase);
  }

  hover = () => {
    this.interval = setInterval( () => {

      if (this.line.material.visible ) {

        this.line.material.visible = false;

      } else {

        this.line.material.visible = true;

      }
    }, 160);
  }

  unHover = () => {
    clearInterval( this.interval );
    this.line.material.visible = true;
  }

  erase = () => {
    this.elem.removeEventListener('mouseover', this.hover);
    this.elem.removeEventListener('mouseout', this.unHover);
    this.elem.removeEventListener('click', this.erase);

    this.elem.remove();
    scene.remove( this.line );
    sidebar.socket.emit( 'remove', {'id': this._id, 'type': 'line' } );
  }

}

class IconSidebar {

  constructor ( position ) {
    this.position = position;
    this._id = IconSidebar.incrementId();
    sidebar.iconId = this._id;
  }

  static incrementId() {

    if (!this.latestId) this.latestId = 1;
    else this.latestId++;
    return this.latestId;

  }

  createObject () {

    const lineMaterial = new LineBasicMaterial( {
      color: '#fff',
      linewidth: 4
    } );

    const geometry = new BufferGeometry();

    const vertices = new Float32Array( [
      0.0, 0.0, 0.0,
      0.0, -10.0, 0.0 
    ] );

    geometry.setAttribute('position', new BufferAttribute( vertices, 3 ) );

    const line = new Line( geometry, lineMaterial );

    const group = new Group();
    group.add( line );
    group.position.set( this.position.x, this.position.y + 10., this.position.z );

    const icon = document.createElement( 'div' );
    icon.classList.add( sidebar.iconClass );
    icon.style.color = 'white';
    icon.style.fontSize = '30px';
    icon.style['-webkit-text-stroke'] = '1px black';

    this.label = new CSS2DObject( icon );

    group.add( this.label );
    this.group = group;
    scene.add( group );

  }

  createElement () {

    this.elem = document.createElement( 'div' );
    this.elem.classList.add( sidebar.iconClass );
    const container = document.querySelector( '.iconsToDelete' );
    container.appendChild( this.elem );

    this.elem.addEventListener('mouseover', this.hover);
    this.elem.addEventListener('mouseout', this.unHover);
    this.elem.addEventListener('click', this.erase);
      
  }

  hover = () => {

    this.group.children[1].element.style.color = 'indianred';
    this.group.children[1].element.style.fontSize = '40px';

  }

  unHover = () => {

    this.group.children[1].element.style.color = 'white';
    this.group.children[1].element.style.fontSize = '30px';

  }

  erase = () => {
    this.elem.removeEventListener('mouseover', this.hover);
    this.elem.removeEventListener('mouseout', this.unHover);
    this.elem.removeEventListener('click', this.erase);

    this.elem.remove();
    this.label.element.remove();
    scene.remove( this.group );
    sidebar.socket.emit( 'remove', {'id': this._id, 'type': 'icon' } );

  }

}

export { Sidebar, LineSidebar, IconSidebar };
