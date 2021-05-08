import * as constant from './constants.js';

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

document.querySelector('.move-right').addEventListener('click', () => {
  document.querySelector('.trending-container').scrollBy({
    left: 300,
    top: 0,
    behavior: 'smooth',
  });
});

document.querySelector('.move-left').addEventListener('click', () => {
  document.querySelector('.trending-container').scrollBy({
    left: -300,
    top: 0,
    behavior: 'smooth',
  });
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
  let htmlText = await FetchHtmlAsText(htmlUrl);
  let main = document.getElementById('shift-container');
  main.innerHTML = htmlText;
  if (htmlUrl === constant.SEARCHHTMLURL) {
    let searchIcon = document.querySelector('.search-icon');
    let searchGifo = document.getElementById('search-gifos');
    searchIcon.addEventListener('click', RemoveSearch);
    searchGifo.addEventListener('input', ChangeSearchText);
    searchGifo.addEventListener('keypress', (e) =>
      SearchByEnterKey(e, searchGifo.value)
    );
    await LoadTrendingSearchTerm();
  } else if (htmlUrl === constant.FAVORITEHTMLURL) {
    let favoriteList = JSON.parse(localStorage.getItem('favorite'));
    sessionStorage.setItem('favoriteStart', 0);
    sessionStorage.setItem('favoriteEnd', constant.GIFOSLIMIT);
    let favoriteListSection = document.querySelector('.favorite-list-section');

    if (favoriteList !== null && favoriteList.length > 0) {
      LoadFavoriteGif();
    } else {
      let emptyFavorite = document.createElement('div');
      emptyFavorite.classList.add('empty-favorite-grid');
      let img = document.createElement('img');
      let span = document.createElement('span');
      span.textContent =
        '"¡Guarda tu primer GIFO en Favoritos para que se muestre aqui!"';
      emptyFavorite.appendChild(img);
      emptyFavorite.appendChild(span);
      favoriteListSection.appendChild(emptyFavorite);
    }
  } else if (htmlUrl === constant.GETGIFOSURL) {
    let myGifosList = JSON.parse(localStorage.getItem('myGif'));
    let myGifosSection = document.querySelector('.gifos-grid-section');
    if (myGifosList !== null && myGifosList.length > 0) {
      let myGifosGrid = document.createElement('div');
      myGifosGrid.classList.add('my-gifos-grid');
      myGifosList.slice(0, constant.GIFOSLIMIT).forEach((x) => {
        let img = document.createElement('img');
        img.setAttribute('src', x.url);
        img.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
        img.addEventListener('click', (e) => {
          ExpandedGifo(e);
        });
        myGifosGrid.appendChild(img);
      });
      myGifosSection.appendChild(myGifosGrid);
    } else {
      let emptyGifos = document.createElement('div');
      emptyGifos.classList.add('empty-favorite-grid');
      let img = document.createElement('img');
      let span = document.createElement('span');
      span.textContent =
        '"¡Guarda tu primer GIFO en Favoritos para que se muestre aqui!"';
      emptyGifos.appendChild(img);
      emptyGifos.appendChild(span);
      myGifosSection.appendChild(emptyFavorite);
    }
  }
}

let createGifosGrid = async (wildcard) => {
  if (wildcard.trim() !== '') {
    let typoSearchIcon = document.querySelector('.typo-search-icon');
    typoSearchIcon.classList.remove('show-typo-search-icon');
    sessionStorage.setItem('searchGifoOffset', 0);
    await CallSearchEndpoint(
      constant.GETGIFOSURL,
      wildcard,
      constant.GIFOSLIMIT
    ).then((res) => {
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

        gifos.forEach((x) => {
          let img = document.createElement('img');
          img.setAttribute('src', x.images.original.url);
          img.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
          const gifoInfo = {
            id: x.id,
            url: x.images.original.url,
            username: x.username,
            title: x.title,
          };
          img.addEventListener('click', () => {
            ExpandedGifo(gifoInfo);
          });
          const imgGroup = document.createElement('div');
          imgGroup.classList.add('img-group');

          const imgCover = document.createElement('div');
          imgCover.classList.add('img-cover');

          const imgActionContainer = document.createElement('div');
          imgActionContainer.classList.add('img-action-container');

          const imgFavorite = document.createElement('img');
          imgFavorite.classList.add('favorite-action');
          imgFavorite.addEventListener('click', () => {
            FavoriteAdd(gifoInfo);
          });

          const imgDownload = document.createElement('img');
          imgDownload.classList.add('download-action');
          imgDownload.addEventListener('click', async () => {
            await downloadGifo(x.images.original.url, x.title);
          });
          const imgExpand = document.createElement('img');
          imgExpand.classList.add('expand-action');
          imgExpand.addEventListener('click', () => {
            ExpandedGifo({
              id: x.id,
              url: x.images.original.url,
              username: x.username,
              title: x.title,
            });
          });

          const gifoDescription = document.createElement('div');
          gifoDescription.classList.add('gifo-description');
          const gifoUser = document.createElement('h3');
          gifoUser.classList.add('gifo-user');
          gifoUser.textContent = x.username;
          const gifoTitle = document.createElement('h4');
          gifoTitle.classList.add('gifo-title');
          gifoTitle.textContent = x.title;

          gifoDescription.appendChild(gifoUser);
          gifoDescription.appendChild(gifoTitle);

          imgActionContainer.appendChild(imgFavorite);
          imgActionContainer.appendChild(imgDownload);
          imgActionContainer.appendChild(imgExpand);

          imgCover.appendChild(imgActionContainer);
          imgCover.appendChild(gifoDescription);

          imgGroup.appendChild(img);
          imgGroup.appendChild(imgCover);

          grid.appendChild(imgGroup);
        });

        sessionStorage.setItem(
          'searchGifoOffset',
          res.pagination.count + res.pagination.offset
        );

        if (
          res.pagination.total_count >
          sessionStorage.getItem('searchGifoOffset')
        ) {
          let boxSeeMore = document.createElement('div');
          let seeMore = document.createElement('div');
          seeMore.textContent = 'VER MÁS';
          seeMore.classList.add('see-more');
          boxSeeMore.appendChild(seeMore);
          boxSeeMore.classList.add('box-see-more');
          more.appendChild(boxSeeMore);
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
  await CallSearchEndpoint(
    constant.GETGIFOSURL,
    wildcard,
    constant.GIFOSLIMIT,
    offset
  ).then((res) => {
    let gifos = res.data;
    gifos.forEach((x) => {
      let img = document.createElement('img');
      img.setAttribute('src', x.images.original.url);
      img.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
      const gifoInfo = {
        id: x.id,
        url: x.images.original.url,
        username: x.username,
        title: x.title,
      };
      img.addEventListener('click', () => {
        ExpandedGifo(gifoInfo);
      });
      const imgGroup = document.createElement('div');
      imgGroup.classList.add('img-group');

      const imgCover = document.createElement('div');
      imgCover.classList.add('img-cover');

      const imgActionContainer = document.createElement('div');
      imgActionContainer.classList.add('img-action-container');

      const imgFavorite = document.createElement('img');
      imgFavorite.classList.add('favorite-action');
      imgFavorite.addEventListener('click', () => {
        FavoriteAdd(gifoInfo);
      });

      const imgDownload = document.createElement('img');
      imgDownload.classList.add('download-action');
      imgDownload.addEventListener('click', async () => {
        await downloadGifo(x.images.original.url, x.title);
      });
      const imgExpand = document.createElement('img');
      imgExpand.classList.add('expand-action');
      imgExpand.addEventListener('click', () => {
        ExpandedGifo({
          id: x.id,
          url: x.images.original.url,
          username: x.username,
          title: x.title,
        });
      });

      const gifoDescription = document.createElement('div');
      gifoDescription.classList.add('gifo-description');
      const gifoUser = document.createElement('h3');
      gifoUser.classList.add('gifo-user');
      gifoUser.textContent = x.username;
      const gifoTitle = document.createElement('h4');
      gifoTitle.classList.add('gifo-title');
      gifoTitle.textContent = x.title;

      gifoDescription.appendChild(gifoUser);
      gifoDescription.appendChild(gifoTitle);

      imgActionContainer.appendChild(imgFavorite);
      imgActionContainer.appendChild(imgDownload);
      imgActionContainer.appendChild(imgExpand);

      imgCover.appendChild(imgActionContainer);
      imgCover.appendChild(gifoDescription);

      imgGroup.appendChild(img);
      imgGroup.appendChild(imgCover);

      grid.appendChild(imgGroup);
    });
    sessionStorage.setItem(
      'searchGifoOffset',
      res.pagination.count + res.pagination.offset
    );
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

let ChangeSearchText = async (e) => {
  let searchIcon = document.querySelector('.search-icon');
  if (e.target.value.trim() !== '') {
    searchIcon.classList.add('close-search-icon');
    await CallSearchEndpoint(
      constant.GETGIFOSAUTOCOMPLETEURL,
      e.target.value,
      constant.SUGESTIONLIMIT
    ).then((res) => {
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
        res.data.forEach((x) => {
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
  await CallSearchEndpoint(constant.GETGIFOSTRENDINGURL).then((res) => {
    const trendingContainer = document.querySelector('.trending-container');
    res.data.forEach((x) => {
      const imgGroup = document.createElement('div');
      imgGroup.classList.add('img-group');

      const gifosImg = document.createElement('img');
      gifosImg.classList.add('gif');
      gifosImg.setAttribute('src', x.images.original.url);
      gifosImg.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);

      let gifoInfo = {
        id: x.id,
        url: x.images.original.url,
        username: x.username,
        title: x.title,
      };

      gifosImg.addEventListener('click', () => {
        ExpandedGifo(gifoInfo);
      });

      const imgCover = document.createElement('div');
      imgCover.classList.add('img-cover');

      imgGroup.appendChild(gifosImg);

      const imgActionContainer = document.createElement('div');
      imgActionContainer.classList.add('img-action-container');

      const imgFavorite = document.createElement('img');
      imgFavorite.classList.add('favorite-action');
      imgFavorite.addEventListener('click', () => {
        FavoriteAdd(gifoInfo);
      });
      const imgDownload = document.createElement('img');
      imgDownload.classList.add('download-action');
      imgDownload.addEventListener('click', async () => {
        await downloadGifo(x.images.original.url, x.title);
      });
      const imgExpand = document.createElement('img');
      imgExpand.classList.add('expand-action');
      imgExpand.addEventListener('click', () => {
        ExpandedGifo({
          id: x.id,
          url: x.images.original.url,
          username: x.username,
          title: x.title,
        });
      });

      const gifoDescription = document.createElement('div');
      gifoDescription.classList.add('gifo-description');
      const gifoUser = document.createElement('span');
      gifoUser.classList.add('gifo-user');
      gifoUser.textContent = x.username;
      const gifoTitle = document.createElement('h2');
      gifoTitle.classList.add('gifo-title');
      gifoTitle.textContent = x.title;

      gifoDescription.appendChild(gifoUser);
      gifoDescription.appendChild(gifoTitle);

      imgActionContainer.appendChild(imgFavorite);
      imgActionContainer.appendChild(imgDownload);
      imgActionContainer.appendChild(imgExpand);

      imgCover.appendChild(imgActionContainer);
      imgCover.appendChild(gifoDescription);
      imgGroup.appendChild(imgCover);
      trendingContainer.appendChild(imgGroup);
    });
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
    .then((res) => {
      const trendingSearchTerm = document.querySelector(
        '.trending-search-term'
      );
      trendingSearchTerm.classList.add('treding-search-term');
      res.data.slice(0, constant.TRENDINGSEARCHNUMBER).forEach((x, index) => {
        const a = document.createElement('a');
        a.textContent =
          index !== constant.TRENDINGSEARCHNUMBER - 1 ? `${x},` : `${x}`;
        a.addEventListener('click', async () => {
          const wildcard = a.textContent.replace(',', '');
          await createGifosGrid(wildcard);
          let searchTerm = document.getElementById('search-gifos');
          searchTerm.value = wildcard.replace(
            /(^\w{1})|(\s+\w{1})/g,
            (letter) => letter.toUpperCase()
          );
        });
        trendingSearchTerm.appendChild(a);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const ExpandedGifo = (gifoInfo) => {
  let gifo = {
    id: gifoInfo.id,
    url: gifoInfo.url,
    username: gifoInfo.username,
    title: gifoInfo.title,
  };
  sessionStorage.setItem('gifoUrl', JSON.stringify(gifo));
  window.open('./expanded-gifo.html', '_self');
};

const FavoriteSeeMore = () => {
  let start = sessionStorage.getItem('favoriteStart');
  let end = sessionStorage.getItem('favoriteEnd');
  let favoriteListSection = document.querySelector('.favorite-list-section');
  let favoriteGrid = document.querySelector('.favorite-grid');

  let favoriteList = JSON.parse(localStorage.getItem('favorite'));

  favoriteList.slice(start, end).forEach((x) => {
    let img = document.createElement('img');
    img.setAttribute('src', x.url);
    img.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
    const gifoInfo = {
      id: x.id,
      url: x.url,
      username: x.username,
      title: x.title,
    };
    img.addEventListener('click', () => {
      ExpandedGifo(gifoInfo);
    });
    const imgGroup = document.createElement('div');
    imgGroup.classList.add('img-group');

    const imgCover = document.createElement('div');
    imgCover.classList.add('img-cover');

    const imgActionContainer = document.createElement('div');
    imgActionContainer.classList.add('img-action-container');

    const imgFavorite = document.createElement('img');
    imgFavorite.classList.add('favorite-action');
    imgFavorite.addEventListener('click', () => {
      FavoriteRemove(x.id, imgGroup);
    });

    const imgDownload = document.createElement('img');
    imgDownload.classList.add('download-action');
    imgDownload.addEventListener('click', async () => {
      await downloadGifo(x.url, x.title);
    });
    const imgExpand = document.createElement('img');
    imgExpand.classList.add('expand-action');
    imgExpand.addEventListener('click', () => {
      ExpandedGifo(gifoInfo);
    });

    const gifoDescription = document.createElement('div');
    gifoDescription.classList.add('gifo-description');
    const gifoUser = document.createElement('h3');
    gifoUser.classList.add('gifo-user');
    gifoUser.textContent = x.username;
    const gifoTitle = document.createElement('h4');
    gifoTitle.classList.add('gifo-title');
    gifoTitle.textContent = x.title;

    gifoDescription.appendChild(gifoUser);
    gifoDescription.appendChild(gifoTitle);

    imgActionContainer.appendChild(imgFavorite);
    imgActionContainer.appendChild(imgDownload);
    imgActionContainer.appendChild(imgExpand);

    imgCover.appendChild(imgActionContainer);
    imgCover.appendChild(gifoDescription);

    imgGroup.appendChild(img);
    imgGroup.appendChild(imgCover);

    favoriteGrid.appendChild(imgGroup);
  });
  sessionStorage.setItem('favoriteStart', end);
  sessionStorage.setItem('favoriteEnd', parseInt(end) + constant.GIFOSLIMIT);
  if (favoriteList.length < sessionStorage.getItem('favoriteStart')) {
    let moreFavorite = document.querySelector('.more-favorite');
    moreFavorite.innerHTML = '';
  }
};

const LoadFavoriteGif = () => {
  let favoriteList = JSON.parse(localStorage.getItem('favorite'));
  let favoriteListSection = document.querySelector('.favorite-list-section');

  let favoriteGrid = document.querySelector('.favorite-grid');

  let start =
    sessionStorage.getItem('favoriteStart') === null
      ? 0
      : sessionStorage.getItem('favoriteStart');
  let end =
    sessionStorage.getItem('favoriteEnd') === null
      ? constant.GIFOSLIMIT
      : sessionStorage.getItem('favoriteEnd');

  favoriteList.slice(start, end).forEach((x) => {
    let img = document.createElement('img');
    img.setAttribute('src', x.url);
    img.setAttribute('alt', `${x.id} - ${x.username} - ${x.title}`);
    const gifoInfo = {
      id: x.id,
      url: x.url,
      username: x.username,
      title: x.title,
    };
    img.addEventListener('click', () => {
      ExpandedGifo(gifoInfo);
    });
    const imgGroup = document.createElement('div');
    imgGroup.classList.add('img-group');

    const imgCover = document.createElement('div');
    imgCover.classList.add('img-cover');

    const imgActionContainer = document.createElement('div');
    imgActionContainer.classList.add('img-action-container');

    const imgFavorite = document.createElement('img');
    imgFavorite.classList.add('favorite-action');
    imgFavorite.addEventListener('click', () => {
      FavoriteRemove(x.id, imgGroup);
    });

    const imgDownload = document.createElement('img');
    imgDownload.classList.add('download-action');
    imgDownload.addEventListener('click', async () => {
      await downloadGifo(x.url, x.title);
    });
    const imgExpand = document.createElement('img');
    imgExpand.classList.add('expand-action');
    imgExpand.addEventListener('click', () => {
      ExpandedGifo(gifoInfo);
    });

    const gifoDescription = document.createElement('div');
    gifoDescription.classList.add('gifo-description');
    const gifoUser = document.createElement('h3');
    gifoUser.classList.add('gifo-user');
    gifoUser.textContent = x.username;
    const gifoTitle = document.createElement('h4');
    gifoTitle.classList.add('gifo-title');
    gifoTitle.textContent = x.title;

    gifoDescription.appendChild(gifoUser);
    gifoDescription.appendChild(gifoTitle);

    imgActionContainer.appendChild(imgFavorite);
    imgActionContainer.appendChild(imgDownload);
    imgActionContainer.appendChild(imgExpand);

    imgCover.appendChild(imgActionContainer);
    imgCover.appendChild(gifoDescription);

    imgGroup.appendChild(img);
    imgGroup.appendChild(imgCover);

    favoriteGrid.appendChild(imgGroup);
    favoriteListSection.appendChild(favoriteGrid);
  });

  sessionStorage.setItem('favoriteStart', parseInt(end));
  sessionStorage.setItem(
    'favoriteEnd',
    parseInt(end) + parseInt(constant.GIFOSLIMIT)
  );
  if (favoriteList.length > start) {
    let moreFavorite = document.createElement('div');
    moreFavorite.classList.add('more-favorite');
    let seeMoreText = document.createElement('span');
    seeMoreText.textContent = 'VER MÁS';
    moreFavorite.appendChild(seeMoreText);
    favoriteListSection.appendChild(moreFavorite);
    moreFavorite.addEventListener('click', FavoriteSeeMore);
  }
};

const downloadGifo = async (url, title) => {
  await fetch(url)
    .then(async (res) => {
      let gif = await res.blob();
      let a = document.createElement('a');
      a.download = title;
      a.href = window.URL.createObjectURL(gif);
      a.click();
    })
    .catch((err) => {
      console.log(err);
    });
};

const FavoriteAdd = (gifoInfo) => {
  let favoriteGifo = {
    id: gifoInfo.id,
    url: gifoInfo.url,
    username: gifoInfo.username,
    title: gifoInfo.title,
  };
  let favoriteList = JSON.parse(localStorage.getItem('favorite'));
  favoriteList = favoriteList !== null ? favoriteList : [];

  if (!favoriteList.find((x) => gifoInfo.id === x.id)) {
    favoriteList.unshift(favoriteGifo);
    localStorage.setItem('favorite', JSON.stringify(favoriteList));
  }
};

function FavoriteRemove(id, img) {
  let favoriteGrid = document.querySelector('.favorite-grid');
  let favoriteList = JSON.parse(localStorage.getItem('favorite'));
  favoriteList.filter((value, index) => {
    if (value.id === id) {
      favoriteList.splice(index, 1);
    }
  });
  localStorage.setItem('favorite', JSON.stringify(favoriteList));
  favoriteGrid.removeChild(img);
}

LoadTrendingGrifos();
