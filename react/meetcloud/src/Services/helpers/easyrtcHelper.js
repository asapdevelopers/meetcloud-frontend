import { store } from "../../store/store";
import * as conferenceConsts from "../../constants/conference";
import * as conferenceActions from "../../constants/actions/conferenceActions";

const browser = require("detect-browser");

// private functions
function callEveryoneElse(roomName, otherPeople) {
  //Get differences
  debugger;
  const currentList = store.getState().conference.peers;
  const newList = Object.values(otherPeople);

  let added = newList.filter(
    e => !currentList.find(a => e.easyrtcid === a.easyrtcid)
  );

  let removed = currentList.filter(
    e => !newList.find(a => e.easyrtcid === a.easyrtcid)
  );

  debugger;

  if (added.length > 0 || removed.length > 0) {
    store.dispatch({
      type: conferenceActions.CONFERENCE_PEERS_UPDATE_LIST,
      payload: otherPeople
    });
  }
  // so we're only called once.
  //window.easyrtc.setRoomOccupantListener(null);

  var list = [];
  var connectCount = 0;
  for (let id in added) {
    list.push(added[id]);
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
      if (connectCount < conferenceConsts.MAX_CALLERS && position > 0) {
        establishConnection(position - 1);
      }
    }
    function callFailure(errorCode, errorText) {
      window.easyrtc.showError(errorCode, errorText);
      if (connectCount < conferenceConsts.MAX_CALLERS && position > 0) {
        establishConnection(position - 1);
      }
    }
    window.easyrtc.call(list[position].easyrtcid, callSuccess, callFailure);
  }
  if (list.length > 0) {
    establishConnection(list.length - 1);
  }
}

function addStreamToVideoTag(id, stream) {}

function messageListener(easyrtcid, msgType, content) {
  debugger;
  for (var i = 0; i < conferenceConsts.MAX_CALLERS; i++) {
    if (window.easyrtc.getIthCaller(i) == easyrtcid) {
      /*var startArea = document.getElementById(getIdOfBox(i + 1));
      var startX =
        parseInt(startArea.offsetLeft) + parseInt(startArea.offsetWidth) / 2;
      var startY =
        parseInt(startArea.offsetTop) + parseInt(startArea.offsetHeight) / 2;
      showMessage(startX, startY, content);*/
    }
  }
}

// Helper to allow setting audio output of an element
// Currently only supported by chrome
/*setAudioOutput = element => {
  if (element.setSinkId && this.state.selectedAudioOutputDevice) {
    element.setSinkId(this.state.selectedAudioOutputDevice.deviceId);
  }
};*/

// 1. Establish the room connection
// 2. Establish the connection with the EasyRTC server
export function createConnection(
  roomName,
  selfVideo,
  onJoinSuccess,
  onJoinError,
  onConnectSuccess,
  onConnectError,
  username,
  token
) {
  // To call everyone else
  window.easyrtc.setRoomOccupantListener(callEveryoneElse);
  // When losing connect
  window.easyrtc.setDisconnectListener(function() {
    console.log("LOST-CONNECTION", "Lost connection to signaling server");
  });

  // Function that adds an stream from a new user
  /*window.easyrtc.setStreamAcceptor(function(callerEasyrtcid, stream) {
    store.dispatch({
      type: conferenceActions.CONFERENCE_PEERS_UPDATE_PEER_SETTINGS,
      payload: callerEasyrtcid
    });
    setTimeout(() => {
      var video =
        document.getElementById("u-" + callerEasyrtcid) ||
        document.getElementById("us-" + callerEasyrtcid);
      if (video) {
        console.log("Adding video stream");
        window.easyrtc.setVideoObjectSrc(video, stream);
      }
      //this.setAudioOutput(document.getElementById("u-" + id));
    }, 100);
  });

  // Function that removes an stream
  window.easyrtc.setOnStreamClosed(function(callerEasyrtcid) {
    setTimeout(() => {
      var video =
        document.getElementById("u-" + callerEasyrtcid) ||
        document.getElementById("us-" + callerEasyrtcid);
      if (video) {
        console.log("Cleaning video stream");
        window.easyrtc.setVideoObjectSrc(video, "");
      }
    }, 100);
  });
*/

  // Before connecting we have to `joinRoom` to avoid entering to the default room
  //window.easyrtc.joinRoom(roomName, {}, onJoinSuccess, onJoinError);
  // We get access to the local media stream
  /*window.easyrtc.initMediaSource(
    () => {
      // Enable mic
      window.easyrtc.enableMicrophone(true);
      // Enable camera
      window.easyrtc.enableCamera(true);
      // Create the easyrtc onnection
      window.easyrtc.setVideoObjectSrc(
        selfVideo,
        window.easyrtc.getLocalStream()
      );
      window.easyrtc.setUsername(localStorage["username"]);
      window.easyrtc.setCredential({ token });
      window.easyrtc.connect(
        conferenceConsts.WEB_RTC_APP,
        onConnectSuccess,
        onConnectError
      );
      window.easyrtc.setPeerListener(messageListener);
    },
    msg => {
      //error
      console.log("EasyRTC: Init media source:", msg);
    }
  );*/
  window.easyrtc.setUsername(localStorage["username"]);
  window.easyrtc.setCredential({ token });
  window.easyrtc.easyApp(
    conferenceConsts.WEB_RTC_APP,
    "self-video-div",
    ["caller1", "caller2", "caller3"],
    function(myId) {
      console.log("My easyrtcid is " + myId);
    }
  );
}

// Initialize
export function initializeEasyRTC(domainServer) {
  // Prevent reconnection because it gives a lot of issues, see manual calls to disconnect as well
  window.easyrtc.setSocketUrl(domainServer, {
    transports: ["websocket"],
    reconnection: false
  });
  window.easyrtc.enableDebug(conferenceConsts.DEBUG);
  window.easyrtc.setOnError(function(e) {
    // Prevent anoying pop up.
    console.log("error from easyrtc:", e);
  });

  //window.easyrtc.setAutoInitUserMedia(true);

  // Enable audio and video medias. This can only be changed before connecting so careful.
  // These are used for calling and should be disabled if the media doesn't work otherwise connection
  // will be slower and won't properly work
  /*window.easyrtc.enableAudio(true);
  window.easyrtc.enableVideo(true);
  window.easyrtc.enableDataChannels(true);
  window.easyrtc.enableVideoReceive(true);
  window.easyrtc.enableAudioReceive(true);

  // Some defaults. The simply turn on/off
  window.easyrtc.enableCamera(true);
  window.easyrtc.enableMicrophone(true);*/
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

export function detectBrowser() {
  if (browser) {
    return browser.name;
  } else {
    return "other";
  }
}

export function playSound(obj) {
  obj.play();
}
