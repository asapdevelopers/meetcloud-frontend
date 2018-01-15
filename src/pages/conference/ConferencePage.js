import React, { Component } from "react";
// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
// Router
import { withRouter } from "react-router-dom";
// Components
import Conference from "../../Components/Conference/Conference";
// Actions
import * as AuthActions from "../../store/actions/auth";
import * as SettingsActions from "../../store/actions/settings";
import * as ConferenceActions from "../../store/actions/conferene";
import * as ChatActions from "../../store/actions/chat";
import "./ConferencePage.css";

class ConferencePage extends Component {
  constructor(props) {
    super(props);
    const roomName =
      this.props.match.params && this.props.match.params.roomName
        ? this.props.match.params.roomName
        : "";
    this.state = {
      roomName,
      selectedUser: null
    };
  }

  render() {
    const {
      conference,
      conferenceActions,
      chat,
      chatActions,
      settings,
      settingsActions
    } = this.props;
    const { roomName } = this.state;
    return (
      <div className="conferencePage">
        <Conference
          settings={settings}
          conference={conference}
          conferenceActions={conferenceActions}
          peers={conference.peers}
          roomName={roomName}
          chat={chat}
          chatActions={chatActions}
          settingsActions={settingsActions}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  conference: state.conference,
  settings: state.settings,
  chat: state.chat
});

const mapDispatchToProps = dispatch => ({
  authActions: bindActionCreators(AuthActions, dispatch),
  chatActions: bindActionCreators(ChatActions, dispatch),
  conferenceActions: bindActionCreators(ConferenceActions, dispatch),
  settingsActions: bindActionCreators(SettingsActions, dispatch)
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConferencePage)
);
