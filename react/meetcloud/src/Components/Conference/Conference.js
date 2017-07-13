import React, {Component} from 'react';
import './Conference.css';
import {Redirect} from 'react-router-dom'
import {authenticateToken} from '../../Services/conference/conferenceApi'
import * as rtcHelper from '../../Services/helpers/easyrtcHelper'

class Conference extends Component {

  constructor(props) {
    super(props);
    this.state = {
      valid: true,
      domain: {},
      conferenceData: {},
      connected: false,
      selectedAudioDevice: null,
      audioDevices: [],
      selectedVideoDevice: null,
      videoDevices: [],
      audioOutputDevices: [],
      selectedAudioOutputDevice: null
    };
  }

  invalidConference = () => {
    alert("Invalid conference");
    this.setState({valid: false});
  }

  addMessage = () => {
    alert("addMessage not implemented yet");
  }

  disconnectListener = () => {
    console.log("setDisconnectListener");
    if (this.state.connected)
      window.easyrtc.disconnect(); // must call this otherwise manual reconnect is not possible
    this.setState({connected: false});
    /* TODO:
      $scope.connected = null;
      $scope.joined = null;

      $scope.sharingWithMe = [];
      $scope.sharingWithMeDict = {};
      $scope.members = [];
      $scope.membersDict = {};
      $scope.pendingCallsDict = {};
      */
    // If we had a stream close it
    if (this.state.mediaSourceWorking) {
      window.easyrtc.closeLocalStream(this.state.mediaSourceWorking.streamName);
      this.setState({mediaSourceWorking: null});
    }
    // same with screen sharing
    if ($scope.sharingScreen) {
      window.easyrtc.closeLocalStream(SCREEN_SHARING_STREAM_NAME);
      $scope.sharingScreen = false;
    }

    window.easyrtc.setVideoObjectSrc(selfVideoElement, ""); // Clear video src
    window.easyrtc._roomApiFields = undefined; //Clear this since easyrtc doesn't and causes some error log due to invalid room
    //cfpLoadingBar.complete();
  }

  peerListener = (easyrtcid, msgType, msgData, targeting) => {
    console.log("setPeerListener");

    if (msgType == CHAT_MESSAGE_TYPE) {
      addMessage(msgData.msg, msgData.source);
      playSound(NEW_MESSAGE_AUDIO);
    } else if (msgType == WAKE_UP_MESSAGE_TYPE) {
      var exists = $scope.membersDict[easyrtcid];
      $scope.alertError((exists
        ? exists.username
        : 'Unknown') + " sent you a wake up!");
      playSound(WAKE_UP_AUDIO);
    }
  }

  roomOcupantListener = (roomName, ocuppants) => {
    console.log("roomOcupantListener");
    console.log('setRoomOccupantListener');

    /*TODO: var before = $scope.members.length;

    $scope.members = [];
    $scope.membersDict = occupants;

    for (k in occupants) {
      $scope.members.push(occupants[k]);

      // Call anyone that's not sharing with me.
      // and not pending. Need second check because this event sometimes is called multiple times
      // without an established call
      // and if we are not restarting sources since we are going to call afterwards.
      if (!$scope.firstRoomListener) {
        $scope.callOne(k);
      }
    }

    if (!$scope.firstRoomListener) {
      var after = $scope.members.length;
      if (after > before) {
        playSound(JOINED_AUDIO);
      } else if (after < before) {
        playSound(LEFT_AUDIO);
      }
    }
    $scope.firstRoomListener = false; // Need this flag so the first room call we don't call other users, avoiding call loops.

    // Make sure all users sharing with me still exist
    // otherwise kill their streams
    for (k in $scope.sharingWithMeDict) {
      if (!$scope.membersDict[k]) {
        killUser(k);
      }
    }*/

  }

  // Conference logic
  initConference = () => {
    let roomToJoin = this.state.domain.name + "." + this.state.domain.room;
    rtcHelper.initializeEasyRTC(this.state.domain.server);

    // Get Audio source list
    let getAudioGen = rtcHelper.getAudioSourceList();
    getAudioGen.next().value.then(data => {
      this.setState({selectedAudioDevice: data.selectedAudioDevice, audioDevices: data.audioDevices});
    }).catch(e => alert("Could not get audio devices: " + e));

    // Get video source list
    let getVideoGen = rtcHelper.getVideoSourceList();
    getVideoGen.next().value.then(data => {
      this.setState({selectedVideoDevice: data.selectedVideoDevice, videoDevices: data.videoDevices});
    }).catch(e => alert("Could not get video devices: " + e));

    // Get output source list
    let getOutputGen = rtcHelper.getAudioSinkList();
    getOutputGen.next().value.then(data => {
      this.setState({audioOutputDevices: data.audioOutputDevices, selectedAudioOutputDevice: data.selectedAudioOutputDevice});
    }).catch(e => alert("Could not get output devices: " + e));

    // listeners
    window.easyrtc.setDisconnectListener(this.disconnectListener);
    window.easyrtc.setPeerListener(this.peerListener(easyrtcid, msgType, msgData, targeting));
    window.easyrtc.setRoomOccupantListener(this.roomOcupantListener(roomName, occupants));
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

  render() {
    const {valid} = this.state;

    if (!valid) {
      return <Redirect to='/'/>;
    }

    return (
      <div>
        Conference
      </div>
    )
  }
}

export default Conference;
