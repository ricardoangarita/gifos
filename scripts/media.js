import * as constants from './constants.js';

let timer;
let hours = 0;
let minutes = 0;
let seconds = 0;

const Timer = () => {
  timer = setTimeout(AddTime, 1000);
};

function AddTime() {
  seconds++;
  if (seconds >= 60) {
    seconds = 0;
    minutes++;
    if (minutes >= 60) {
      minutes = 0;
      hours++;
    }
  }
  let timerText = document.querySelector('.timer');
  timerText.textContent =
    (hours ? (hours > 9 ? hours : '0' + hours) : '00') +
    ':' +
    (minutes ? (minutes > 9 ? minutes : '0' + minutes) : '00') +
    ':' +
    (seconds > 9 ? seconds : '0' + seconds);

  Timer();
}

const GetCameraAccess = async (constraints) => {
  try {
    await navigator.mediaDevices
      .getUserMedia(constraints)
      .then((res) => {
        const video = document.querySelector('.video');
        video.srcObject = res;
        video.onloadedmetadata = function (e) {
          video.play();
        };

        document
          .querySelector('.text-container')
          .classList.add('text-container-hidden');

        document.querySelector('.video').classList.remove('video-hidden');

        document
          .querySelector('.request-recorder')
          .classList.add('recorder-hidden');
        document.querySelector('.step-one').classList.add('step-on-going');
        document
          .querySelector('.number-step-one')
          .classList.add('number-step-on-going');

        const startRecorder = document.querySelector('.start-recorder');
        startRecorder.classList.remove('recorder-hidden');
        startRecorder.addEventListener('click', () => {
          StartRecorder(res);
        });
      })
      .catch((err) => console.error(err));
  } catch (error) {
    document
      .querySelector('.text-container')
      .classList.remove('text-container-hidden');
    console.error(error);
  }
};

const StartRecorder = (stream) => {
  let recorder = RecordRTC(stream, {
    type: 'gif',
    frameRate: 1,
    quality: 10,
    width: 360,
    hidden: 240,
    // onGifRecordingStarted: function () {
    //   console.log('started');
    // }
  });
  recorder.startRecording();
  const stopRecorder = document.querySelector('.stop-recorder');
  stopRecorder.addEventListener('click', () => {
    StopRecorder(recorder);
  });

  document.querySelector('.start-recorder').classList.add('recorder-hidden');

  document.querySelector('.stop-recorder').classList.remove('recorder-hidden');

  document.querySelector('.step-one').classList.remove('step-on-going');
  document
    .querySelector('.number-step-one')
    .classList.remove('number-step-on-going');

  document.querySelector('.step-two').classList.add('step-on-going');
  document
    .querySelector('.number-step-two')
    .classList.add('number-step-on-going');

  document.querySelector('.timer').classList.remove('timer-hidden');

  Timer();
};

const Repeat = (e, recorder) => {
  hours = 0;
  minutes = 0;
  seconds = 0;
  recorder.reset();
  e.target.classList.add('timer-hidden');
  e.target.removeEventListener('click', Repeat);
  e.target.classList.remove('repeat-recorder');
  e.target.textContent = '00:00:00';
  document.querySelector('.step-three').classList.remove('step-on-going');
  document
    .querySelector('.number-step-three')
    .classList.remove('number-step-on-going');

  document.querySelector('.upload-recorder').classList.add('recorder-hidden');

  document.querySelector('.start-recorder').classList.remove('recorder-hidden');
};

const StopRecorder = (recorder) => {
  clearTimeout(timer);
  let blob = null;
  recorder.stopRecording(() => {
    blob = recorder.getBlob();
  });
  const uploadGifo = document.querySelector('.upload-recorder');
  uploadGifo.addEventListener('click', () => {
    UploadGifo(blob);
  });

  document.querySelector('.stop-recorder').classList.add('recorder-hidden');

  document
    .querySelector('.upload-recorder')
    .classList.remove('recorder-hidden');

  document.querySelector('.step-two').classList.remove('step-on-going');
  document
    .querySelector('.number-step-two')
    .classList.remove('number-step-on-going');

  document.querySelector('.step-three').classList.add('step-on-going');
  document
    .querySelector('.number-step-three')
    .classList.add('number-step-on-going');
  let timerText = document.querySelector('.timer');
  timerText.classList.add('repeat-recorder');
  timerText.textContent = 'repetir captura';

  timerText.addEventListener('click', (e) => {
    Repeat(e, recorder);
  });
};

const CopyLink = (url) => {
  const elem = document.createElement('textarea');
  elem.value = url;
  document.body.appendChild(elem);
  elem.select();
  document.execCommand('copy');
  document.body.removeChild(elem);
};

const DownloadGif = async (gifInfo) => {
  const gifUrl = gifInfo.url;
  const data = await fetch(gifUrl);
  const blob = await data.blob();
  invokeSaveAsDialog(blob);
};

const ActionUploadGifo = (uploadGifoInfo) => {
  const gif = {
    id: uploadGifoInfo.data.id,
    url: `${constants.GIFSURL}${uploadGifoInfo.data.id}/giphy.gif`,
  };
  document
    .querySelector('.gif-status-loading')
    .classList.add('gif-status-done');
  document.querySelector('.gif-status-text').textContent =
    'GIFO subido con éxito';

  document
    .querySelector('.upload-gif-action-container')
    .classList.remove('upload-gif-action-container-hidden');

  document.querySelector('.download-action').addEventListener('click', () => {
    DownloadGif(gif);
  });

  document.querySelector('.link-action').addEventListener('click', () => {
    CopyLink(gif.url);
  });

  let gifos = localStorage.getItem('gifos');
  if (!gifos) {
    let gifos = [];
    gifos.unshift(gif);
    localStorage.setItem('gifos', JSON.stringify(gifos));
  } else {
    let currentGifos = JSON.parse(gifos);
    currentGifos.unshift(gif);
    localStorage.setItem('gifos', JSON.stringify(currentGifos));
  }
};

const UploadGifo = async (blob) => {
  let form = new FormData();
  let fileName = new Date().getTime();
  form.append('file', blob, `${fileName}-myGif.gif`);
  console.log(form.get('file'));

  document.querySelector('.gif-status-text').textContent =
    'Estamos subiendo tu GIFO';
  document
    .querySelector('.upload-gif-container')
    .classList.remove('upload-gif-container-hidden');

  document.querySelector('.timer').classList.add('timer-hidden');

  document.querySelector('.upload-recorder').classList.add('recorder-hidden');

  try {
    const url = `${constants.UPLOADGIFOURL}?api_key=${constants.APIKEYGIFOS}`;
    const data = await fetch(url, {
      method: 'POST',
      body: form,
    });
    const jsonResult = await data.json();
    ActionUploadGifo(jsonResult);
  } catch (error) {
    console.error(error);
  }
};

export { GetCameraAccess };
