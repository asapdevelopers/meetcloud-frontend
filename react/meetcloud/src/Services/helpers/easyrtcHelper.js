export function initializeEasyRTC(domainServer) {
  // Prevent reconnection because it gives a lot of issues, see manual calls to disconnect as well
  window.easyrtc.setSocketUrl(domainServer, {
    transports: ['websocket'],
    reconnection: false
  });
  window.easyrtc.enableDebug(false);
  window.easyrtc.setOnError(function(e) {
    // Prevent anoying pop up.
    console.log("error from easyrtc:", e)
  });

  window.easyrtc.setAutoInitUserMedia(false);

  // Enable audio and video medias. This can only be changed before connecting so careful.
  // These are used for calling and should be disabled if the media doesn't work otherwise connection
  // will be slower and won't properly work
  window.easyrtc.enableAudio(true);
  window.easyrtc.enableVideo(true);
  window.easyrtc.enableDataChannels(true);
  window.easyrtc.enableVideoReceive(true);
  window.easyrtc.enableAudioReceive(true);

  // Some defaults. The simply turn on/off
  window.easyrtc.enableCamera(true);
  window.easyrtc.enableMicrophone(false);
};

export function * getAudioSourceList() {
  var index = 0;
  var selectedAudioDevice = null;
  var audioDevices = []

  yield new Promise(resolve => {
    window.easyrtc.getAudioSourceList(function(audioList) {
      let savedAudioDeviceId = localStorage.getItem('selectedAudioDeviceId');

      for (var i = 0; i < audioList.length; i++) {
        let a = audioList[i];
        // Copy object because we can't modify the original one
        a = {
          deviceId: a.deviceId,
          label: a.label
        }
        if (!a.label) {
          a.label = "Mic " + (i + 1);
        }
        if (savedAudioDeviceId === a.deviceId) {
          selectedAudioDevice = a;
        }
        audioDevices.push(a);
      }
      if (audioDevices.length > 0 && !selectedAudioDevice) {
        selectedAudioDevice = audioDevices[0];
      }
      resolve({selectedAudioDevice, audioDevices})
    })
  });
}

export function * getVideoSourceList() {
  var selectedVideoDevice = null;
  var videoDevices = []

  yield new Promise(resolve => {
    window.easyrtc.getVideoSourceList(function(videoList) {

      let savedVideoDeviceId = localStorage.getItem('selectedVideoDeviceId');

      for (var i = 0; i < videoList.length; i++) {
        let a = videoList[i];
        // Copy object because we can't modify the original one
        a = {
          deviceId: a.deviceId,
          label: a.label
        }

        if (!a.label) {
          a.label = "Cam " + (i + 1);
        }

        if (savedVideoDeviceId === a.deviceId) {
          selectedVideoDevice = a;
        }

        videoDevices.push(a);
      }
      if (videoDevices.length > 0 && !selectedVideoDevice) {
        selectedVideoDevice = videoDevices[0];
      }
      //TODO: check if camera is enabled
      if (videoDevices.length == 0) {
        let cameraEnabled = false;
      }
      resolve({selectedVideoDevice, videoDevices})
    });
  });
}

export function * getAudioSinkList() {
  var audioOutputDevices = [];
  var selectedAudioOutputDevice = null;

  yield new Promise(resolve => {
    window.easyrtc.getAudioSinkList(function(outputList) {
      audioOutputDevices = [];

      let savedAudioOutputDeviceId = localStorage.getItem('selectedAudioOutputDeviceId');

      for (var i = 0; i < outputList.length; i++) {
        let a = outputList[i];
        // Copy object because we can't modify the original one
        a = {
          deviceId: a.deviceId,
          label: a.label
        }

        if (!a.label) {
          a.label = "Audio Out " + (i + 1);
        }

        if (savedAudioOutputDeviceId === a.deviceId) {
          selectedAudioOutputDevice = a;
        }

        audioOutputDevices.push(a);
      }
      if (audioOutputDevices.length > 0 && !selectedAudioOutputDevice) {
        selectedAudioOutputDevice = audioOutputDevices[0];
      }
    })
  });
}
