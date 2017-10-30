import React, { Component } from "react";
import moment from "moment";
import logo from "../../assets/logo.png";
import "./ConferencePage.css";
import { getBackgroundImage } from "../../Services/helpers/general";
import { authenticateDomain } from "../../Services/conference/conferenceApi";
import * as RTCHelper from "../../Services/helpers/easyrtcHelper";
// Actions
import * as AuthActions from "../../store/actions/auth";
import * as SettingsActions from "../../store/actions/settings";
import * as ConferenceActions from "../../store/actions/conferene";
// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
//Router
import { withRouter, Redirect } from "react-router-dom";

class ConferencePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: null
    };
  }

  onJoinSucess = () => {
    debugger;
    console.log("join sucess");
  };
  onJoinError = () => {
    debugger;
    console.log("join error");
  };

  onConnectSucess = () => {
    debugger;
    console.log("connect succees");
  };
  onConnectError = () => {
    debugger;
    console.log("connect error");
  };

  componentDidMount() {
    RTCHelper.initializeEasyRTC(this.props.conference.domain.server);
    RTCHelper.createConnection(
      this.props.conference.domain.roomToJoin,
      document.getElementById("self-video-div"),
      this.onJoinSucess,
      this.onJoinError,
      this.onConnectSucess,
      this.onConnectError
    );
  }

  render() {
    return (
      <div className="ConferencePage">
        Conference
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
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  conference: state.conference,
  settings: state.settings
});

const mapDispatchToProps = dispatch => ({
  authActions: bindActionCreators(AuthActions, dispatch),
  conferenceACtions: bindActionCreators(ConferenceActions, dispatch),
  settingsActions: bindActionCreators(SettingsActions, dispatch)
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConferencePage)
);
