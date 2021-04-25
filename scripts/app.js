import * as constant from './constants.js';

let currentMainHtmlUrl = constant.SEARCHHTMLURL;

if (localStorage.getItem('darkMode') === 'true') {
  UpdatePresentationMode();
  UpdatePresentationModeText();
}

LoadSection(constant.SEARCHHTMLURL);

document.getElementById('logo').addEventListener('click', () => {
  LoadSection(constant.SEARCHHTMLURL);
});

document.querySelector('.burguer-menu').addEventListener('click', () => {
  UpdateMenuIcon();
  ShowMenu();
});
document.getElementById('shift-mode').addEventListener('click', () => {
  UpdatePresentationMode();
  UpdatePresentationModeText();
  UpdateMenuIcon();
  ShowMenu();
});

document.getElementById('favorite-url').addEventListener('click', () => {
  LoadSection(constant.FAVORITEHTMLURL);
  UpdateMenuIcon();
  ShowMenu();
});

document.getElementById('gifos-url').addEventListener('click', () => {
  LoadSection(constant.GIFOSHTMLURL);
  UpdateMenuIcon();
  ShowMenu();
});

// Header functionalitys
async function UpdateMenuIcon() {
  const burgerMenu = document.querySelector('.burguer-menu');
  burgerMenu.classList.toggle('close-burguer-menu');
}

async function UpdatePresentationMode() {
  let body = document.getElementsByTagName('body')[0];
  body.classList.toggle('dark-mode');
}

function UpdatePresentationModeText() {
  let shift = document.getElementById('shift-mode');
  if (shift.innerHTML === constant.DARK) {
    shift.innerHTML = constant.LIGHT;
    localStorage.setItem('darkMode', 'true');
  } else {
    shift.innerHTML = constant.DARK;
    localStorage.setItem('darkMode', 'false');
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
  if (htmlUrl === constant.SEARCHHTMLURL) {
    let searchIcon = document.querySelector('.search-icon');
    let searchGifo = document.getElementById('search-gifos');
    searchIcon.addEventListener('click', RemoveSearch);
    searchGifo.addEventListener('input', ChangeSearchText);
    searchGifo.addEventListener('keypress', e => SearchByEnterKey(e, searchGifo.value));
    await LoadTrendingSearchTerm();
  } else if (htmlUrl === constant.FAVORITEHTMLURL) {
    let favoriteList = JSON.parse(localStorage.getItem('favorite'));
    if (favoriteList.length > 0) {
      let favoriteListSection = document.querySelector('.favorite-list-section');
      let favoriteGrid = document.createElement('div');
      favoriteGrid.classList.add('favorite-grid');
      favoriteList.slice(0, constant.GIFOSLIMIT).forEach(x => {
        let img = document.createElement('img');
        img.setAttribute('src', x.url);
        img.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
        img.addEventListener('click', e => {
          ExpandedGifo(e);
        });
        favoriteGrid.appendChild(img);
      });
      favoriteListSection.appendChild(favoriteGrid);
    }
  }
}

let createGifosGrid = async wildcard => {
  if (wildcard.trim() !== '') {
    let typoSearchIcon = document.querySelector('.typo-search-icon');
    typoSearchIcon.classList.remove('show-typo-search-icon');
    sessionStorage.setItem('searchGifoOffset', 0);
    await CallSearchEndpoint(constant.GETGIFOSURL, wildcard, constant.GIFOSLIMIT).then(res => {
      let gifos = res.data;
      let grid = document.getElementById('gifos-grid');
      const gifosSeeMore = document.getElementById('gifos-see-more');
      gifosSeeMore.innerHTML = '';
      grid.innerHTML = '';
      let gifosSeparator = document.createElement('div');
      gifosSeparator.classList.add('gifos-separator');
      let gifosTitle = document.createElement('h2');
      gifosTitle.textContent = wildcard;
      grid.appendChild(gifosSeparator);
      grid.appendChild(gifosTitle);

      if (gifos.length > 0) {
        let more = document.getElementById('gifos-see-more');
        more.innerHTML = '';
        gifos.forEach(x => {
          let img = document.createElement('img');
          img.setAttribute('src', x.images.original.url);
          img.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
          img.addEventListener('click', e => {
            ExpandedGifo(e);
          });
          grid.appendChild(img);
        });

        if (res.pagination.total_count > constant.GIFOSLIMIT) {
          let boxSeeMore = document.createElement('div');
          let seeMore = document.createElement('div');
          seeMore.textContent = 'VER MÁS';
          seeMore.classList.add('see-more');
          boxSeeMore.appendChild(seeMore);
          boxSeeMore.classList.add('box-see-more');
          more.appendChild(boxSeeMore);

          sessionStorage.setItem('searchGifoOffset', res.pagination.count + res.pagination.offset);
          seeMore.addEventListener('click', () => seeMoreGrid(grid, wildcard));
        }
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
  let apiUrl = `${url}?api_key=${constant.APIKEYGIFOS}`;
  if (wildcard !== '') {
    apiUrl = apiUrl + `&q=${wildcard}`;
  }
  if (limit !== '') {
    apiUrl = apiUrl + `&limit=${limit}`;
  }
  if (offset !== 0) {
    apiUrl = apiUrl + `&offset=${offset}`;
  }
  let data = await fetch(apiUrl);
  let jsonResult = await data.json();
  return jsonResult;
};

let ChangeSearchText = async e => {
  let searchIcon = document.querySelector('.search-icon');
  if (e.target.value.trim() !== '') {
    searchIcon.classList.add('close-search-icon');
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
    searchIcon.classList.remove('close-search-icon');
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
  await CallSearchEndpoint(constant.GETGIFOSTRENDINGURL).then(res => {
    const galleryContainer = document.querySelector('.gallery-container');
    const leftAction = document.createElement('img');
    leftAction.setAttribute('id', 'move-left');
    leftAction.setAttribute('src', '');

    galleryContainer.appendChild(leftAction);

    const galleryGif = document.createElement('div');
    galleryGif.classList.add('gallery-gif');

    galleryContainer.appendChild(galleryGif);

    res.data.forEach(x => {
      const imgGroup = document.createElement('div');
      imgGroup.classList.add('img-group');

      galleryGif.appendChild(imgGroup);

      const gifosImg = document.createElement('img');
      gifosImg.classList.add('gif');
      gifosImg.setAttribute('src', x.images.original.url);
      gifosImg.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
      gifosImg.addEventListener('click', e => {
        ExpandedGifo(e);
      });
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
  let searchIcon = document.querySelector('.search-icon');
  searchIcon.classList.remove('close-search-icon');
};

const LoadTrendingSearchTerm = async () => {
  await CallSearchEndpoint(constant.GETGIFOSTRENDINGTERMSURL)
    .then(res => {
      const trendingSearchTerm = document.querySelector('.trending-search-term');
      trendingSearchTerm.classList.add('treding-search-term');
      res.data.slice(0, constant.TRENDINGSEARCHNUMBER).forEach((x, index) => {
        const a = document.createElement('a');
        a.textContent = index !== constant.TRENDINGSEARCHNUMBER - 1 ? `${x},` : `${x}`;
        a.addEventListener('click', async () => {
          const wildcard = a.textContent.replace(',', '');
          await createGifosGrid(wildcard);
          let searchTerm = document.getElementById('search-gifos');
          searchTerm.value = wildcard.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        });
        trendingSearchTerm.appendChild(a);
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const ExpandedGifo = e => {
  const data = e.target;
  let gifoInfo = {
    id: data.alt.split('-')[0].trim(),
    url: data.src,
    username: data.alt.split('-')[1].trim(),
    title: data.alt.split('-')[2].trim()
  };
  sessionStorage.setItem('gifoUrl', JSON.stringify(gifoInfo));
  window.open('./expanded-gifo.html', '_self');
};

const FavoriteSeeMore = () => {
  let start = sessionStorage.getItem('startFavorite');
  let end = sessionStorage.getItem('endFavorite');
  let favoriteList = JSON.parse(localStorage.getItem('favorite'));
  let favoriteGrid = document.querySelector('.favorite-grid');
  if (favoriteList.length > 0) {
    start = start === null ? 0 : start;
    end = end === null ? constant.GIFOSLIMIT : end;
    favoriteList.forEach((x, index) => {
      if (index >= start && index <= end) {
        const gifosImg = document.createElement('img');
        gifosImg.classList.add('gif');
        gifosImg.setAttribute('src', x.images.original.url);
        gifosImg.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
        gifosImg.addEventListener('click', e => {
          ExpandedGifo(e);
        });
        favoriteGrid.appendChild(gifosImg);
      }
    });
    sessionStorage.setItem('startFavorite', end + 1);
    sessionStorage.setItem('endFavorite', end + constant.GIFOSLIMIT);
  }
};

LoadTrendingGrifos();
