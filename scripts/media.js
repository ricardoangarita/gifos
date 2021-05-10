import * as constants from './constants.js';

const GetCameraAccess = async constraints => {
  try {
    await navigator.mediaDevices
      .getUserMedia(constraints)
      .then(res => {
        const video = document.querySelector('.video');
        video.srcObject = res;
        video.onloadedmetadata = function (e) {
          video.play();
        };
        const startRecorder = document.querySelector('.start-recorder');
        startRecorder.addEventListener('click', () => {
          StartRecorder(res);
        });
      })
      .catch(e => console.error(e));
  } catch (error) {
    console.error(error);
  }
};

const StartRecorder = stream => {
  let recorder = RecordRTC(stream, {
    type: 'gif',
    frameRate: 1,
    quality: 10,
    width: 360,
    hidden: 240
    // onGifRecordingStarted: function () {
    //   console.log('started');
    // }
  });
  recorder.startRecording();
  const stopRecorder = document.querySelector('.stop-recorder');
  stopRecorder.addEventListener('click', () => {
    StopRecorder(recorder);
  });
};

const StopRecorder = recorder => {
  let blob = null;
  recorder.stopRecording(() => {
    blob = recorder.getBlob();
  });
  const uploadGifo = document.querySelector('.upload-gifo');
  uploadGifo.addEventListener('click', () => {
    UploadGifo(blob);
  });
};

const UploadGifo = async blob => {
  let form = new FormData();
  form.append('file', blob, `${new Date().getTime()}-myGif.gif`);
  console.log(form.get('file'));

  try {
    const url = `${constants.UPLOADGIFOURL}?api_key=${constants.APIKEYGIFOS}
    ?username=${constants.GIFOSUSERACCOUNT}?file=${form}`;
    console.log(url);
    await fetch(url, {
      method: 'POST',
      body: form
    })
      .then(res => {
        console.log(res);
      })
      .catch(e => console.error(e));
  } catch (error) {
    console.error(error);
  }
};

export { GetCameraAccess };
