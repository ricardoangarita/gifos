const light = 'Modo Diurno';
const dark = 'modo nocturno';

// Header functionality
function UpdateMenuIcon() {
  let menu = document.getElementById('burguer-menu');
  let currentIcon = menu.src.split('/').pop();
  let shift = document.getElementById('shift-mode');

  if (shift.innerHTML === dark) {
    menu.src = currentIcon === 'burger.svg' ? './assets/close.svg' : './assets/burger.svg';
  } else if (currentIcon === 'Button-close-modo-noc.svg' && shift.innerHTML === light) {
    menu.src = './assets/burger-modo-noct.svg';
  } else {
    menu.src = currentIcon === 'close.svg' ? './assets/burger-modo-noct.svg' : './assets/Button-close-modo-noc.svg';
  }
  ShowMenu();
}

function ShowMenu() {
  let menuItem = document.getElementsByClassName('cover-menu');
  menuItem[0].style.display = menuItem[0].style.display === 'none' || menuItem[0].style.display === '' ? 'block' : 'none';
}

function UpdatePresentationMode() {
  //Header
  UpdatePresentationModeText();

  let container = document.getElementsByClassName('container')[0];
  container.classList.toggle('night-container');

  let logo = document.getElementById('logo');
  logo.classList.toggle('night-logo');

  UpdateMenuIcon();

  let nav = document.getElementsByTagName('nav')[0];
  nav.classList.toggle('night-nav');

  let coverMenu = document.getElementsByClassName('cover-menu')[0];
  coverMenu.classList.toggle('night-cover-menu');
  coverMenu.style.display = 'none';

  //Main
  let message = document.getElementsByClassName('message')[0];
  message.classList.toggle('night-message');
  let trending = document.getElementsByClassName('trending')[0];
  trending.classList.toggle('night-trending');
  let communityGifos = document.getElementsByClassName('community-gifos')[0];
  communityGifos.classList.toggle('night-community-gifos');

  //footer
  let socialMediaSection = document.getElementsByClassName('social-media-section')[0];
  socialMediaSection.classList.toggle('night-social-media-section');
}

function UpdatePresentationModeText() {
  let shift = document.getElementById('shift-mode');
  if (shift.innerHTML === dark) {
    shift.innerHTML = light;
  } else {
    shift.innerHTML = dark;
  }
}
