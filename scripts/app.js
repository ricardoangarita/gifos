const LIGHT = 'Modo Diurno';
const DARK = 'modo nocturno';
const SEARCHHTMLURL = './html/search.html';
const FAVORITEHTMLURL = './html/favorite.html';
const GIFOSHTMLURL = './html/gifos.html';

let currentMainHtmlUrl = SEARCHHTMLURL;

// Header functionality
async function UpdateMenuIcon() {
  let menu = document.getElementById('burguer-menu');
  let currentIcon = menu.src.split('/').pop();
  let shift = document.getElementById('shift-mode');

  if (shift.innerHTML === DARK) {
    menu.src = currentIcon === 'burger.svg' ? './assets/close.svg' : './assets/burger.svg';
  } else if (currentIcon === 'close-modo-noct.svg' && shift.innerHTML === LIGHT) {
    menu.src = './assets/burger-modo-noct.svg';
  } else {
    menu.src = currentIcon === 'close.svg' ? './assets/burger-modo-noct.svg' : './assets/close-modo-noct.svg';
  }

  if ((currentIcon === 'burger.svg' || currentIcon === 'burger-modo-noct.svg') && currentMainHtmlUrl !== SEARCHHTMLURL) {
    await LoadSection(SEARCHHTMLURL);
    if (shift.innerHTML === LIGHT) {
      MainSearchNightMode();
    }
  }
  ShowMenu();
}

async function UpdatePresentationMode() {
  currentMainHtmlUrl = SEARCHHTMLURL;

  //Header
  UpdatePresentationModeText();

  let container = document.getElementsByClassName('container')[0];
  container.classList.toggle('night-container');

  let logo = document.getElementById('logo');
  logo.classList.toggle('night-logo');

  await UpdateMenuIcon();

  let nav = document.getElementsByTagName('nav')[0];
  nav.classList.toggle('night-nav');

  let coverMenu = document.getElementsByClassName('cover-menu')[0];
  coverMenu.classList.toggle('night-cover-menu');

  //Main
  MainSearchNightMode();

  let communityGifos = document.getElementsByClassName('community-gifos')[0];
  communityGifos.classList.toggle('night-community-gifos');

  //footer
  let socialMediaSection = document.getElementsByClassName('social-media-section')[0];
  socialMediaSection.classList.toggle('night-social-media-section');
}

function UpdatePresentationModeText() {
  let shift = document.getElementById('shift-mode');
  if (shift.innerHTML === DARK) {
    shift.innerHTML = LIGHT;
  } else {
    shift.innerHTML = DARK;
  }
}

//Cross functions
async function FetchHtmlAsText(url) {
  return await (await fetch(url)).text();
}

function ShowMenu() {
  let menuItem = document.getElementsByClassName('cover-menu')[0];
  menuItem.classList.toggle('display-cover-menu');
}

async function LoadSection(htmlUrl) {
  currentMainHtmlUrl = htmlUrl;
  let htmlText = await FetchHtmlAsText(htmlUrl);
  let main = document.getElementById('shift-container');
  main.innerHTML = htmlText;
  if (currentMainHtmlUrl !== SEARCHHTMLURL) {
    await UpdateMenuIcon();
  }
}

function MainSearchNightMode() {
  let message = document.getElementsByClassName('message')[0];
  message.classList.toggle('night-message');

  let searchGifoSection = document.getElementsByClassName('search-gifo-section')[0];
  searchGifoSection.classList.toggle('night-search-gifo-section');

  let trending = document.getElementsByClassName('trending')[0];
  trending.classList.toggle('night-trending');
}
