import React, { Component } from "react";
import moment from "moment";
import "./Conference.css";
import { Redirect } from "react-router-dom";
import { authenticateToken } from "../../Services/conference/conferenceApi";
import * as rtcHelper from "../../Services/helpers/easyapp";
import Modal from "react-modal";
import MDSpinner from "react-md-spinner";
import CameraIconPermission from "../../assets/images/camera_permission.png";
import ConferenceLogo from "../../assets/images/ConferenceLogo.png";
import Footer from "./Footer/Footer";
import Chat from "./Chat/Chat";
import Header from "./Header/Header";
import UserVideo from "./UserVideo/UserVideo";
import InvitePeoplePopup from "./InvitePeoplePopup/InvitePeoplePopup";
import * as conferenceConsts from "../../constants/conference";
import { inviteToConference } from "../../Services/conference/conferenceApi";
import NotificationSystem from "react-notification-system";

class Conference extends Component {
  _notificationSystem = null;

  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      modalText: "",
      valid: true,
      error: null,
      showChat: false,
      redirectHome: false,
      cameraEnabled: true,
      micEnabled: true,
      messages: []
    };
  }

  // Helper to allow setting audio output of an element
  // Currently only supported by chrome
  setAudioOutput = element => {
    if (element.setSinkId && this.state.selectedAudioOutputDevice) {
      element.setSinkId(this.state.selectedAudioOutputDevice.deviceId);
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

  //add message
  addMessage = (msg, source) => {
    this.setState({
      messages: [
        ...this.state.messages,
        {
          date: new moment(),
          msg: msg,
          source: source
        }
      ]
    });
    if (!this.state.showChat) {
      this.setState({ unreadMessages: true });
      this.addNotification(source, msg, "info");
    }
  };

  invalidConference = error => {
    if (error) console.log(error);
    this.setState({
      valid: false,
      redirectHome: true,
      room: this.props.roomName
    });
  };

  setFullScreenVideo = user => {
    if (user === undefined) {
      if (this.state.sharingWithMe.length > 0) {
        let firstVideo = this.state.sharingWithMe[0];
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
        if (this.state.userScreen !== undefined) {
          window.easyrtc.setVideoObjectSrc(
            document.getElementById("video-selected"),
            this.state.userScreen
          );
        } else {
          window.easyrtc.setVideoObjectSrc(
            document.getElementById("video-selected"),
            this.state.userMedia
          );
        }
      } else {
        if (user.screen !== undefined) {
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
    }
  };

  // To keep timer counter updated
  clockInterval = () => {
    const { conference } = this.props;
    if (conference.data) {
      var now = new moment();
      var duration = now.diff(conference.data.date);
      let joinedAux = conference.data;
      joinedAux.duration = moment.utc(duration).format("HH:mm:ss");
      joinedAux.cost =
        moment.duration(duration).asSeconds() *
        conference.data.costPerHour /
        3600;
      // TODO: dev only
      // this.props.conferenceActions.updateGeneralData(joinedAux);
    }
  };

  showPopup = (message, loading = false, modalType = null) => {
    this.setState({ isLoading: loading, modal: !loading });
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

  // In order to change stream sources we need to re-obtain medias
  // and re connect from peers with the new streams
  changeSources = () => {
    window.easyrtc.leaveRoom(this.state.domain.roomToJoin, function() {
      this.setState({ joined: null });
      this.connect(); //timeout 500ms?
    });
    window.easyrtc.hangupAll();
  };

  sendWakeUp = target => {
    window.easyrtc.sendPeerMessage(
      target,
      conferenceConsts.WAKE_UP_MESSAGE_TYPE,
      {},
      () => {},
      () => {
        alert("Failed to sendWakeUp");
      }
    );
  };

  switchCamera = () => {
    rtcHelper.switchCamera();
  };

  switchMic = () => {
    rtcHelper.switchMic();
  };

  finishCall = () => {
    rtcHelper.closeConference();
    this.setState({ redirectHome: true });
  };

  shareRoomWithContact = () => {
    this.setState({ shareRoom: true });
  };

  openFullScreen = evt => {
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

  // Permissions
  cancelPermissionChecker = () => {
    clearInterval(this.state.permissions_interval_checker);
  };

  permissionInterval = () => {
    try {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        if (devices.some(device => device.label !== "")) {
          this.cancelPermissionChecker();
          let getAudioGen = rtcHelper.getAudioSourceList();
          let getVideoGen = rtcHelper.getVideoSourceList();
          let getOutputGen = rtcHelper.getAudioSinkList();

          // Get Audio source list
          getAudioGen
            .next()
            .value.then(data => {
              this.setState({
                selectedAudioDevice: data.selectedAudioDevice,
                audioDevices: data.audioDevices
              });
            })
            .catch(e => alert("Could not get audio devices: " + e));

          // Get video source list
          getVideoGen
            .next()
            .value.then(data => {
              this.setState({
                selectedVideoDevice: data.selectedVideoDevice,
                videoDevices: data.videoDevices,
                cameraEnabled: data.cameraEnabled
              });
            })
            .catch(e => alert("Could not get video devices: " + e));

          // Get output source list
          getOutputGen
            .next()
            .value.then(data => {
              this.setState({
                audioOutputDevices: data.audioOutputDevices,
                selectedAudioOutputDevice: data.selectedAudioOutputDevice
              });
            })
            .catch(e => alert("Could not get output devices: " + e));
        }
      });
    } catch (err) {
      this.cancelPermissionChecker();
    }
  };

  // Conference logic
  initConference = () => {
    console.log("Detect browser: " + rtcHelper.detectBrowser());
    let browser = rtcHelper.detectBrowser();
    if (browser === "chrome") {
      this.permissions_interval_checker = setInterval(
        this.permissionInterval,
        1000
      );
      this.setState({
        permissions_interval_checker: this.permissions_interval_checker
      });
    }

    this.intervalId = setInterval(this.clockInterval, 1000);
    rtcHelper.appInit(
      this.props.conference.domain.server,
      this.props.roomName,
      localStorage["username"]
    );

    //rtcHelper.initializeEasyRTC(this.state.domain.server);

    let getAudioGen = rtcHelper.getAudioSourceList();
    let getVideoGen = rtcHelper.getVideoSourceList();
    let getOutputGen = rtcHelper.getAudioSinkList();

    // Get Audio source list
    getAudioGen
      .next()
      .value.then(data => {
        this.setState({
          selectedAudioDevice: data.selectedAudioDevice,
          audioDevices: data.audioDevices
        });
      })
      .catch(e => alert("Could not get audio devices: " + e));

    // Get video source list
    getVideoGen
      .next()
      .value.then(data => {
        this.setState({
          selectedVideoDevice: data.selectedVideoDevice,
          videoDevices: data.videoDevices,
          cameraEnabled: data.cameraEnabled
        });
      })
      .catch(e => alert("Could not get video devices: " + e));

    // Get output source list
    getOutputGen
      .next()
      .value.then(data => {
        this.setState({
          audioOutputDevices: data.audioOutputDevices,
          selectedAudioOutputDevice: data.selectedAudioOutputDevice
        });
      })
      .catch(e => alert("Could not get output devices: " + e));
  };

  // Share screen features
  // --- Screen sharing tests ---
  // #1: <script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script> in order to add a helper js
  // #2: Users must download chrome extension: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

  stopShareScreen = () => {
    window.easyrtc.closeLocalStream(
      conferenceConsts.SCREEN_SHARING_STREAM_NAME
    );
    this.setState({ sharingScreen: false });
    this.setState({ userScreen: null });
    this.switchCamera();
    if (this.state.userMedia) {
      window.easyrtc.setVideoObjectSrc(
        this.selfVideoElement,
        this.state.userMedia
      );
    }
    this.setFullScreenVideo();
    console.log("Fabricio");
    console.log(this.state.userMedia);
    this.sendLocalStream(this.state.userMedia.streamName);
  };

  sendLocalStream = streamName => {
    for (let i = 0; i < this.state.sharingWithMe.length; i++) {
      window.easyrtc.addStreamToCall(
        this.state.sharingWithMe[i].id,
        streamName,
        function() {
          console.log("Stream accepted: " + streamName);
        }
      );
    }
  };

  shareScreen = () => {
    if (this.state.sharingScreen) {
      this.stopShareScreen();
    } else {
      window.getScreenId((error, sourceId, screen_constraints) => {
        // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
        // sourceId == null || 'string' || 'firefox'
        debugger;
        navigator.getUserMedia =
          navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
        navigator.getUserMedia(
          screen_constraints,
          stream => {
            debugger;
            rtcHelper.turnOffCamera();
            let selfVideo = document.getElementById("self-video-div");
            window.easyrtc.setVideoObjectSrc(selfVideo, stream);
            // share this "MediaStream" object using RTCPeerConnection API
          },
          function(error) {
            console.error(error);
          }
        );
      });

      /*window.getScreenId((error, sourceId, screen_constraints) => {
        if (error || !sourceId) {
          //TODO: add a notification
          alert(
            "Failed to get screen, make sure plugin is installed. https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk"
          );
        } else {
          var _ = this;
          navigator.getUserMedia(
            screen_constraints,
            stream => {
              // register screen stream and send it to all existing peers.
              window.easyrtc.register3rdPartyLocalMediaStream(
                stream,
                conferenceConsts.SCREEN_SHARING_STREAM_NAME
              );
              this.setState({ sharingScreen: true });

              rtcHelper.turnOffCamera();
              this.setState({ userScreen: stream });
              window.easyrtc.setVideoObjectSrc(this.selfVideoElement, stream);

              stream.oninactive = () => {
                if (stream.oninactive) {
                  stream.oninactive = undefined;
                  _.stopShareScreen();
                }
              };
              _.sendLocalStream(conferenceConsts.SCREEN_SHARING_STREAM_NAME);
            },
            error => console.error(error)
          );
        }
      });*/
    }
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

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
    let domain =
      localStorage.getItem("conference") != null
        ? JSON.parse(localStorage.getItem("conference")).domain
        : null;
    this.setState({ domain });

    if (domain) {
      authenticateToken(domain.token).then(response => {
        response.json().then(
          data => {
            if (response.status === 200) {
              if (data.costPerHour) {
                data.costPerHour = parseFloat(data.costPerHour);
              }
              data.date = new Date();
              this.props.conferenceActions.updateGeneralData(data);
              this.initConference();
            } else {
              this.invalidConference(data);
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
    clearInterval(this.intervalId);
    this.cancelPermissionChecker();
    rtcHelper.closeConference();
  }

  render() {
    const { conference, peers, chat, chatActions } = this.props;
    const { redirectHome, room } = this.state;

    if (redirectHome) {
      return <Redirect to={"/home/" + room} />;
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
        let browser = rtcHelper.detectBrowser();
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

      let modalContent = (
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
    return (
      <div className="Conference">
        <NotificationSystem ref="notificationSystem" />
        <video muted className="videoBackground" id="video-selected" />
        <Modal
          className={{
            base: "loadingModal"
          }}
          isOpen={this.state.modal || conference.loading}
        >
          {modalContent}
        </Modal>
        <InvitePeoplePopup
          isOpen={this.state.shareRoom}
          onCloseModal={() => this.setState({ shareRoom: false })}
        />
        {peers.length > 0 && <div className="conferenceHeader" />}
        <img alt="" className="conferenceLogo" src={ConferenceLogo} />
        {conference.data && (
          <Header
            durationCall={conference.data.duration}
            unreadMessages={chat.unreadMessages}
            openChat={chatActions.swithVisible.bind(null)}
            cost={conference.data.cost}
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
                <video
                  id="self-video-div"
                  muted
                  className={
                    this.state.selectedUser === "me"
                      ? "selfVideo selected"
                      : "selfVideo"
                  }
                />
              </div>
            </div>
            {peers.map(user => {
              return (
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
              );
            })}
          </div>
        </div>
        <Footer
          onCameraClick={rtcHelper.switchCamera.bind(null)}
          onMicClick={rtcHelper.switchMic.bind(null)}
          onShareClick={this.shareRoomWithContact}
          onShareScreenClick={this.shareScreen}
          shareScreenEnabled={this.state.sharingScreen}
          cameraEnabled={conference.cameraEnabled}
          micEnabled={conference.micEnabled}
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
