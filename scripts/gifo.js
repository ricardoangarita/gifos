import * as constant from './constants.js';

function Load() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.getElementsByTagName('body')[0].classList.add('darkMode');
  } else if (localStorage.getItem('darkMode') === 'false') {
    document.getElementsByTagName('body')[0].classList.remove('darkMode');
  }

  const gifoInfo = JSON.parse(sessionStorage.getItem('gifoUrl'));

  const close = document.querySelector('.expanded-close');
  close.addEventListener('click', CloseExpandedGifo);

  const gifo = document.querySelector('.expanded-gifo');
  gifo.setAttribute('src', gifoInfo.url);

  const user = document.querySelector('.user');
  user.textContent = gifoInfo.username;

  const gifoTitle = document.querySelector('.gifo-title');
  gifoTitle.textContent = gifoInfo.title;

  if (gifoInfo.url.includes(constant.GIFSURL)) {
    const deleteGifAction = document.querySelector('.expanded-action-favorite');
    deleteGifAction.classList.add('expanded-action-delete-gif');
    deleteGifAction.addEventListener('click', () => {
      RemoveGif(gifoInfo.id);
    });
  } else {
    const favoriteAction = document.querySelector('.expanded-action-favorite');

    let favoriteList = JSON.parse(localStorage.getItem('favorite'));
    if (favoriteList !== null) {
      if (favoriteList.find((x) => gifoInfo.id === x.id)) {
        favoriteAction.classList.add('expanded-action-favorite-select');
      }
    }

    favoriteAction.addEventListener('click', (e) => {
      FavoriteSelect(e);
    });
  }
  const downloadAction = document.querySelector('.expanded-action-download');
  downloadAction.addEventListener('click', async () => {
    await DownloadGifo(gifoInfo);
  });
}

function CloseExpandedGifo() {
  window.history.back();
}

function FavoriteRemove(favoriteList, gifoInfo, gifo) {
  favoriteList.filter((value, index, arr) => {
    if (value.id === gifoInfo.id) {
      favoriteList.splice(index, 1);
    }
  });
  localStorage.setItem('favorite', JSON.stringify(favoriteList));
  gifo.classList.remove('expanded-action-favorite-select');
}

function FavoriteAdd(favoriteList, gifoInfo) {
  let favoriteGifo = {
    id: gifoInfo.id,
    url: gifoInfo.url,
    username: gifoInfo.username,
    title: gifoInfo.title,
  };
  favoriteList.unshift(favoriteGifo);
  localStorage.setItem('favorite', JSON.stringify(favoriteList));

  let favoriteAction = document.querySelector('.expanded-action-favorite');
  favoriteAction.classList.add('expanded-action-favorite-select');
}

function FavoriteSelect(e) {
  let gifoInfo = JSON.parse(sessionStorage.getItem('gifoUrl'));
  let favorite = localStorage.getItem('favorite');
  if (favorite === null) {
    localStorage.setItem('favorite', JSON.stringify([]));
    favorite = JSON.parse(localStorage.getItem('favorite'));
  } else {
    favorite = JSON.parse(localStorage.getItem('favorite'));
  }
  if (e.target.classList.contains('expanded-action-favorite-select')) {
    FavoriteRemove(favorite, gifoInfo, e.target);
  } else {
    FavoriteAdd(favorite, gifoInfo);
  }
}

async function DownloadGifo(gifoInfo) {
  await fetch(gifoInfo.url)
    .then(async (res) => {
      let gif = await res.blob();
      let a = document.createElement('a');
      a.download = gifoInfo.title;
      a.href = window.URL.createObjectURL(gif);
      a.click();
    })
    .catch((err) => {
      console.log(err);
    });
}

function RemoveGif(id) {
  const gifos = JSON.parse(localStorage.getItem('gifos'));
  gifos.filter((value, index) => {
    if (value.id === id) {
      gifos.splice(index, 1);
    }
  });
  localStorage.setItem('gifos', JSON.stringify(gifos));
  CloseExpandedGifo();
}

Load();
