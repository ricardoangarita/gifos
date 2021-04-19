import * as constant from './constants.js';

sessionStorage.setItem('searchGifoOffset', 0);

let currentMainHtmlUrl = constant.SEARCHHTMLURL;

LoadSection(constant.SEARCHHTMLURL);
document.getElementById('burguer-menu').addEventListener('click', UpdateMenuIcon);
document.getElementById('shift-mode').addEventListener('click', UpdatePresentationMode);
document.getElementById('favorite-url').addEventListener('click', () => LoadSection(constant.FAVORITEHTMLURL));
document.getElementById('gifos-url').addEventListener('click', () => LoadSection(constant.GIFOSHTMLURL));

// Header functionalitys
async function UpdateMenuIcon() {
  let menu = document.getElementById('burguer-menu');
  let currentIcon = menu.src.split('/').pop();
  let shift = document.getElementById('shift-mode');

  if (shift.innerHTML === constant.DARK) {
    menu.src = currentIcon === 'burger.svg' ? './assets/close.svg' : './assets/burger.svg';
  } else if (currentIcon === 'close-modo-noct.svg' && shift.innerHTML === constant.LIGHT) {
    menu.src = './assets/burger-modo-noct.svg';
  } else {
    menu.src = currentIcon === 'close.svg' ? './assets/burger-modo-noct.svg' : './assets/close-modo-noct.svg';
  }

  if ((currentIcon === 'burger.svg' || currentIcon === 'burger-modo-noct.svg') && currentMainHtmlUrl !== constant.SEARCHHTMLURL && menu.style.display != 'none') {
    await LoadSection(constant.SEARCHHTMLURL);
    if (shift.innerHTML === constant.LIGHT) {
      MainSearchNightMode();
    }
  }
  ShowMenu();
}

async function UpdatePresentationMode() {
  currentMainHtmlUrl = constant.SEARCHHTMLURL;

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

  let menuItem = document.querySelectorAll('.menu-item');
  menuItem.forEach(x => {
    x.classList.toggle('night-menu-item');
  });

  let plusMenuItem = document.querySelector('.plus-menu-item');
  plusMenuItem.classList.toggle('night-plus-menu-item');

  //Main
  switch (currentMainHtmlUrl) {
    case constant.SEARCHHTMLURL:
      MainSearchNightMode();
      break;
    case constant.FAVORITEHTMLURL:
      break;
    case constant.GIFOSHTMLURL:
      break;
    default:
      MainSearchNightMode();
      break;
  }

  let communityGifos = document.getElementsByClassName('community-gifos')[0];
  communityGifos.classList.toggle('night-community-gifos');

  //footer
  let socialMediaSection = document.getElementsByClassName('social-media-section')[0];
  socialMediaSection.classList.toggle('night-social-media-section');
}

function UpdatePresentationModeText() {
  let shift = document.getElementById('shift-mode');
  if (shift.innerHTML === constant.DARK) {
    shift.innerHTML = constant.LIGHT;
  } else {
    shift.innerHTML = constant.DARK;
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
  if (currentMainHtmlUrl !== constant.SEARCHHTMLURL) {
    await UpdateMenuIcon();
  }
  switch (htmlUrl) {
    case constant.SEARCHHTMLURL:
      let searchIcon = document.getElementById('search-icon');
      let searchGifo = document.getElementById('search-gifos');
      searchIcon.addEventListener('click', () => {
        searchGifo.value = '';
      });
      searchGifo.addEventListener('input', ChangeSearchText);
      searchGifo.addEventListener('keypress', e => SearchByEnterKey(e, searchGifo.value));
      break;
    default:
      break;
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

let createGifosGrid = async wildcard => {
  if (wildcard.trim() !== '') {
    sessionStorage.setItem('searchGifoOffset', 0);
    await CallSearchEndpoint(constant.GETGIFOSURL, wildcard, 0).then(res => {
      let gifos = res.data;
      let grid = document.getElementById('gifos-grid');
      grid.innerHTML = '';
      let gifosSeparator = document.createElement('div');
      gifosSeparator.classList.add('gifos-separator');
      let gifosTitle = document.createElement('h2');
      gifosTitle.textContent = wildcard;
      grid.appendChild(gifosSeparator);
      grid.appendChild(gifosTitle);

      if (res.data.length > 0) {
        let more = document.getElementById('gifos-see-more');
        more.innerHTML = '';
        gifos.forEach(x => {
          let img = document.createElement('img');
          img.setAttribute('src', x.images.downsized.url);
          grid.appendChild(img);
        });
        let boxSeeMore = document.createElement('div');
        let seeMore = document.createElement('div');
        seeMore.textContent = 'VER MÁS';
        seeMore.classList.add('see-more');
        boxSeeMore.appendChild(seeMore);
        boxSeeMore.classList.add('box-see-more');
        more.appendChild(boxSeeMore);

        sessionStorage.setItem('searchGifoOffset', res.pagination.count + res.pagination.offset);
        seeMore.addEventListener('click', () => seeMoreGrid(grid, wildcard));
      } else {
        let img = document.createElement('img');
        img.setAttribute('src', './assets/icon-busqueda-sin-resultado.svg');
        let message = document.createElement('h2');
        message.textContent = 'Intenta con otra búsqueda.';
        message.classList.add('message');
        grid.appendChild(img);
        grid.appendChild(message);
      }
    });
  }
};

let seeMoreGrid = async (grid, wildcard) => {
  let offset = sessionStorage.getItem('searchGifoOffset');
  await CallSearchEndpoint(constant.GETGIFOSURL, wildcard, offset).then(res => {
    let gifos = res.data;
    gifos.forEach(x => {
      let img = document.createElement('img');
      img.setAttribute('src', x.images.downsized.url);
      grid.appendChild(img);
    });
    sessionStorage.setItem('searchGifoOffset', res.pagination.count + res.pagination.offset);
  });
};

let CallSearchEndpoint = async (url, wildcard, offset) => {
  let apiUrl = `${url}?api_key=${constant.APIKEYGIFOS}&limit=${constant.GIFOSLIMIT}`;
  if (wildcard !== '') {
    apiUrl = apiUrl + `&q=${wildcard}`;
  }
  if (offset !== 0) {
    apiUrl = apiUrl + `&offset=${offset}`;
  }
  let data = await fetch(apiUrl);
  let jsonResult = await data.json();
  return jsonResult;
};

let ChangeSearchText = async e => {
  let searchIcon = document.getElementById('search-icon');
  if (e.target.value.trim() !== '') {
    searchIcon.setAttribute('src', '../assets/close.svg');
    await Autocomplete(constant.GETGIFOSAUTOCOMPLETEURL, e.target.value);
  } else {
    searchIcon.setAttribute('src', '../assets/icon-search.svg');
  }
};

let SearchByEnterKey = async (e, wildcard) => {
  if (e.key === 'Enter') {
    await createGifosGrid(wildcard);
  }
};

const LoadTrendingGrifos = async () => {
  await CallSearchEndpoint(constant.GETGIFOSTRENDINGURL).then(data => {
    let gifos = data.data;
    const galleryContainer = document.querySelector('.gallery-container');
    const leftAction = document.createElement('img');
    leftAction.setAttribute('id', 'move-left');
    leftAction.setAttribute('src', '');

    galleryContainer.appendChild(leftAction);

    const galleryGif = document.createElement('div');
    galleryGif.classList.add('gallery-gif');

    galleryContainer.appendChild(galleryGif);

    gifos.forEach(x => {
      const imgGroup = document.createElement('div');
      imgGroup.classList.add('img-group');

      galleryGif.appendChild(imgGroup);

      const gifosImg = document.createElement('img');
      gifosImg.classList.add('gif');
      gifosImg.setAttribute('src', x.images.original.url);
      const imgCover = document.createElement('div');
      imgCover.classList.add('img-cover');

      imgGroup.appendChild(gifosImg);
      imgGroup.appendChild(imgCover);

      const imgAction = document.createElement('div');
      imgAction.classList.add('img-action');
      const imgFavorite = document.createElement('img');
      imgFavorite.classList.add('action-favorite');
      const imgDownload = document.createElement('img');
      imgDownload.classList.add('action-download');
      const imgMaximize = document.createElement('img');
      imgMaximize.classList.add('action-maximize');
    });

    const rightAction = document.createElement('img');
    rightAction.setAttribute('id', 'move-right');
    galleryContainer.appendChild(rightAction);
  });
};

const Autocomplete = async (url, wildcard) => {
  let apiUrl = `${url}?api_key=${constant.APIKEYGIFOS}&limit=${constant.SUGESTIONLIMIT}`;
  let data = await fetch(apiUrl);
  let jsonResult = await data.json();
  return jsonResult;
};

LoadTrendingGrifos();
