import JsTabs from 'js-tabs';
import 'js-tabs/src/_js-tabs-base.scss';
import { scene, sidebar } from './app';

class Sidebar {
  constructor () {
    this.menu = document.querySelector('#menuIcon');
    this.sidenav = document.querySelector('#sidenav');
    this.closeButton = document.querySelector('.closebtn');
    this.state = null;
    this.color = '#ffccff';
    this.icon = 'camion';
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
  }

  openSidebar () {
    this.state = 'icon';
    this.sidenav.style.width = '350px';
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
  }
}

class LineSidebar {
  constructor () {
  }

  createElement () {
    this.elem = document.createElement('DIV');
    this.elem.innerHTML = 'linea';
    this.elem.classList.add( 'line' );
    console.log( sidebar.color );
    this.elem.style.backgroundColor = sidebar.color;
    const closeButton = document.createElement('span');
    closeButton.innerHTML = 'x';
    this.elem.appendChild( closeButton );
    let container = document.querySelector('.lines');
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
  }

}

export { Sidebar, LineSidebar };
