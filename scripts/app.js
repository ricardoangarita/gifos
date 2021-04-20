import * as constant from './constants.js';

sessionStorage.setItem('searchGifoOffset', 0);
sessionStorage.setItem('isFirstLoad', 'true');

let currentMainHtmlUrl = constant.SEARCHHTMLURL;

LoadSection(constant.SEARCHHTMLURL);

document.getElementById('burguer-menu').addEventListener('click', UpdateMenuIcon);
document.getElementById('shift-mode').addEventListener('click', UpdatePresentationMode);
document.getElementById('favorite-url').addEventListener('click', () => LoadSection(constant.FAVORITEHTMLURL));
document.getElementById('gifos-url').addEventListener('click', () => LoadSection(constant.GIFOSHTMLURL));

// Header functionalitys
async function UpdateMenuIcon() {
  let isFirstLoad = sessionStorage.getItem('isFirstLoad');

  let menu = document.getElementById('burguer-menu');
  let currentIcon = menu.src.split('/').pop();
  let shift = document.getElementById('shift-mode');

  if (shift.innerHTML === constant.DARK) {
    menu.src = currentIcon === 'burger.svg' ? './assets/close.svg' : './assets/burger.svg';
  } else if ((currentIcon === 'close-modo-noct.svg' && shift.innerHTML === constant.LIGHT) || (isFirstLoad && shift.innerHTML === constant.LIGHT)) {
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
  if (isFirstLoad === 'false') {
    ShowMenu();
  }
}

async function UpdatePresentationMode() {
  // currentMainHtmlUrl = constant.SEARCHHTMLURL;

  //Header
  UpdatePresentationModeText();

  let container = document.querySelector('.container');
  container.classList.toggle('night-container');

  let logo = document.getElementById('logo');
  logo.classList.toggle('night-logo');

  await UpdateMenuIcon();

  let nav = document.getElementsByTagName('nav')[0];
  nav.classList.toggle('night-nav');

  let coverMenu = document.querySelector('.cover-menu');
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

  let communityGifos = document.querySelector('.community-gifos');
  communityGifos.classList.toggle('night-community-gifos');

  //footer
  let socialMediaSection = document.querySelector('.social-media-section');
  socialMediaSection.classList.toggle('night-social-media-section');
}

function UpdatePresentationModeText() {
  let isDarkMode = localStorage.getItem('darkMode');
  let shift = document.getElementById('shift-mode');
  if (shift.innerHTML === constant.DARK) {
    shift.innerHTML = constant.LIGHT;
    if (isDarkMode !== null) {
      localStorage.setItem('darkMode', 1);
    }
  } else {
    shift.innerHTML = constant.DARK;
    if (isDarkMode !== null) {
      localStorage.setItem('darkMode', 0);
    }
  }
}

//Cross functions
async function FetchHtmlAsText(url) {
  return await (await fetch(url)).text();
}

function ShowMenu() {
  let menuItem = document.querySelector('.cover-menu');
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
      searchIcon.addEventListener('click', RemoveSearch);
      searchGifo.addEventListener('input', ChangeSearchText);
      searchGifo.addEventListener('keypress', e => SearchByEnterKey(e, searchGifo.value));
      let isDarkMode = localStorage.getItem('darkMode');
      if (isDarkMode) {
        UpdatePresentationMode();
      }
      sessionStorage.setItem('isFirstLoad', 'false');
      break;
    default:
      break;
  }
}

function MainSearchNightMode() {
  let message = document.querySelector('.message');
  message.classList.toggle('night-message');

  let searchGifoSection = document.querySelector('.search-gifo-section');
  searchGifoSection.classList.toggle('night-search-gifo-section');

  let trending = document.querySelector('.trending');
  trending.classList.toggle('night-trending');
}

let createGifosGrid = async wildcard => {
  if (wildcard.trim() !== '') {
    let typoSearchIcon = document.querySelector('.typo-search-icon');
    typoSearchIcon.classList.remove('show-typo-search-icon');
    sessionStorage.setItem('searchGifoOffset', 0);
    await CallSearchEndpoint(constant.GETGIFOSURL, wildcard, constant.GIFOSLIMIT).then(res => {
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
        let sugestionSection = document.querySelector('.sugestion-section');
        sugestionSection.classList.remove('show-sugestion-section');
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
  await CallSearchEndpoint(constant.GETGIFOSURL, wildcard, constant.GIFOSLIMIT, offset).then(res => {
    let gifos = res.data;
    gifos.forEach(x => {
      let img = document.createElement('img');
      img.setAttribute('src', x.images.downsized.url);
      grid.appendChild(img);
    });
    sessionStorage.setItem('searchGifoOffset', res.pagination.count + res.pagination.offset);
  });
};

let CallSearchEndpoint = async (url, wildcard, limit, offset) => {
  let apiUrl = `${url}?api_key=${constant.APIKEYGIFOS}&limit=${limit}`;
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
    await CallSearchEndpoint(constant.GETGIFOSAUTOCOMPLETEURL, e.target.value, constant.SUGESTIONLIMIT).then(res => {
      let typoSearch = document.querySelector('.typo-search-icon');
      typoSearch.classList.add('show-typo-search-icon');
      let sugestionSection = document.querySelector('.sugestion-section');
      sugestionSection.classList.add('show-sugestion-section');
      sugestionSection.innerHTML = '';

      let gifSugestion = document.createElement('div');
      gifSugestion.classList.add('gif-sugestion');
      let sugestionSeparator = document.createElement('div');
      sugestionSeparator.classList.add('sugestion-separator');

      gifSugestion.appendChild(sugestionSeparator);
      sugestionSection.appendChild(gifSugestion);
      if (res.data.length > 0) {
        res.data.forEach(x => {
          let sugestionBlock = document.createElement('div');
          sugestionBlock.classList.add('sugestion-block');

          let img = document.createElement('img');
          img.setAttribute('src', '../assets/icon-search-type.svg');
          img.classList.add('show-typo-search-icon');
          img.classList.add('search-icon-sugestion');
          let paragraph = document.createElement('p');
          paragraph.classList.add('sugestion');
          paragraph.textContent = x.name;
          paragraph.addEventListener('click', () => {
            e.target.value = x.name;
            createGifosGrid(x.name);
            console.log(img);
            img.classList.remove('show-typo-search-icon');
            img.classList.add('typo-search-icon');
            typoSearch.classList.remove('show-typo-search-icon');
          });
          gifSugestion.appendChild(sugestionBlock);
          sugestionBlock.appendChild(img);
          sugestionBlock.appendChild(paragraph);
        });
      } else {
        sugestionSection.classList.remove('show-sugestion-section');
      }
    });
  } else {
    let sugestionSection = document.querySelector('.sugestion-section');
    sugestionSection.classList.remove('show-sugestion-section');
    searchIcon.setAttribute('src', '../assets/icon-search.svg');
    let typoSearchIcon = document.querySelector('.typo-search-icon');
    typoSearchIcon.classList.remove('show-typo-search-icon');
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

const RemoveSearch = () => {
  let searchGifo = document.getElementById('search-gifos');
  searchGifo.value = '';
  let typoSearchIcon = document.querySelector('.typo-search-icon');
  typoSearchIcon.classList.remove('show-typo-search-icon');
  let sugestionSection = document.querySelector('.sugestion-section');
  sugestionSection.classList.remove('show-sugestion-section');
  let searchIcon = document.getElementById('search-icon');
  searchIcon.setAttribute('src', '../assets/icon-search.svg');
};

LoadTrendingGrifos();
