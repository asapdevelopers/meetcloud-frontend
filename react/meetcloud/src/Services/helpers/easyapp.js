import { store } from "../../store/store";
import * as conferenceConsts from "../../constants/conference";
import * as conferenceActions from "../../constants/actions/conferenceActions";

const maxCALLERS = conferenceConsts.MAX_CALLERS;
var connectCount = 0;

function getIdOfBox(boxNum) {
  return "box" + boxNum;
}

function callEverybodyElse(roomName, otherPeople) {
  window.easyrtc.setRoomOccupantListener(null); // so we're only called once.

  /*store.dispatch({
    type: conferenceActions.CONFERENCE_PEERS_UPDATE_LIST,
    payload: otherPeople
  });*/

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

function loginSuccess() {
  //expandThumb(0);  // expand the mirror image initially.
}

function messageListener(easyrtcid, msgType, content) {
  for (var i = 0; i < maxCALLERS; i++) {
    if (window.easyrtc.getIthCaller(i) == easyrtcid) {
    }
  }
}

window.easyrtc.setStreamAcceptor(function(callerEasyrtcid, stream) {
  store.dispatch({
    type: conferenceActions.CONFERENCE_PEERS_ADD_PEER,
    payload: {callerEasyrtcid, stream}
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

window.easyrtc.setOnStreamClosed(function(callerEasyrtcid) {
  /*debugger;
  window.easyrtc.setVideoObjectSrc(document.getElementById("box1"), "");*/
  var video =
    document.getElementById("u-" + callerEasyrtcid) ||
    document.getElementById("us-" + callerEasyrtcid);
  if (video) {
    console.log("Cleaning video stream");
    window.easyrtc.setVideoObjectSrc(video, "");
  }
});

export function appInit(domainServer) {
  // Prevent reconnection because it gives a lot of issues, see manual calls to disconnect as well
  window.easyrtc.setSocketUrl(domainServer, {
    transports: ["websocket"],
    reconnection: false
  });
  window.easyrtc.enableDebug(true);
  window.easyrtc.setOnError(function(e) {
    // Prevent anoying pop up.
    console.log("error from easyrtc:", e);
  });
  window.easyrtc.setRoomOccupantListener(callEverybodyElse);
  //window.easyrtc.easyApp("app", "box0", ["box1", "box2", "box3"], loginSuccess);
  window.easyrtc.setAutoInitUserMedia(true);

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
  window.easyrtc.enableMicrophone(true);

  window.easyrtc.setPeerListener(messageListener);
  window.easyrtc.setDisconnectListener(function() {
    window.easyrtc.showError(
      "LOST-CONNECTION",
      "Lost connection to signaling server"
    );
  });

  window.easyrtc.initMediaSource(
    () => {
      // success callback
      var selfVideo = document.getElementById("self-video-div");
      window.easyrtc.setVideoObjectSrc(
        selfVideo,
        window.easyrtc.getLocalStream()
      );
      window.easyrtc.connect(
        "Company_Chat_Line",
        () => console.log("success"),
        (e, e1) => console.log(e, e1)
      );
    },
    (e1, e2) => console.log(e1, e2)
  );
  /*window.easyrtc.setOnCall(function(easyrtcid, slot) {
    console.log("getConnection count=" + window.easyrtc.getConnectionCount());
    boxUsed[slot + 1] = true;
    if (activeBox == 0) {
      // first connection
    }
  });

  window.easyrtc.setOnHangup(function(easyrtcid, slot) {
    boxUsed[slot + 1] = false;

    setTimeout(function() {
      document.getElementById(getIdOfBox(slot + 1)).style.visibility = "hidden";

      if (window.easyrtc.getConnectionCount() == 0) {
        // no more connections
      }
    }, 20);
  });*/
}
