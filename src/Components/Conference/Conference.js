import Chat from "./Chat/Chat";
import React, { Component } from "react";
import moment from "moment";
import NotificationSystem from "react-notification-system";
import Modal from "react-modal";
import MDSpinner from "react-md-spinner";
import { Redirect } from "react-router-dom";
import {
  authenticateToken,
  inviteToConference
} from "../../Services/conference/conferenceApi";
import "./Conference.css";
import * as rtcHelper from "../../Services/helpers/easyapp";
import CameraIconPermission from "../../assets/images/camera_permission.png";
import ConferenceLogo from "../../assets/images/ConferenceLogo.png";
import Footer from "./Footer/Footer";

import Header from "./Header/Header";
import UserVideo from "./UserVideo/UserVideo";
import InvitePeoplePopup from "./InvitePeoplePopup/InvitePeoplePopup";
import * as conferenceConsts from "../../constants/conference";
import SettingsPopup from "./SettingsPopup/SettingsPopup";

class Conference extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      modalText: "",
      redirectHome: false,
      showSettings: false
    };
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
    const domain =
      localStorage.getItem("conference") != null
        ? JSON.parse(localStorage.getItem("conference")).domain
        : null;
    this.setState({ domain });

    if (domain) {
      authenticateToken(domain.token).then(response => {
        response.json().then(
          data => {
            const newData = data;
            if (response.status === 200) {
              if (newData.costPerHour) {
                newData.costPerHour = parseFloat(newData.costPerHour);
              }
              newData.date = new Date();
              this.props.conferenceActions.updateGeneralData(newData);
              this.initConference();
            } else {
              this.invalidConference(newData);
            }
          },
          () => this.invalidConference()
        );
      }, this.invalidConference);
    } else {
      // No information
      this.invalidConference();
    }
  }

  componentWillUnmount() {
    // this.cancelPermissionChecker();
    rtcHelper.closeConference();
    this.props.chatActions.clearChat();
  }

  setFullScreenVideo = user => {
    const { conference } = this.props;
    if (user === undefined) {
      if (this.state.sharingWithMe.length > 0) {
        const firstVideo = this.state.sharingWithMe[0];
        this.setState({ selectedUser: firstVideo });
        window.easyrtc.setVideoObjectSrc(
          document.getElementById("video-selected"),
          firstVideo.stream
        );
      } else {
        this.setState({ selectedUser: null });
        window.easyrtc.setVideoObjectSrc(
          document.getElementById("video-selected"),
          ""
        );
      }
    } else {
      this.setState({ selectedUser: user });
      if (user === "me") {
        if (conference.sharingScreen) {
          window.easyrtc.setVideoObjectSrc(
            document.getElementById("video-selected"),
            conference.localStream
          );
        } else {
          window.easyrtc.setVideoObjectSrc(
            document.getElementById("video-selected"),
            rtcHelper.getLocalUserStream()
          );
        }
      } else if (user.screen !== undefined) {
        window.easyrtc.setVideoObjectSrc(
          document.getElementById("video-selected"),
          user.screen
        );
      } else {
        window.easyrtc.setVideoObjectSrc(
          document.getElementById("video-selected"),
          user.stream
        );
      }
    }
  };

  // Modal clicks
  handleClick = () => this.setState({ modal: true });
  handleClose = () => this.setState({ modal: false });

  // add notification
  addNotification = (title, message, level) => {
    this._notificationSystem.addNotification({
      title,
      message,
      level,
      autoDismiss: 3
    });
  };

  invalidConference = error => {
    if (error) console.log(error);
    this.setState({
      redirectHome: true,
      room: this.props.roomName
    });
  };

  saveSettings = () => {
    rtcHelper.reconnect();
  };

  _notificationSystem = null;

  showPopup = (message, loading = false, modalType = null) => {
    this.setState({
      isLoading: loading,
      modal: !loading
    });
    if (modalType) {
      this.setState({
        modal: {
          [modalType]: true
        }
      });
    }
    this.setState({ modalText: message });
  };

  removePopup = () => {
    this.setState({ isLoading: false, modal: false });
  };

  switchCamera = () => {
    rtcHelper.switchCamera();
  };

  switchMic = () => {
    rtcHelper.switchMic();
  };

  finishCall = () => {
    this.props.chatActions.clearChat();
    rtcHelper.closeConference();
    this.setState({ redirectHome: true });
  };

  shareRoomWithContact = () => {
    this.setState({ shareRoom: true });
  };

  openFullScreen = evt => {
    const elem = evt.currentTarget;

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

  // Conference logic
  initConference = () => {
    rtcHelper.appInit(
      this.props.conference.domain.server,
      this.props.roomName,
      localStorage.username
    );

    /* rtcHelper.getAudioSourceList();
   rtcHelper.getVideoSourceList();
   rtcHelper.getAudioSinkList();
  */
  };

  // Share screen features --- Screen sharing tests --- #1: <script
  // src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script> in order to
  // add a helper js #2: Users must download chrome extension:
  // https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgc
  // o dmmfdlknahffk

  shareScreen = () => {
    rtcHelper.shareScreen();
  };

  invitePersonToConference = event => {
    event.preventDefault();
    inviteToConference(this.state.invitePersonEmail, window.location.href).then(
      response => {
        response.json().then(data => {
          this.addNotification(
            "Invitation",
            "Your invitation was sent",
            "success"
          );
          this.setState({ shareRoom: false });
          this.setState({ invitePersonEmail: "" });
        });
      },
      error => alert(error)
    );
  };

  sendPeerMessage = msg => {
    const { conference } = this.props;
    rtcHelper.sendPeerMessage(
      conference.domain.roomName,
      conferenceConsts.CHAT_MESSAGE_TYPE,
      msg,
      conference.domain.username
    );
  };

  render() {
    const {
      conference,
      peers,
      chat,
      chatActions,
      settingsActions
    } = this.props;
    const { redirectHome, room } = this.state;

    if (redirectHome) {
      return <Redirect to={`/home/${room}`} />;
    }

    // Modal
    let modalContent = "";
    if (conference.loading) {
      modalContent = <MDSpinner />;
    } else {
      modalContent = this.state.modalText;
    }

    let modalContentBrowser = "";
    if (this.state.modal.deviceNotFound || this.state.modal.permissionError) {
      if (this.state.modal.deviceNotFound) {
        modalContentBrowser =
          "Your computer does not have camera or microphone";
      }
      if (this.state.modal.permissionError) {
        const browser = rtcHelper.detectBrowser();
        switch (browser) {
          case "chrome":
            modalContentBrowser = (
              <span>
                Click the
                <img
                  alt=""
                  className="permissionIcon"
                  src={CameraIconPermission}
                />
                icon in the URL bar above to give Meetcloud access to your
                computer's camera and microphone.
              </span>
            );
            break;
          case "firefox":
            modalContentBrowser = (
              <span>
                Se necesitan permisos para utilizar la cámara y el micrófono.
                Por favor, refresque la pagina y acepte los permisos
              </span>
            );
            break;
          case "edge":
            modalContentBrowser = (
              <span>
                Se necesitan permisos para utilizar la cámara y el micrófono.
                Por favor, refresque la pagina y acepte los permisos
              </span>
            );
            break;

          case "safari":
            modalContentBrowser = (
              <span>
                Debe habilitar el plugin TemWebRTCPlugin en la configuracion de
                seguridad del navegador
              </span>
            );
            break;
          case "ie":
            modalContentBrowser = (
              <span>
                Debe habilitar el plugin TemWebRTCPlugin. Luego habilitar los
                permisos de cámara y micrófono en la configuracion de su
                navegador
              </span>
            );
            break;
          default:
            modalContentBrowser = (
              <span>
                Se necesitan permisos para utilizar la cámara y el micrófono.
                Por favor, refresque la pagina y acepte los permisos
              </span>
            );
            break;
        }
      }

      modalContent = (
        <div>
          <h3>Meetcloud can't access your camera or microphone.</h3>
          <div>{modalContentBrowser}</div>
        </div>
      );
    }
    // Empty room
    let emptyRoom = "";
    if (peers.length === 0) {
      emptyRoom = <span>Room is empty, waiting...</span>;
    }

    let selfVideoStyles = "selfVideo ";
    if (this.state.selectedUser) {
      selfVideoStyles += "selected ";
    }
    if (!conference.sharingScreen) {
      selfVideoStyles += " mirror ";
    }
    return (
      <div className="Conference">
        <NotificationSystem ref="notificationSystem" />
        <video muted className="videoBackground" id="video-selected" />
        <Modal isOpen={this.state.modal || conference.loading}>
          {modalContent}
        </Modal>
        <InvitePeoplePopup
          isOpen={this.state.shareRoom}
          onCloseModal={() => this.setState({ shareRoom: false })}
        />
        <SettingsPopup
          isOpen={this.state.showSettings}
          settings={this.props.settings}
          onVideoInputSelected={settingsActions.videoDevicesSelected}
          onAudioInputSelected={settingsActions.audioDeviceSelected}
          onAudioOutputSelected={settingsActions.audioDeviceSinkSelected}
          onCloseModal={() => this.setState({ showSettings: false })}
          rtcHelper={rtcHelper}
          onSaveSettings={this.saveSettings}
        />{" "}
        {peers.length > 0 && <div className="conferenceHeader" />}
        <img alt="" className="conferenceLogo" src={ConferenceLogo} />{" "}
        {conference.data && (
          <Header
            conferenceActions={this.props.conferenceActions}
            conference={conference}
            unreadMessages={chat.unreadMessages}
            openChat={chatActions.swithVisible.bind(null)}
            openSettings={() => this.setState({ showSettings: true })}
          />
        )}
        <div className="emptyRoom">{emptyRoom}</div>
        <div className="videoList">
          <div className="row start">
            <div className="col">
              <div
                className="box box-video"
                onClick={event => {
                  this.setFullScreenVideo("me");
                }}
              >
                <span className="videoNameSelf">You</span>
                <video id="self-video-div" muted className={selfVideoStyles} />
              </div>
            </div>
            {peers.map(user => (
              <div key={user.callerEasyrtcid} className="col">
                <div
                  className="box box-video"
                  onClick={event => this.setFullScreenVideo(user)}
                >
                  <UserVideo
                    selected={
                      this.state.selectedUser &&
                      this.state.selectedUser.id === user.callerEasyrtcid
                    }
                    user={user}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer
          onCameraClick={rtcHelper.switchCamera.bind(null)}
          onMicClick={rtcHelper.switchMic.bind(null)}
          onShareClick={this.shareRoomWithContact}
          onShareScreenClick={this.shareScreen}
          cameraEnabled={conference.cameraEnabled}
          micEnabled={conference.micEnabled}
          shareScreenEnabled={conference.sharingScreen}
          onHangUp={this.finishCall.bind(null)}
        />
        <Chat
          messages={chat.messages}
          opened={chat.visible}
          onCloseChat={chatActions.swithVisible.bind(null)}
          onSendMessage={this.sendPeerMessage.bind(null)}
        />
      </div>
    );
  }
}
export default Conference;
