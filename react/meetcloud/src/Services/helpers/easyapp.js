import { store } from "../../store/store";
import * as conferenceConsts from "../../constants/conference";
import * as conferenceActions from "../../constants/actions/conferenceActions";
const browser = require("detect-browser");

const maxCALLERS = conferenceConsts.MAX_CALLERS;
var connectCount = 0;
var globalRoomName = "";

function getIdOfBox(boxNum) {
  return "box" + boxNum;
}

function callEverybodyElse(roomName, otherPeople) {
  window.easyrtc.setRoomOccupantListener(null); // so we're only called once.
  debugger;
  var list = [];
  var connectCount = 0;
  for (var easyrtcid in otherPeople) {
    list.push(easyrtcid);
  }

  // Connect in reverse order. Latter arriving people are more likely to have
  // empty slots.
  function establishConnection(position) {
    function callSuccess(id) {
      store.dispatch({
        type: conferenceActions.CONFERENCE_PEERS_UPDATE_PEER_SETTINGS,
        payload: id
      });
      connectCount++;
      if (connectCount < maxCALLERS && position > 0) {
        establishConnection(position - 1);
      }
    }
    function callFailure(errorCode, errorText) {
      console.log("Call error", errorCode, errorText);
      if (connectCount < maxCALLERS && position > 0) {
        establishConnection(position - 1);
      }
    }
    window.easyrtc.call(list[position], callSuccess, callFailure);
  }
  if (list.length > 0) {
    establishConnection(list.length - 1);
  }
}

function messageListener(easyrtcid, msgType, content) {
  for (var i = 0; i < maxCALLERS; i++) {
    if (window.easyrtc.getIthCaller(i) == easyrtcid) {
    }
  }
}

// Event that add a new stream to the call
window.easyrtc.setStreamAcceptor(function(callerEasyrtcid, stream) {
  store.dispatch({
    type: conferenceActions.CONFERENCE_PEERS_ADD_PEER,
    payload: { callerEasyrtcid, stream }
  });
  setTimeout(() => {
    debugger;
    var video =
      document.getElementById("u-" + callerEasyrtcid) ||
      document.getElementById("us-" + callerEasyrtcid);
    if (video) {
      console.log("Adding video stream");
      window.easyrtc.setVideoObjectSrc(video, stream);
    }
  }, 100);
});

// Evenet that removes an stream from the call
window.easyrtc.setOnStreamClosed(function(callerEasyrtcid) {
  var video =
    document.getElementById("u-" + callerEasyrtcid) ||
    document.getElementById("us-" + callerEasyrtcid);
  if (video) {
    console.log("Cleaning video stream");
    window.easyrtc.setVideoObjectSrc(video, "");
  }
});

// Media got successfully
function mediaSuccess(rommName) {
  //this.removePopup();
  var selfVideo = document.getElementById("self-video-div");
  window.easyrtc.setVideoObjectSrc(selfVideo, window.easyrtc.getLocalStream());
  window.easyrtc.connect(
    globalRoomName,
    () => console.log("success"),
    (e, e1) => console.log(e, e1)
  );
  window.easyrtc.enableMicrophone(true);
  window.easyrtc.enableCamera(true);
}

// Media error
function mediaError() {
  mediaError = (a, b) => {
    console.log("Failed to get media source first time, trying again: ", a, b);
    // On media error attempt to disable all media features
    // so we can still receive connections
    window.easyrtc.enableVideo(false);
    //try again with only audio
    window.easyrtc.initMediaSource(mediaSuccess, () => {
      console.log("Failed to get media source a second time: ", a, b);
      window.easyrtc.disconnect();
      //TODO: create a redux action to show the popup
      if (a.includes("MEDIA_ERR")) {
        if (
          b.includes("PermissionDeniedError") ||
          b.includes("SecurityError")
        ) {
          this.showPopup("", false, "permissionError");
        }
        if (b.includes("DevicesNotFoundError")) {
          this.showPopup("", false, "deviceNotFound");
        }
        if (b.includes("NotFoundError")) {
          this.showPopup("", false, "deviceNotFound");
        }
      } else {
        this.showPopup("Failed to connect, please try again.");
      }
    });
  };
}

// Init method
export function appInit(domainServer, roomName, username) {
  if (
    window.easyrtc.supportsGetUserMedia &&
    window.easyrtc.supportsGetUserMedia()
  ) {
    globalRoomName = roomName;
    // Prevent reconnection because it gives a lot of issues, see manual calls to disconnect as well
    window.easyrtc.setSocketUrl(domainServer, {
      transports: ["websocket"],
      reconnection: false
    });
    window.easyrtc.enableDebug(conferenceConsts.DEBUG);
    window.easyrtc.setOnError(function(e) {
      console.log("error from easyrtc:", e);
    });
    window.easyrtc.setRoomOccupantListener(callEverybodyElse);
    //window.easyrtc.setAutoInitUserMedia(true);

    // Enable audio and video medias. This can only be changed before connecting so careful.
    // These are used for calling and should be disabled if the media doesn't work otherwise connection
    // will be slower and won't properly work
    window.easyrtc.enableAudio(true);
    window.easyrtc.enableVideo(true);
    window.easyrtc.enableDataChannels(true);
    window.easyrtc.enableVideoReceive(true);
    window.easyrtc.enableAudioReceive(true);
    window.easyrtc.setUsername(username);

    // Some defaults. The simply turn on/off
    window.easyrtc.enableCamera(true);
    window.easyrtc.enableMicrophone(true);

    window.easyrtc.setPeerListener(messageListener);
    window.easyrtc.setDisconnectListener(function() {
      window.easyrtc.showError(
        "LOST-CONNECTION",
        "Lost connection to signaling server"
      );
    });

    window.easyrtc.initMediaSource(mediaSuccess, mediaError);
  } else {
    console.log("Browser does not support WebRTC");
  }
}

// Media methods
export function* getAudioSourceList() {
  //var index = 0;
  var selectedAudioDevice = null;
  var audioDevices = [];

  yield new Promise(resolve => {
    window.easyrtc.getAudioSourceList(function(audioList) {
      let savedAudioDeviceId = localStorage.getItem("selectedAudioDeviceId");

      for (var i = 0; i < audioList.length; i++) {
        let a = audioList[i];
        // Copy object because we can't modify the original one
        a = {
          deviceId: a.deviceId,
          label: a.label
        };
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
      resolve({ selectedAudioDevice, audioDevices });
    });
  });
}

export function* getVideoSourceList() {
  var selectedVideoDevice = null;
  var videoDevices = [];

  yield new Promise(resolve => {
    window.easyrtc.getVideoSourceList(function(videoList) {
      let savedVideoDeviceId = localStorage.getItem("selectedVideoDeviceId");

      for (var i = 0; i < videoList.length; i++) {
        let a = videoList[i];
        // Copy object because we can't modify the original one
        a = {
          deviceId: a.deviceId,
          label: a.label
        };

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
      let cameraEnabled = true;
      if (videoDevices.length === 0) {
        cameraEnabled = false;
      }
      resolve({ selectedVideoDevice, videoDevices, cameraEnabled });
    });
  });
}

export function* getAudioSinkList() {
  var audioOutputDevices = [];
  var selectedAudioOutputDevice = null;

  yield new Promise(resolve => {
    window.easyrtc.getAudioSinkList(function(outputList) {
      audioOutputDevices = [];

      let savedAudioOutputDeviceId = localStorage.getItem(
        "selectedAudioOutputDeviceId"
      );

      for (var i = 0; i < outputList.length; i++) {
        let a = outputList[i];
        // Copy object because we can't modify the original one
        a = {
          deviceId: a.deviceId,
          label: a.label
        };

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
    });
  });
}

// Detect browser methods
export function detectBrowser() {
  if (browser) {
    return browser.name;
  } else {
    return "other";
  }
}

// Play sounds
export function playSound(obj) {
  obj.play();
}