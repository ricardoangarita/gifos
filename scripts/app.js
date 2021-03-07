function UpdateMenuIcon() {
  let menu = document.getElementById('burguer-menu');
  let currentIcon = menu.src.split('/').pop();
  menu.src = currentIcon === 'burger.svg' ? './assets/close.svg' : './assets/burger.svg';
  ShowMenu();
}

function ShowMenu() {
  let menuItem = document.getElementsByClassName('cover-menu');
  console.log(menuItem[0].style.display);
  menuItem[0].style.display = menuItem[0].style.display === 'none' || menuItem[0].style.display === '' ? 'block' : 'none';
}

function NightMode() {
  let container = document.getElementsByClassName('container')[0];
  container.classList.toggle('night-container');

  let logo = document.getElementById('logo');
  logo.classList.toggle('night-logo');

  let menu = document.getElementById('burguer-menu');
  menu.src = './assets/burger-modo-noct.svg';
  // UpdateMenuIcon();

  let nav = document.getElementsByTagName('nav')[0];
  nav.classList.toggle('night-nav');

  let coverMenu = document.getElementsByClassName('cover-menu')[0];
  coverMenu.classList.toggle('night-cover-menu');
  coverMenu.style.display = 'none';

  ShiftModeNight();
}

function ShiftModeNight() {
  let mode = document.getElementById('shift-mode');
  mode.innerHTML = mode.innerHTML === 'modo nocturno' ? 'Modo Diurno' : 'modo nocturno';
}
