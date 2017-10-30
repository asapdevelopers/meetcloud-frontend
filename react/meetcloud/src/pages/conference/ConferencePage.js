import React, { Component } from "react";
import moment from "moment";
import logo from "../../assets/logo.png";
import "./ConferencePage.css";
import { getBackgroundImage } from "../../Services/helpers/general";
import { authenticateDomain } from "../../Services/conference/conferenceApi";
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

  render() {

    return (
      <div className="ConferencePage">
          hola
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  conference:state.conference,
  settings: state.settings
});

const mapDispatchToProps = dispatch => ({
  authActions: bindActionCreators(AuthActions, dispatch),
  conferenceACtions:bindActionCreators(ConferenceActions, dispatch),
  settingsActions: bindActionCreators(SettingsActions, dispatch)
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConferencePage)
);
