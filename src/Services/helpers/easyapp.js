import store from "../../store/store";
import * as conferenceConsts from "../../constants/conference";
import * as chatActions from "../../constants/actions/chatActions";
import * as conferenceActions from "../../constants/actions/conferenceActions";
import * as settingsActions from "../../constants/actions/settingsActions";

const browser = require("detect-browser");

const maxCALLERS = conferenceConsts.MAX_CALLERS;
let globalRoomName = "";

function callEverybodyElse(roomName, otherPeople) {
  window.easyrtc.setRoomOccupantListener(null); // so we're only called once.

  const list = [];
  let connectCount = 0;
  for (const easyrtcid in otherPeople) {
    list.push(easyrtcid);
  }

  // Connect in reverse order. Latter arriving people are more likely to have
  // empty slots.
  function establishConnection(position) {
    function callSuccess() {
      connectCount += 1;
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
window.easyrtc.setStreamAcceptor((callerEasyrtcid, stream) => {
  const { peers } = store.getState().conference;
  const peerIndex = peers.find(x => x.callerEasyrtcid === callerEasyrtcid);

  // Adds or updates the user
  const username = window.easyrtc.idToName(callerEasyrtcid);

  store.dispatch({
    type: conferenceActions.CONFERENCE_PEERS_ADD_PEER,
    payload: {
      callerEasyrtcid,
      stream,
      username
    }
  });

  if (!peerIndex) {
    store.dispatch({
      type: chatActions.CHAT_ADD_MESSAGE,
      payload: {
        msg: username,
        source: "New connection"
      }
    });
  }

  setTimeout(() => {
    let video = null;
    if (stream.streamName === conferenceConsts.SCREEN_SHARING_STREAM_NAME) {
      video = document.getElementById(`us-${callerEasyrtcid}`);
      if (video) {
        console.log("Adding share screen stream");
        window.easyrtc.setVideoObjectSrc(video, stream);
      }
    } else {
      video =
        document.getElementById(`u-${callerEasyrtcid}`) ||
        document.getElementById(`us-${callerEasyrtcid}`);
      if (video) {
        console.log("Adding video stream");

        window.easyrtc.setVideoObjectSrc(video, stream);
        const selectedDevice = store.getState().settings
          .audioDeviceSinkSelected;
        if (selectedDevice) {
          setAudioOutput(video, selectedDevice.deviceId);
        }
      }
    }
  }, 100);
});

// Event that removes an stream from the call
window.easyrtc.setOnStreamClosed((callerEasyrtcid)=> {
  const username = window.easyrtc.idToName(callerEasyrtcid);
  // Check if the stream closed is "screenShare"
  const peerClosed = store
    .getState()
    .conference.peers.find(x => x.callerEasyrtcid === callerEasyrtcid);
  if (peerClosed && !peerClosed.hasScreen) {
    store.dispatch({
      type: conferenceActions.CONFERENCE_PEERS_REMOVE_PEER,
      payload: {
        callerEasyrtcid
      }
    });
    store.dispatch({
      type: chatActions.CHAT_ADD_MESSAGE,
      payload: {
        msg: username,
        source: "Lost connection"
      }
    });
  }
});

// Media got successfully
function mediaSuccess(res) {
  store.dispatch({ type: conferenceActions.CONFERECE_HIDE_LOADING });
  store.dispatch({
    type: conferenceActions.CONFERECE_UPDATE_JOINED_DATA,
    payload: true
  });
  const selfVideo = document.getElementById("self-video-div");
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

export function getLocalUserStream() {
  return window.easyrtc.getLocalStream();
}

// Media error
function mediaError(a, b) {
  console.log("Failed to get media source first time, trying again: ", a, b);
  // On media error attempt to disable all media features so we can still receive
  // connections
  window.easyrtc.enableVideo(false);
  // try again with only audio
  window.easyrtc.initMediaSource(mediaSuccess, () => {
    console.log("Failed to get media source a second time: ", a, b);
    window.easyrtc.disconnect();
    // TODO: create a redux action to show the popup
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

// Permission checker
let permissionsIntervalChecker = null;

export function cancelPermissionChecker() {
  clearInterval(permissionsIntervalChecker);
}

function permissionInterval() {
  try {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (devices.some(device => device.label !== "")) {
        cancelPermissionChecker();
        getAudioSourceList();
        getVideoSourceList();
        getAudioSinkList();
        // setTimeout(appInit(),200);
      }
    });
  } catch (err) {
    cancelPermissionChecker();
  }
}

// Init method
export function appInit(domainServer, roomName, username) {
  // Show loading
  store.dispatch({ type: conferenceActions.CONFERECE_SHOW_LOADING });

  // Permissions checker if Chrome
  const currentBrowser = detectBrowser();
  if (currentBrowser === "chrome") {
    permissionsIntervalChecker = setInterval(permissionInterval(), 1000);
  }
  // Executes
  setTimeout(() => {
    if (
      window.easyrtc.supportsGetUserMedia &&
      window.easyrtc.supportsGetUserMedia()
    ) {
      globalRoomName = roomName;
      // Prevent reconnection because it gives a lot of issues, see manual calls to
      // disconnect as well
      window.easyrtc.setSocketUrl(domainServer, {
        transports: ["websocket"],
        reconnection: false
      });
      window.easyrtc.enableDebug(conferenceConsts.DEBUG);
      window.easyrtc.setOnError((e)=> {
        console.log("error from easyrtc:", e);
      });
      window.easyrtc.setRoomOccupantListener(callEverybodyElse);
      // window.easyrtc.setAutoInitUserMedia(true); Enable audio and video medias.
      // This can only be changed before connecting so careful. These are used for
      // calling and should be disabled if the media doesn't work otherwise connection
      // will be slower and won't properly work
      window.easyrtc.enableAudio(conferenceConsts.AUDIO_ENABLED);
      window.easyrtc.enableVideo(conferenceConsts.VIDEO_ENABLED);
      window.easyrtc.enableDataChannels(true);
      window.easyrtc.enableVideoReceive(true);
      window.easyrtc.enableAudioReceive(true);
      window.easyrtc.setUsername(username);

      // Some defaults. The simply turn on/off
      window.easyrtc.enableCamera(true);
      window.easyrtc.enableMicrophone(true);

      // Set audio input
      const selectedAudioInput = store.getState().settings.audioDeviceSelected;
      console.log("Selectedaudioinput", selectedAudioInput);
      if (selectedAudioInput) {
        setAudioInput(selectedAudioInput.deviceId);
      }

      window.easyrtc.setPeerListener(messageListener);
      window.easyrtc.setDisconnectListener(() =>{
        window.easyrtc.showError(
          "LOST-CONNECTION",
          "Lost connection to signaling server"
        );
      });

      window.easyrtc.initMediaSource(mediaSuccess, mediaError);
    } else {
      console.log("Browser does not support WebRTC");
    }
  }, 250);
}

// Close conference
export function closeConference() {
  window.easyrtc.hangupAll();
  window.easyrtc.disconnect();
}

// Media methods
export function switchCamera() {
  store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_CAMERA });
  const currentValue = store.getState().conference.cameraEnabled;
  window.easyrtc.enableCamera(currentValue);
  if (currentValue) {
    const selfVideo = document.getElementById("self-video-div");
    window.easyrtc.setVideoObjectSrc(
      selfVideo,
      window.easyrtc.getLocalStream()
    );
  }
}

export function turnOffCamera() {
  if (store.getState().conference.cameraEnabled) {
    store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_CAMERA });
    window.easyrtc.enableCamera(false);
  }
}

export function switchMic() {
  store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_MIC });
  const currentValue = store.getState().conference.micEnabled;
  window.easyrtc.enableMicrophone(currentValue);
}

export function getAudioSourceList() {
  let selectedAudioDevice = null;
  const audioDevices = [];

  window.easyrtc.getAudioSourceList((audioList) => {
    const savedAudioDeviceId = localStorage.getItem("selectedAudioDeviceId");

    for (let i = 0; i < audioList.length; i += 1) {
      let a = audioList[i];
      // Copy object because we can't modify the original one
      a = {
        deviceId: a.deviceId,
        label: a.label
      };
      if (!a.label) {
        a.label = `Mic ${i + 1}`;
      }
      if (savedAudioDeviceId === a.deviceId) {
        selectedAudioDevice = a;
      }
      audioDevices.push(a);
    }
    if (audioDevices.length > 0 && !selectedAudioDevice) {
      selectedAudioDevice = audioDevices[0];
    }
    store.dispatch({
      type: settingsActions.SETTINGS_AUDIO_DEVICES_LIST,
      payload: audioDevices
    });
    store.dispatch({
      type: settingsActions.SETTINGS_AUDIO_DEVICE_SELECTED,
      payload: selectedAudioDevice
    });
  });
}

export function getVideoSourceList() {
  let selectedVideoDevice = null;
  const videoDevices = [];

  window.easyrtc.getVideoSourceList(function(videoList) {
    const savedVideoDeviceId = localStorage.getItem("selectedVideoDeviceId");

    for (let i = 0; i < videoList.length; i++) {
      let a = videoList[i];
      // Copy object because we can't modify the original one
      a = {
        deviceId: a.deviceId,
        label: a.label
      };

      if (!a.label) {
        a.label = `Cam ${i + 1}`;
      }

      if (savedVideoDeviceId === a.deviceId) {
        selectedVideoDevice = a;
      }

      videoDevices.push(a);
    }
    if (videoDevices.length > 0 && !selectedVideoDevice) {
      selectedVideoDevice = videoDevices[0];
    }
    // TODO: check if camera is enabled
    /*let cameraEnabled = true;
    if (videoDevices.length === 0) {
      cameraEnabled = false;
    }*/
    store.dispatch({
      type: settingsActions.SETTINGS_VIDEO_DEVICE_SELECTED,
      payload: selectedVideoDevice
    });
    store.dispatch({
      type: settingsActions.SETTINGS_VIDEO_DEVICES_LIST,
      payload: videoDevices
    });
  });
}

export function getAudioSinkList() {
  let audioOutputDevices = [];
  let selectedAudioOutputDevice = null;

  window.easyrtc.getAudioSinkList(function(outputList) {
    audioOutputDevices = [];

    const savedAudioOutputDeviceId = localStorage.getItem(
      "selectedAudioOutputDeviceId"
    );

    for (let i = 0; i < outputList.length; i++) {
      let a = outputList[i];
      // Copy object because we can't modify the original one
      a = {
        deviceId: a.deviceId,
        label: a.label
      };

      if (!a.label) {
        a.label = `Audio Out ${i + 1}`;
      }

      if (savedAudioOutputDeviceId === a.deviceId) {
        selectedAudioOutputDevice = a;
      }

      audioOutputDevices.push(a);
    }
    if (audioOutputDevices.length > 0 && !selectedAudioOutputDevice) {
      selectedAudioOutputDevice = audioOutputDevices[0];
    }
    store.dispatch({
      type: settingsActions.SETTINGS_AUDIO_DEVICES_SINK_LIST,
      payload: audioOutputDevices
    });
    store.dispatch({
      type: settingsActions.SETTINGS_AUDIO_DEVICE_SINK_SELECTED,
      payload: selectedAudioOutputDevice
    });
  });
}

// Detect browser methods
export function detectBrowser() {
  if (browser) {
    return browser.name;
  }
  return "other";
}

// Chat
export function sendPeerMessage(targetRoom, msgType, msg, source) {
  window.easyrtc.sendPeerMessage(
    {
      targetRoom
    },
    msgType,
    {
      msg,
      source
    },
    () => {
      store.dispatch({
        type: chatActions.CHAT_ADD_MESSAGE,
        payload: {
          msg,
          source: "Me"
        }
      });
    },
    (e, s) => {
      // TODO: notification error
      console.log("Chat: message error", e, s);
    }
  );
}

export function setAudioInput(deviceId) {
  window.easyrtc.setAudioSource(deviceId);
}

export function setAudioOutput(element, deviceId) {
  window.easyrtc.setAudioOutput(element, deviceId);
}

// Play sounds
export function playSound(obj) {
  obj.play();
}

export function stopSharingScreen() {
  window.easyrtc.closeLocalStream(conferenceConsts.SCREEN_SHARING_STREAM_NAME);
  if (store.getState().conference.sharingScreen) {
    store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_SHARE });
    store.dispatch({ type: conferenceActions.CONFERENCE_REMOVE_LOCAL_STREAM });
  }
}

// In order to change stream sources we need to re-obtain medias and re connect
// from peers with the new streams
export function reconnect() {
  setTimeout(() => window.location.reload(), 200);
}

export function shareScreen() {
  const {sharingScreen} = store.getState().conference;
  if (sharingScreen) {
    stopSharingScreen();
  } else {
    window.getScreenId((error, sourceId, screenConstraints)=> {
      // Everything is OK
      if (
        error === null ||
        error === "installed-enabled" ||
        error === "firefox"
      ) {
        navigator.getUserMedia =
          navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
        navigator.getUserMedia(
          screenConstraints,
          (stream) => {
            // TODO:turn off camera
            store.dispatch({ type: conferenceActions.CONFERENCE_SWITCH_SHARE });
            turnOffCamera();
            const selfVideo = document.getElementById("self-video-div");
            // Add share plugin as media stream
            window.easyrtc.register3rdPartyLocalMediaStream(
              stream,
              conferenceConsts.SCREEN_SHARING_STREAM_NAME
            );
            // Set local video stream
            window.easyrtc.setVideoObjectSrc(selfVideo, stream);

            store.dispatch({
              type: conferenceActions.CONFERENCE_ADD_LOCAL_STREAM,
              payload: stream
            });

            // OnInactive stop sharing screen
            stream.oninactive = () => {
              if (stream.oninactive) {
                stream.oninactive = undefined;
                stopSharingScreen(); // calling this twice won't hurt
              }
            };

            // add share stream to all peers
            const {peers} = store.getState().conference;
            for (let i = 0; i < peers.length; i++) {
              window.easyrtc.addStreamToCall(
                peers[i].callerEasyrtcid,
                conferenceConsts.SCREEN_SHARING_STREAM_NAME,
                () => {
                  console.log("Share screen accepted.");
                }
              );
            }
          },
          (err)=> {
            console.error(err);
          }
        );
      } else {
        switch (error) {
          case "permission-denied":
            console.log("Permission denied");
            break;
          case "not-chrome":
            alert("This features work on Google Chrome only");
            break;
          case "installed-disabled":
            alert("Share plugin disabled");
            break;
          case "not-installed":
            alert(
              "Share plugin not installed. Please install: https://chrome.google.com/webstore/d" +
                "etail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk"
            );
            break;
          default:
            console.log(`Unknown share plugin error: ${error}`);
        }
      }
    });
  }
}
