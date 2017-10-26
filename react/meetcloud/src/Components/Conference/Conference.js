import React, {Component} from 'react';
import moment from 'moment'
import './Conference.css';
import {Redirect} from 'react-router-dom'
import {authenticateToken} from '../../Services/conference/conferenceApi'
import * as rtcHelper from '../../Services/helpers/easyrtcHelper'
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ReactSpinner from 'react-spinjs';
import CameraIconPermission from '../../assets/images/camera_permission.png';
import ConferenceLogo from '../../assets/images/ConferenceLogo.png';
import Footer from './Footer/Footer';
import Chat from './Chat/Chat';
import Header from './Header/Header';
import UserVideo from './UserVideo/UserVideo';
import * as conferenceConsts from '../../Consts/conference'
import {inviteToConference} from '../../Services/conference/conferenceApi'
import NotificationSystem from 'react-notification-system';

class Conference extends Component {

  _notificationSystem : null;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      modal: false,
      modalText: "",
      valid: true,
      error: null,
      username: localStorage.getItem("username"),
      room: '',
      domain: {},
      conferenceData: {},
      connected: null,
      joined: null,
      members: [],
      membersDict: {},
      selectedAudioDevice: null,
      audioDevices: [],
      selectedVideoDevice: null,
      videoDevices: [],
      audioOutputDevices: [],
      selectedAudioOutputDevice: null,
      messages: [],
      unreadMessages: false,
      mediaSourceWorking: null,
      sharingScreen: false,
      cameraEnabled: localStorage.getItem('cameraEnabled') != null
        ? localStorage.getItem('cameraEnabled')
        : true, // Global camera setting, can be only changed while disconnected
      camera: true, // Turn on/off cam
      mic: true, // turn on/off mic
      sharingWithMe: [],
      sharingWithMeDict: {},
      pendingCallsDict: {},
      firstRoomListener: true,
      shareRoom: false,
      invitePersonEmail: null,
      showChat: false
    };
    this.permissionInterval = this.permissionInterval.bind(this);
  }

  // Helper to allow setting audio output of an element
  // Currently only supported by chrome
  setAudioOutput = (element) => {
    if (element.setSinkId && this.state.selectedAudioOutputDevice) {
      element.setSinkId(this.state.selectedAudioOutputDevice.deviceId);
    }
  }

  handleClick = () => this.setState({modal: true})
  handleClose = () => this.setState({modal: false})

  addNotification = (title, message, level) => {
    this._notificationSystem.addNotification({title, message, level, autoDismiss: 3});
  };

  addMessage = (msg, source) => {
    this.setState({
      messages: [
        ...this.state.messages, {
          date: new moment(),
          msg: msg,
          source: source
        }
      ]
    })
    if (!this.state.showChat) {
      this.setState({unreadMessages: true});
      this.addNotification(source, msg, "info");
    }
  }

  invalidConference = () => {
    alert("Invalid conference");
    this.setState({valid: false});
  }

  // listeners
  disconnectListener = () => {
    console.log("Disconected");
    if (this.state.connected) {
      window.easyrtc.disconnect(); // must call this otherwise manual reconnect is not possible
    }
    this.setState({
      connected: null,
      joined: null,
      sharingWithMe: [],
      sharingWithMeDict: {},
      members: [],
      membersDict: {},
      pendingCallsDict: {}
    });

    // If we had a stream close it
    if (this.state.mediaSourceWorking) {
      window.easyrtc.closeLocalStream(this.state.mediaSourceWorking.streamName);
      this.setState({mediaSourceWorking: null});
    }
    // same with screen sharing
    if (this.state.sharingScreen) {
      window.easyrtc.closeLocalStream(conferenceConsts.SCREEN_SHARING_STREAM_NAME);
      this.setState({sharingScreen: false});
    }
    window.easyrtc.setVideoObjectSrc(this.selfVideoElement, ""); // Clear video src
    window.easyrtc._roomApiFields = undefined; //Clear this since easyrtc doesn't and causes some error log due to invalid room
  }

  peerListener = (easyrtcid, msgType, msgData, targeting) => {
    console.log("setPeerListener");
    if (msgType === conferenceConsts.CHAT_MESSAGE_TYPE) {
      this.addMessage(msgData.msg, msgData.source);
      rtcHelper.playSound(conferenceConsts.NEW_MESSAGE_AUDIO);
    } else if (msgType === conferenceConsts.WAKE_UP_MESSAGE_TYPE) {
      let exists = this.state.membersDict[easyrtcid];
      alert((exists
        ? exists.username
        : 'Unknown') + " sent you a wake up!")

      rtcHelper.playSound(conferenceConsts.WAKE_UP_AUDIO);
    }
  }

  openChat = () => {
    this.setState({showChat: true});
    this.setState({unreadMessages: false});
  }

  closeChat = () => {
    this.setState({showChat: false});
  }

  // Will call a specific target.
  // It is interesting to note that when calling a target, the target also calls back
  // So setStreamAcceptor is also called afterwards.
  callOnSuccess = (otherCaller, mediaType) => {
    let pendingDict = this.state.pendingCallsDict;
    delete pendingDict[this.state.target];
    this.setState({pendingCallsDict: pendingDict});
  };

  callOnError = (errorCode, errMessage) => {
    console.log("Error calling: ", this.state.target, errorCode, errMessage);
    let pendingDict = this.state.pendingCallsDict;
    delete pendingDict[this.state.target];
    this.setState({pendingCallsDict: pendingDict});
    // re try
    setTimeout(() => {
      this.setState({
        attempt: this.state.attempt + 1
      })
      this.callOne(this.state.target, this.state.attempt)
    }, 3000);
  };

  callOnAcc = (wasAccepted, otherUser) => {};

  callOne = (target, a) => {
    let attempt = a !== undefined
      ? a
      : 0;
    // only call if not already sharing with me
    this.setState({target, attempt});
    if (this.state.sharingWithMeDict[target] || attempt > 5) {
      return;
    }

    // If call pending and not expired, also do not call. 5 seconds expiration
    if (this.state.pendingCallsDict[target] && (new Date().getTime() - this.state.pendingCallsDict[target]) < 5000) {
      // If pending call and not expired, set a re-try with a timeout.
      // it won't have effect if the call is established before the timeout
      setTimeout(() => {
        this.callOne(target, attempt + 1)
      }, 3000);
      return;
    }

    let pend = this.state.pendingCallsDict;
    pend[target] = new Date().getTime();
    this.setState({pendingCallsDict: pend});
    console.log("Call one called");
    let streams = [];

    // Manually add the streams we want on the call
    // so we can include default one (cam/mic) and
    // screen sharing if any.

    if (this.state.mediaSourceWorking) {
      streams.push(this.state.mediaSourceWorking.streamName);
    }

    if (this.state.sharingScreen) {
      streams.push(conferenceConsts.SCREEN_SHARING_STREAM_NAME);
    }
    this.setState({streams})
    window.easyrtc.call(target, this.callOnSuccess, this.callOnError, this.callOnAcc, streams);
  };

  killUser = (id) => {
    let found = null;
    for (let i = 0; i < this.state.sharingWithMe.length; i++) {
      if (this.state.sharingWithMe[i].id === id) {
        found = i;
        break;
      }
    }

    if (found != null) {
      // Clear stream source element
      if (document.getElementById('u-' + id)) {
        window.easyrtc.setVideoObjectSrc(document.getElementById('u-' + id), '');
      }
      if (document.getElementById('us-' + id)) {
        window.easyrtc.setVideoObjectSrc(document.getElementById('us-' + id), '');
      }
      this.setState({
        sharingWithMe: this.state.sharingWithMe.splice(found, 1)
      });
      let sharingDict = this.state.sharingWithMeDict;
      let pendingDict = this.state.pendingCallsDict;
      delete sharingDict[id];
      delete pendingDict[id];
      this.setState({sharingWithMeDict: sharingDict, pendingCallsDict: pendingDict});
    }
  }

  roomOcupantListener = (roomName, occupants) => {
    console.log('setRoomOccupantListener');
    var before = this.state.members.length;

    let membersAux = []
    let membersDictAux = occupants;

    for (let k in occupants) {
      membersAux.push(occupants[k]);

      // Call anyone that's not sharing with me.
      // and not pending. Need second check because this event sometimes is called multiple times
      // without an established call
      // and if we are not restarting sources since we are going to call afterwards.
      if (!this.state.firstRoomListener) {
        this.callOne(k);
      }
    }

    if (!this.state.firstRoomListener) {
      var after = this.state.length;
      if (after > before) {
        rtcHelper.playSound(conferenceConsts.JOINED_AUDIO);
      } else if (after < before) {
        rtcHelper.playSound(conferenceConsts.LEFT_AUDIO);
      }
    }
    this.setState({firstRoomListener: false}); // Need this flag so the first room call we don't call other users, avoiding call loops.
    this.setState({members: membersAux});
    this.setState({membersDict: membersDictAux});

    // Make sure all users sharing with me still exist
    // otherwise kill their streams
    for (let k in this.state.sharingWithMeDict) {
      if (!this.state.membersDict[k]) {
        this.killUser(k);
      }
    }
  }

  acceptCheckerListener = (id, cb) => {
    let streams = [];

    // Manually add the streams we want on the call
    // so we can include default one (cam/mic) and
    // screen sharing if any.
    if (this.state.mediaSourceWorking) {
      streams.push(this.state.mediaSourceWorking.streamName);
    }
    if (this.state.sharingScreen) {
      streams.push(conferenceConsts.SCREEN_SHARING_STREAM_NAME);
    }
    // accept with our streams
    cb(true, streams);
    this.setState({streams})
  };

  setFullScreenVideo = (user) => {
    if (user === undefined) {
      if (this.state.sharingWithMe.length > 0) {
        let firstVideo = this.state.sharingWithMe[0];
        this.setState({selectedUser: firstVideo});
        window.easyrtc.setVideoObjectSrc(document.getElementById("video-selected"), firstVideo.stream);
      } else {
        this.setState({selectedUser: null});
        window.easyrtc.setVideoObjectSrc(document.getElementById("video-selected"), '');
      }
    } else {
      this.setState({selectedUser: user});
      if (user === "me") {
        if (this.state.userScreen !== undefined) {
          window.easyrtc.setVideoObjectSrc(document.getElementById("video-selected"), this.state.userScreen);
        } else {
          window.easyrtc.setVideoObjectSrc(document.getElementById("video-selected"), this.state.userMedia);
        }
      } else {
        if (user.screen !== undefined) {
          window.easyrtc.setVideoObjectSrc(document.getElementById("video-selected"), user.screen);
        } else {
          window.easyrtc.setVideoObjectSrc(document.getElementById("video-selected"), user.stream);
        }
      }
    }
  };

  streamAcceptorListener = (id, stream, streamName) => {
    let newShared;

    let {sharingWithMeDict, sharingWithMe, membersDict} = this.state;

    // if already sharing, get it
    if (sharingWithMeDict[id]) {
      newShared = sharingWithMeDict[id];
    } else {
      newShared = {
        username: membersDict[id].username,
        id: id
      }
      sharingWithMe.push(newShared);
      sharingWithMeDict[id] = newShared;
    }
    this.setState({sharingWithMeDict, sharingWithMe});
    if (streamName === conferenceConsts.SCREEN_SHARING_STREAM_NAME) {
      newShared.screen = stream;
      setTimeout(() => {
        window.easyrtc.setVideoObjectSrc(document.getElementById('us-' + id), stream);
        this.setFullScreenVideo(newShared);
      }, 1000);
    } else {
      newShared.stream = stream;
      newShared.hasVideo = window.easyrtc.haveVideoTrack(id);
      newShared.hasAudio = window.easyrtc.haveAudioTrack(id);
      setTimeout(() => {
        if (document.getElementById('u-' + id)) {
          window.easyrtc.setVideoObjectSrc(document.getElementById('u-' + id), stream);
          this.setAudioOutput(document.getElementById('u-' + id));
        }
        this.setFullScreenVideo(newShared);
      }, 1000);
    }
    console.log("Stream accepted", newShared);
  }

  streamClosedListener = (id, stream, streamName) => {
    console.log("Stream closed: ", streamName);
    if (streamName === conferenceConsts.SCREEN_SHARING_STREAM_NAME) {
      setTimeout(() => window.easyrtc.setVideoObjectSrc(document.getElementById('us-' + id), ''), 1000);
      if (this.state.sharingWithMeDict[id]) {
        let sharing = this.state.sharingWithMeDict;
        delete sharing[id];
        this.setState({sharingWithMeDict: sharing});
      }
    } else {
      setTimeout(() => {
        if (document.getElementById('u-' + id)) {
          window.easyrtc.setVideoObjectSrc(document.getElementById('u-' + id), '');
          if (this.state.sharingWithMeDict[id]) {
            let sharing = this.state.sharingWithMeDict;
            delete sharing[id];
            this.setState({sharingWithMeDict: sharing});
          }
        }
      }, 1000);
    }
  };

  // To keep timer counter updated
  clockInterval = () => {
    if (this.state.joined) {
      // room fields might not be instantly available
      let data = this.state.conferenceData;

      let joinedAux = this.state.joined;
      if (data) {
        var now = new moment();
        var duration = now.diff(this.state.joined.date);
        joinedAux.duration = moment.utc(duration).format("HH:mm:ss")
        joinedAux.cost = moment.duration(duration).asSeconds() * data.costPerHour / 3600;
      }
      this.setState({joined: joinedAux});
    }
  }

  disconnect = () => {
    window.easyrtc.disconnect();
  }

  onConnect = (id) => {
    console.log("Connected", id);
    this.setState({connected: id});
    // init media
    if (window.easyrtc.supportsGetUserMedia && window.easyrtc.supportsGetUserMedia()) {
      window.easyrtc.enableVideo(this.state.cameraEnabled);
      this.setState({camera: this.state.cameraEnabled});

      // Select sources
      if (this.state.selectedAudioDevice) {
        window.easyrtc.setAudioSource(this.state.selectedAudioDevice.deviceId);
      }
      if (this.state.selectedVideoDevice) {
        window.easyrtc.setVideoSource(this.state.selectedVideoDevice.deviceId);
      }
      window.easyrtc.initMediaSource(this.mediaSuccess, this.mediaError);
    } else {
      this.disconnect();
      alert("Browser does not support media");
    }
  }

  onConnectError = (e) => {
    window.easyrtc.disconnect(); // so it doesn't try automatically after and re connecting is possible
    this.setState({connected: null});
    this.setState({joined: null});
    alert("Failed to connect");
  }

  connect = () => {
    if (this.state.selectedAudioDevice) {
      localStorage.setItem('selectedAudioDeviceId', this.state.selectedAudioDevice);
    }
    if (this.state.selectedVideoDevice) {
      localStorage.setItem('selectedVideoDeviceId', this.state.selectedVideoDevice.deviceId);
    }
    if (this.state.selectedAudioOutputDevice) {
      localStorage.setItem('selectedAudioOutputDeviceId', this.state.selectedAudioOutputDevice.deviceId);
    }
    localStorage.setItem('cameraEnabled', this.state.cameraEnabled);

    if (this.state.connected) {
      this.onConnect(this.state.connected);
    } else {
      window.easyrtc.setUsername(this.state.username);
      window.easyrtc.setCredential({'token': this.state.domain.token});
      console.log("on connect: " + conferenceConsts.WEB_RTC_APP)
      window.easyrtc.connect(conferenceConsts.WEB_RTC_APP, this.onConnect, this.onConnectError);
    }
  }

  onJoin = (roomName) => {
    console.log("Room joined", roomName);
    let joined = {
      name: roomName,
      date: new moment(),
      duration: '',
      cost: 0
    };
    this.setState({joined});

    window.easyrtc.sendPeerMessage({
      targetRoom: roomName
    }, conferenceConsts.CHAT_MESSAGE_TYPE, {
      msg: "Has joined.",
      source: this.state.username
    }, () => {}, () => {})
  }

  onJoinError = (errorCode, errorText, roomName) => {
    console.error("failed to join room", errorText);
    console.log("failed to join room: " + errorText)
    this.setState({joined: null});
    this.disconnect();
  }

  mediaSuccess = (obj) => {
    this.setState({userMedia: obj});
    this.removePopup();
    this.setState({mediaSourceWorking: obj});
    window.easyrtc.setVideoObjectSrc(this.selfVideoElement, obj);

    window.easyrtc.enableMicrophone(this.state.mic);
    window.easyrtc.enableCamera(this.state.camera);

    // join after we have media, if we are not already joined
    if (!this.state.joined) {
      console.log("going to join room");
      this.setState({firstRoomListener: true});
      this.setState({sharingWithMe: []});
      this.setState({sharingWithMeDict: {}});
      this.setState({members: []});
      this.setState({membersDict: {}});
      this.setState({pendingCallsDict: {}});
      window.easyrtc.joinRoom(this.state.domain.roomToJoin, {}, this.onJoin, this.onJoinError);
    }
  }

  showPopup = (message, loading = false, modalType = null) => {
    this.setState({isLoading: loading});
    this.setState({
      modal: !loading
    })
    if (modalType) {
      this.setState({
        modal: {
          [modalType]: true
        }
      });
    }
    this.setState({modalText: message});
  }

  removePopup = () => {
    console.log("Removing popup")
    this.setState({isLoading: false, modal: false});
  };

  mediaError = (a, b) => {
    console.log("Failed to get media source first time, trying again: ", a, b);
    this.setState({mediaSourceWorking: null});

    // On media error attempt to disable all media features
    // so we can still receive connections
    window.easyrtc.enableVideo(false);
    //try again with only audio
    window.easyrtc.initMediaSource(this.mediaSuccess, () => {
      console.log("Failed to get media source a second time: ", a, b);
      this.disconnect();
      if (a.includes('MEDIA_ERR')) {
        if (b.includes('PermissionDeniedError') || b.includes('SecurityError')) {
          this.showPopup("", false, "permissionError");
        }
        if (b.includes('DevicesNotFoundError')) {
          this.showPopup("", false, "deviceNotFound");
        }
        if (b.includes('NotFoundError')) {
          this.showPopup("", false, "deviceNotFound");
        }
      } else {
        this.showPopup("Failed to connect, please try again.")
      }
    });
  }

  // In order to change stream sources we need to re-obtain medias
  // and re connect from peers with the new streams
  changeSources = () => {
    window.easyrtc.leaveRoom(this.state.domain.roomToJoin, function() {
      this.setState({joined: null});
      this.connect(); //timeout 500ms?
    });
    window.easyrtc.hangupAll();
  };

  sendMessage = (msg) => {
    if (!msg) {
      return;
    }

    var suc = (a, b) => {
      // Add self message
      this.addMessage(msg, "Me");
    };

    var er = (a, b) => {
      alert("Failed to send message.");
    };

    // Broadcast message to everyone in the room.
    // We can use room name (original one)
    console.log("MSG TYPE: " + conferenceConsts.CHAT_MESSAGE_TYPE);
    console.log("this.state.joined.name: " + this.state.joined.name);
    console.log("this.state.username: " + this.state.username)
    window.easyrtc.sendPeerMessage({
      targetRoom: this.state.joined.name
    }, conferenceConsts.CHAT_MESSAGE_TYPE, {
      msg: msg,
      source: this.state.username
    }, suc, er);
  }

  sendWakeUp = (target) => {
    window.easyrtc.sendPeerMessage(target, conferenceConsts.WAKE_UP_MESSAGE_TYPE, {}, () => {}, () => {
      alert("Failed to sendWakeUp")
    });
  };

  switchCamera = () => {
    let camera = !this.state.camera;
    this.setState({camera});
    window.easyrtc.enableCamera(camera);
  }

  switchMic = () => {
    let mic = !this.state.mic;
    this.setState({mic});
    window.easyrtc.enableMicrophone(mic);
  }

  shareRoomWithContact = () => {
    this.setState({shareRoom: true})
  }

  openFullScreen = (evt) => {
    let elem = evt.currentTarget;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  };

  cancelPermissionChecker = () => {
    clearInterval(this.state.permissions_interval_checker);
  };

  permissionInterval = () => {
    try {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        if (devices.some((device) => device.label !== '')) {
          this.cancelPermissionChecker();
          let getAudioGen = rtcHelper.getAudioSourceList();
          let getVideoGen = rtcHelper.getVideoSourceList();
          let getOutputGen = rtcHelper.getAudioSinkList();

          // Get Audio source list
          getAudioGen.next().value.then(data => {
            this.setState({selectedAudioDevice: data.selectedAudioDevice, audioDevices: data.audioDevices});
          }).catch(e => alert("Could not get audio devices: " + e));

          // Get video source list
          getVideoGen.next().value.then(data => {
            this.setState({selectedVideoDevice: data.selectedVideoDevice, videoDevices: data.videoDevices, cameraEnabled: data.cameraEnabled});
          }).catch(e => alert("Could not get video devices: " + e));

          // Get output source list
          getOutputGen.next().value.then(data => {
            this.setState({audioOutputDevices: data.audioOutputDevices, selectedAudioOutputDevice: data.selectedAudioOutputDevice});
          }).catch(e => alert("Could not get output devices: " + e));
          this.connect();
        }
      });
    } catch (err) {
      this.cancelPermissionChecker()
    }
  }

  // Conference logic
  initConference = () => {
    console.log("Detect browser: " + rtcHelper.detectBrowser);
    let browser = rtcHelper.detectBrowser()
    if (browser === "chrome") {
      this.permissions_interval_checker = setInterval(this.permissionInterval, 1000);
      this.setState({permissions_interval_checker: this.permissions_interval_checker});
    }

    this.intervalId = setInterval(this.clockInterval, 1000);
    rtcHelper.initializeEasyRTC(this.state.domain.server);

    let getAudioGen = rtcHelper.getAudioSourceList();
    let getVideoGen = rtcHelper.getVideoSourceList();
    let getOutputGen = rtcHelper.getAudioSinkList();

    // Get Audio source list
    getAudioGen.next().value.then(data => {
      this.setState({selectedAudioDevice: data.selectedAudioDevice, audioDevices: data.audioDevices});
    }).catch(e => alert("Could not get audio devices: " + e));

    // Get video source list
    getVideoGen.next().value.then(data => {
      this.setState({selectedVideoDevice: data.selectedVideoDevice, videoDevices: data.videoDevices, cameraEnabled: data.cameraEnabled});
    }).catch(e => alert("Could not get video devices: " + e));

    // Get output source list
    getOutputGen.next().value.then(data => {
      this.setState({audioOutputDevices: data.audioOutputDevices, selectedAudioOutputDevice: data.selectedAudioOutputDevice});
    }).catch(e => alert("Could not get output devices: " + e));

    // listeners
    window.easyrtc.setDisconnectListener(() => this.disconnectListener);
    window.easyrtc.setPeerListener((easyrtcid, msgType, msgData, targeting) => this.peerListener(easyrtcid, msgType, msgData, targeting));
    window.easyrtc.setRoomOccupantListener((roomName, occupants) => this.roomOcupantListener(roomName, occupants));
    window.easyrtc.setAcceptChecker((id, cb) => this.acceptCheckerListener(id, cb));
    window.easyrtc.setStreamAcceptor(this.streamAcceptorListener);
    window.easyrtc.setOnStreamClosed(this.streamClosedListener);

    //connect
    this.connect();
  }

  // Share screen features
  // --- Screen sharing tests ---
  // #1: <script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script> in order to add a helper js
  // #2: Users must download chrome extension: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

  stopShareScreen = () => {
    window.easyrtc.closeLocalStream(conferenceConsts.SCREEN_SHARING_STREAM_NAME);
    this.setState({sharingScreen: false});
    this.setState({userScreen: null});
    this.switchCamera();
    if (this.state.userMedia) {
      window.easyrtc.setVideoObjectSrc(this.selfVideoElement, this.state.userMedia);
    }
    this.setFullScreenVideo();
    console.log("Fabricio")
    console.log(this.state.userMedia)
    this.sendLocalStream(this.state.userMedia.streamName);
  };

  sendLocalStream = (streamName) => {
    for (let i = 0; i < this.state.sharingWithMe.length; i++) {
      window.easyrtc.addStreamToCall(this.state.sharingWithMe[i].id, streamName, function() {
        console.log("Stream accepted: " + streamName);
      });
    }
  }

  shareScreen = () => {
    if (this.state.sharingScreen) {
      this.stopShareScreen();
    } else {
      window.getScreenId((error, sourceId, screen_constraints) => {
        if (error || !sourceId) {
          alert("Failed to get screen, make sure plugin is installed. https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk")
        } else {
          var _ = this;
          navigator.getUserMedia(screen_constraints, (stream) => {

            // register screen stream and send it to all existing peers.
            window.easyrtc.register3rdPartyLocalMediaStream(stream, conferenceConsts.SCREEN_SHARING_STREAM_NAME);
            this.setState({sharingScreen: true});
            this.setState({camera: false});
            this.setState({userScreen: stream});
            window.easyrtc.setVideoObjectSrc(this.selfVideoElement, stream);
            //window.easyrtc.enableCamera(false);

            stream.oninactive = () => {
              if (stream.oninactive) {
                stream.oninactive = undefined;
                _.stopShareScreen();
              }
            };
            _.sendLocalStream(conferenceConsts.SCREEN_SHARING_STREAM_NAME);
          }, (error) => console.error(error));
        }
      });
    }
  }

  invitePersonToConference = (event) => {
    event.preventDefault();
    inviteToConference(this.state.invitePersonEmail, window.location.href).then((response) => {
      response.json().then((data) => {
        this.addNotification("Invitation", "Your invitation was sent", "success");
        this.setState({shareRoom: false});
        this.setState({invitePersonEmail: ''});
      })
    }, (error) => alert(error));
  };

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
    this.selfVideoElement = document.getElementById("self-video-div");
    let domain = localStorage.getItem("conference") != null
      ? JSON.parse(localStorage.getItem("conference")).domain
      : null;
    this.setState({domain});

    if (domain) {
      authenticateToken(domain.token).then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            if (data.costPerHour) {
              data.costPerHour = parseFloat(data.costPerHour);
            }
            this.setState({conferenceData: data});
            this.initConference();
          }, (error) => alert(error))
        } else {
          this.invalidConference()
        }
      }, (error) => this.invalidConference());
    } else {
      // No information
      this.invalidConference();
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    this.cancelPermissionChecker();
    window.easyrtc.leaveRoom(this.state.domain.roomToJoin, function() {
      this.setState({joined: null});
    });
    window.easyrtc.hangupAll();
    this.disconnect();
  }

  render() {
    const {valid} = this.state;

    if (!valid) {
      return <Redirect to='/'/>;
    }

    // Modal
    let modalContent = ""
    if (this.state.isLoading) {
      modalContent = <ReactSpinner color="white"/>
    }
    if (this.state.modal) {
      modalContent = (
        <ModalDialog onClose={this.props.onClose} className="example-dialog" dismissOnBackgroundClick={false}>
          {this.state.modalText}
        </ModalDialog>
      );
    }
    let modalContentBrowser = "";
    if (this.state.modal.deviceNotFound || this.state.modal.permissionError) {
      if (this.state.modal.deviceNotFound) {
        modalContentBrowser = "Your computer does not have camera or microphone";
      }
      if (this.state.modal.permissionError) {
        let browser = rtcHelper.detectBrowser();

        switch (browser) {
          case 'chrome':
            modalContentBrowser = (
              <span>Click the
                <img alt="" className="permissionIcon" src={CameraIconPermission}/>
                icon in the URL bar above to give Meetcloud access to your computer's camera and microphone.
              </span>
            );
            break;
          case 'firefox':
            modalContentBrowser = (
              <span>Se necesitan permisos para utilizar la cámara y el micrófono. Por favor, refresque la pagina y acepte los permisos</span>
            );
            break;
          case 'edge':
            modalContentBrowser = (
              <span>Se necesitan permisos para utilizar la cámara y el micrófono. Por favor, refresque la pagina y acepte los permisos</span>
            );
            break;

          case 'safari':
            modalContentBrowser = (
              <span>Debe habilitar el plugin TemWebRTCPlugin en la configuracion de seguridad del navegador</span>
            );
            break;
          case 'ie':
            modalContentBrowser = (
              <span>Debe habilitar el plugin TemWebRTCPlugin. Luego habilitar los permisos de cámara y micrófono en la configuracion de su navegador</span>
            );
            break;
          default:
            modalContentBrowser = (
              <span>Se necesitan permisos para utilizar la cámara y el micrófono. Por favor, refresque la pagina y acepte los permisos</span>
            );
            break;
        }
      }

      let modalContent = (
        <ModalDialog onClose={this.props.onClose} className="example-dialog" dismissOnBackgroundClick={false}>
          <h3>Meetcloud can't access your camera or microphone.</h3>
          {modalContentBrowser}
        </ModalDialog>
      );
    }
    let modal = (this.state.modal || this.state.isLoading) && <ModalContainer onClose={this.props.onClose}>
      {modalContent}
    </ModalContainer>
    let shareContent = ""
    if (this.state.shareRoom) {
      shareContent = <ModalDialog onClose={() => this.setState({shareRoom: false})} className="share-dialog" dismissOnBackgroundClick={true}>
        <div className="share-text">Invite your friends to this room.</div>
        <form onSubmit={(event) => this.invitePersonToConference(event)}>
          <span className="share-email">Email :
          </span>
          <input className="inputText" type="text" value={this.state.invitePersonEmail} onChange={(event) => this.setState({invitePersonEmail: event.target.value})}></input>
          <div className="share-text">
            <button className="button" type="submit">Invite</button>
          </div>
        </form>
      </ModalDialog>
    }

    let shareRoomModal = (this.state.shareRoom) && <ModalContainer onClose={this.props.onClose}>{shareContent}
    </ModalContainer>
    // Empty room
    let emptyRoom = ""
    if (this.state.sharingWithMe.length === 0) {
      emptyRoom = (
        <span>Room is empty, waiting...</span>
      )
    }
    let header = ""
    if (this.state.joined != null) {
      header = (<Header durationCall={this.state.joined.duration} unreadMessages={this.state.unreadMessages} openChat={this.openChat} cost={this.state.joined.cost}/>)
    }
    return (
      <div className="Conference">
        <NotificationSystem ref="notificationSystem"/>
        <video muted className="videoBackground" id="video-selected"></video>
        {modal}
        {shareRoomModal}
        {this.state.sharingWithMe.length > 0 && (
          <div className="conferenceHeader"></div>
        )}
        <img alt="" className="conferenceLogo" src={ConferenceLogo}/> {header}
        <div className="emptyRoom">{emptyRoom}</div>
        <div className="videoList">
          <div className="row start">
            <div className="col">
              <div className="box box-video" onClick={(event) => {
                this.setFullScreenVideo("me")
              }}>
                <span className="videoNameSelf">You</span>
                <video id="self-video-div" muted className={this.state.selectedUser === "me"
                  ? 'selfVideo selected'
                  : 'selfVideo'}></video>
              </div>
            </div>
            {this.state.sharingWithMe.map(user => {
              return <div key={user.id} className="col">
                <div className="box box-video" onClick={(event) => this.setFullScreenVideo(user)}>
                  <UserVideo selected={this.state.selectedUser && this.state.selectedUser.id === user.id} user={user}/>
                </div>
              </div>
            })}
          </div>
        </div>
        <Footer onCameraClick={this.switchCamera} onMicClick={this.switchMic} onShareClick={this.shareRoomWithContact} onShareScreenClick={this.shareScreen} shareScreenEnabled={this.state.sharingScreen} cameraEnabled={this.state.camera} micEnabled={this.state.mic}/>
        <Chat messages={this.state.messages} opened={this.state.showChat} onCloseChat={this.closeChat} onSendMessage={this.sendMessage}/>
      </div>
    )
  }
}
export default Conference;
