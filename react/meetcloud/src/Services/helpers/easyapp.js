import { store } from "../../store/store";
import * as conferenceConsts from "../../constants/conference";
import * as chatActions from "../../constants/actions/chatActions";
import * as conferenceActions from "../../constants/actions/conferenceActions";
const browser = require("detect-browser");

const maxCALLERS = conferenceConsts.MAX_CALLERS;
var globalRoomName = "";

function callEverybodyElse(roomName, otherPeople) {
  window.easyrtc.setRoomOccupantListener(null); // so we're only called once.

  var list = [];
  var connectCount = 0;
  for (var easyrtcid in otherPeople) {
    list.push(easyrtcid);
  }

  // Connect in reverse order. Latter arriving people are more likely to have
  // empty slots.
  function establishConnection(position) {
    function callSuccess(id) {
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
  if (msgType === conferenceConsts.CHAT_MESSAGE_TYPE) {
    store.dispatch({ type: chatActions.CHAT_ADD_MESSAGE, payload: content });
    store.dispatch({ type: chatActions.CHAT_ADD_UNREAD });
  }
}

// Event that add a new stream to the call
window.easyrtc.setStreamAcceptor(function(callerEasyrtcid, stream) {
  let username = window.easyrtc.idToName(callerEasyrtcid);
  store.dispatch({
    type: conferenceActions.CONFERENCE_PEERS_ADD_PEER,
    payload: { callerEasyrtcid, stream, username }
  });
  store.dispatch({ type: chatActions.CHAT_ADD_MESSAGE, payload: {msg: username, source:"New connection"} });
  setTimeout(() => {
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
  let username = window.easyrtc.idToName(callerEasyrtcid);
  store.dispatch({
    type: conferenceActions.CONFERENCE_PEERS_REMOVE_PEER,
    payload: { callerEasyrtcid }
  });
  store.dispatch({ type: chatActions.CHAT_ADD_MESSAGE, payload: {msg: username, source:"Lost connection"} });
});

// Media got successfully
function mediaSuccess(room) {
  store.dispatch({ type: conferenceActions.CONFERECE_HIDE_LOADING });
  store.dispatch({
    type: conferenceActions.CONFERECE_UPDATE_JOINED_DATA,
    payload: true
  });
  var selfVideo = document.getElementById("self-video-div");
  window.easyrtc.setVideoObjectSrc(selfVideo, window.easyrtc.getLocalStream());
  window.easyrtc.joinRoom(globalRoomName, {});
  window.easyrtc.connect(
    conferenceConsts.WEB_RTC_APP,
    () => console.log("media success"),
    (e, e1) => console.log(e, e1)
  );
  window.easyrtc.enableMicrophone(true);
  window.easyrtc.enableCamera(true);
}

// Media error
function mediaError(a, b) {
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
      if (b.includes("PermissionDeniedError") || b.includes("SecurityError")) {
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
}

// Init method
export function appInit(domainServer, roomName, username) {
  if (
    window.easyrtc.supportsGetUserMedia &&
    window.easyrtc.supportsGetUserMedia()
  ) {
    store.dispatch({ type: conferenceActions.CONFERECE_SHOW_LOADING });
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
    window.easyrtc.enableVideo(true); //TODO: change this (dev only)
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

// Close conference
export function closeConference() {
  window.easyrtc.hangupAll();
  window.easyrtc.disconnect();
}

// Media methods
export function switchCamera() {
  store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_CAMERA });
  let currentValue = store.getState().conference.cameraEnabled;
  window.easyrtc.enableCamera(currentValue);
}

export function turnOffCamera(){
  if (store.getState().conference.cameraEnabled){
    store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_CAMERA });
    window.easyrtc.enableCamera(false);
  }
}

export function switchMic() {
  store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_MIC });
  let currentValue = store.getState().conference.micEnabled;
  window.easyrtc.enableMicrophone(currentValue);
}

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
//Chat
export function sendPeerMessage(targetRoom, msgType, msg, source) {
  window.easyrtc.sendPeerMessage(
    { targetRoom },
    msgType,
    { msg, source },
    () => {
      store.dispatch({
        type: chatActions.CHAT_ADD_MESSAGE,
        payload: { msg, source: "Me" }
      });
    },
    (e, s) => {
      //TODO: notification error
      console.log("Chat: message error", e, s);
    }
  );
}

// Play sounds
export function playSound(obj) {
  obj.play();
}


// Screen sharing
export function shareScreen(stream){

}