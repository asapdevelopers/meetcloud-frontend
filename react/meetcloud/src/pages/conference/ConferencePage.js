import React, { Component } from "react";
import "./ConferencePage.css";
// Components
import Conference from "../../Components/Conference/Conference";
// Actions
import * as AuthActions from "../../store/actions/auth";
import * as SettingsActions from "../../store/actions/settings";
import * as ConferenceActions from "../../store/actions/conferene";
import * as ChatActions from "../../store/actions/chat";
// Redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
//Router
import { withRouter } from "react-router-dom";

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
    const { conference, conferenceActions, chat, chatActions } = this.props;
    const { roomName } = this.state;
    return (
      <div className="conferencePage">
        <Conference conference={conference} conferenceActions={conferenceActions} peers={conference.peers} roomName={roomName} chat={chat} chatActions={chatActions}/>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  conference: state.conference,
  settings: state.settings,
  chat:state.chat
});

const mapDispatchToProps = dispatch => ({
  authActions: bindActionCreators(AuthActions, dispatch),
  chatActions:bindActionCreators(ChatActions, dispatch),
  conferenceActions: bindActionCreators(ConferenceActions, dispatch),
  settingsActions: bindActionCreators(SettingsActions, dispatch)
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConferencePage)
);
