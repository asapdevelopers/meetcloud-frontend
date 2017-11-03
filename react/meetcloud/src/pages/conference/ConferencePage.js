import React, { Component } from "react";
import moment from "moment";
import logo from "../../assets/logo.png";
import "./ConferencePage.css";
import { getBackgroundImage } from "../../Services/helpers/general";
import { authenticateDomain } from "../../Services/conference/conferenceApi";
import * as RTCHelper2 from "../../Services/helpers/easyapp";
// Components
import Conference from "../../Components/Conference/Conference";
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
      roomName: "",
      selectedUser: null
    };
  }

  componentDidMount() {
    this.setState({roomName: this.props.match.params.roomName});
  }

  render() {
    const { conference } = this.props;
    const { roomName } = this.state;
    return (
      <div className="conferencePage">
        <Conference conference={conference} peers={conference.peers} roomName={roomName}/>
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
