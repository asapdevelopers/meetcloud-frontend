import React, {Component} from 'react';
import moment from 'moment'
import './Conference.css';
import {Redirect} from 'react-router-dom'
import {authenticateToken} from '../../Services/conference/conferenceApi'
import * as rtcHelper from '../../Services/helpers/easyrtcHelper'

// About screen sharing:
// Plugin: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk
// Plugin docs: https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture
// Helper lib to communicate with plugin: https://cdn.webrtc-experiment.com/getScreenId.js

// Consts
const CHAT_MESSAGE_TYPE = 'chatMessage';
const WAKE_UP_MESSAGE_TYPE = 'wakeUpMessage';
const SCREEN_SHARING_STREAM_NAME = 'ssharing';

const WAKE_UP_AUDIO = new Audio('../../assets/audios/wake_up.mp3');
const JOINED_AUDIO = new Audio('../../assets/audios/joined.mp3');
const LEFT_AUDIO = new Audio('../../assets/audios/left.mp3');
const NEW_MESSAGE_AUDIO = new Audio('/audios/new_message.mp3');
const selfVideoElement = document.getElementById("self-video-div");

class Conference extends Component {

  constructor(props) {
    super(props);
    this.state = {
      valid: true,
      error: null,
      username: null,
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
      messages: {
        message: '',
        list: []
      },
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
      firstRoomListener: true
    };
  }

  // Helper to allow setting audio output of an element
  // Currently only supported by chrome
  setAudioOutput = (element) => {
    if (element.setSinkId && this.state.selectedAudioOutputDevice) {
      element.setSinkId(this.state.selectedAudioOutputDevice.deviceId);
    }
  }

  addMessage = (msg, source) => {
    this.state.messages.list.push({date: new moment(), msg: msg, source: source});
    //$('#messages-list-holder').scrollTop($('#messages-list-holder')[0].scrollHeight);
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
    this.setState({connected: null});
    this.setState({joined: null});
    this.setState({sharingWithMe: []});
    this.setState({sharingWithMeDict: {}});
    this.setState({members: []});
    this.setState({membersDict: {}});
    this.setState({pendingCallsDict: {}});

    // If we had a stream close it
    if (this.state.mediaSourceWorking) {
      window.easyrtc.closeLocalStream(this.state.mediaSourceWorking.streamName);
      this.setState({mediaSourceWorking: null});
    }
    // same with screen sharing
    if (this.state.sharingScreen) {
      window.easyrtc.closeLocalStream(SCREEN_SHARING_STREAM_NAME);
      this.setState({sharingScreen: false});
    }
    window.easyrtc.setVideoObjectSrc(selfVideoElement, ""); // Clear video src
    window.easyrtc._roomApiFields = undefined; //Clear this since easyrtc doesn't and causes some error log due to invalid room
  }

  peerListener = (easyrtcid, msgType, msgData, targeting) => {
    console.log("setPeerListener");
    if (msgType === CHAT_MESSAGE_TYPE) {
      this.addMessage(msgData.msg, msgData.source);
      rtcHelper.playSound(NEW_MESSAGE_AUDIO);
    } else if (msgType === WAKE_UP_MESSAGE_TYPE) {
      let exists = this.state.membersDict[easyrtcid];
      alert((exists
        ? exists.username
        : 'Unknown') + " sent you a wake up!")

      rtcHelper.playSound(WAKE_UP_AUDIO);
    }
  }

  callOne = (target, attempt) => {
    console.log("Call one: pending")
  }

  killUser = (id) => {
    console.log("Kill user: pending")
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
        rtcHelper.playSound(JOINED_AUDIO);
      } else if (after < before) {
        rtcHelper.playSound(LEFT_AUDIO);
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

  // To keep timer counter updated
  clockInterval = () => {
    if(this.state.joined){
      // room fields might not be instantly available
      let roomCost = window.easyrtc.getRoomField(this.state.joined.name, "roomCost");
      let joinedAux = {}
      if (roomCost) {
        joinedAux.created = moment(roomCost.createdDate);
        var now = new moment();
        joinedAux.duration = new moment().startOf('day').seconds(now.diff(this.state.joined.created, 'seconds')).format('H:mm:ss');
        joinedAux.cost = roomCost.cost;
        joinedAux.costPerHour = parseFloat(roomCost.costPerHour);
      }
      this.setState({joined:joinedAux});
    }
  }

  // Conference logic
  initConference = () => {
    this.intervalId = setInterval(this.clockInterval, 1000);
    //let roomToJoin = this.state.domain.name + "." + this.state.domain.room;
    rtcHelper.initializeEasyRTC(this.state.domain.server);

    // Get Audio source list
    let getAudioGen = rtcHelper.getAudioSourceList();
    getAudioGen.next().value.then(data => {
      this.setState({selectedAudioDevice: data.selectedAudioDevice, audioDevices: data.audioDevices});
    }).catch(e => alert("Could not get audio devices: " + e));

    // Get video source list
    let getVideoGen = rtcHelper.getVideoSourceList();
    getVideoGen.next().value.then(data => {
      this.setState({selectedVideoDevice: data.selectedVideoDevice, videoDevices: data.videoDevices, cameraEnabled:data.cameraEnabled});
    }).catch(e => alert("Could not get video devices: " + e));

    // Get output source list
    let getOutputGen = rtcHelper.getAudioSinkList();
    getOutputGen.next().value.then(data => {
      this.setState({audioOutputDevices: data.audioOutputDevices, selectedAudioOutputDevice: data.selectedAudioOutputDevice});
    }).catch(e => alert("Could not get output devices: " + e));

    // listeners
    window.easyrtc.setDisconnectListener(() => this.disconnectListener);
    window.easyrtc.setPeerListener((easyrtcid, msgType, msgData, targeting) => this.peerListener(easyrtcid, msgType, msgData, targeting));
    window.easyrtc.setRoomOccupantListener((roomName, occupants) => this.roomOcupantListener(roomName, occupants));
  }

  componentDidMount() {
    let domain = localStorage.getItem("conference") != null
      ? JSON.parse(localStorage.getItem("conference")).domain
      : null;
    this.setState({domain});

    if (domain) {
      authenticateToken(domain.token).then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
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
 }

  render() {
    const {valid} = this.state;

    if (!valid) {
      return <Redirect to='/'/>;
    }

    return (
      <div>
        Conference loaded!
      </div>
    )
  }
}

export default Conference;
