import React, { Component } from "react";
import logo from "../../assets/logo.png";
import "./HomePage.css";
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
import { withRouter } from "react-router-dom";
// Components
import ContactUs from "../../Components/ContactUs/ContactUs";

const domain = window.location.hostname;

class HomePage extends Component {
  constructor(props) {
    super(props);
    let roomName = (this.props.match.params && this.props.match.params.roomName)? this.props.match.params.roomName : "";
    let background =
      localStorage["background"] !== undefined
        ? localStorage["background"]
        : "/assets/background.jpg";

    //State
    this.state = {
      roomName,
      userName: "",
      backgroundImage: background,
      redirect: false,
      showModal: true
    };
  }

  componentDidMount() {
    getBackgroundImage().then(response => {
      if (response.status === 200) {
        response.json().then(res => {
          if (localStorage["background"] !== res.url) {
            localStorage["background"] = res.url;
            this.setState({ backgroundImage: res.url });
          }
        });
      }
    });
  }

  init = data => {
    let domain = {
      token: data.token,
      id: data.id,
      name: data.name,
      friendlyName: data.friendlyName,
      server: data.server,
      roomName: data.room,
      roomToJoin: `${data.name}.${data.room}`,
      username: this.state.userName
    };
    localStorage["conference"] = JSON.stringify({ domain });
    localStorage["username"] = this.state.userName;
    this.props.conferenceActions.addConferenceData(domain);
    this.setState({ redirect: true });
    this.props.history.push("/conference/" + domain.roomName);
  };

  connect = event => {
    event.preventDefault();
    authenticateDomain(domain, this.state.roomName).then(
      response => {
        response.json().then(data => {
          this.init(data);
        });
      },
      error => alert(error)
    );
  };

  render() {

    var sectionStyle = {
      background: `url("${this.state.backgroundImage}") no-repeat center`,
      backgroundSize: "cover"
    };

    return (
      <div className="HomePage background" style={sectionStyle}>
        <div className="App">
          <div className="App-header">
            <div className="row">
              <div className="col-xs-12">
                <div className="box">
                  <img src={logo} className="App-logo" alt="logo" />
                </div>
              </div>
            </div>
            <div className="row center-xs form">
              <div className="col col-responsive">
                <form onSubmit={event => this.connect(event)}>
                  <div className="row">
                    <span className="text">Room name</span>
                  </div>
                  <div className="row">
                    <input
                      className="inputText"
                      type="text"
                      value={this.state.roomName}
                      onChange={event =>
                        this.setState({ roomName: event.target.value })}
                    />
                  </div>
                  <div className="row">
                    <span className="text">Your name</span>
                  </div>
                  <div className="row">
                    <input
                      className="inputText"
                      type="text"
                      value={this.state.userName}
                      onChange={event =>
                        this.setState({ userName: event.target.value })}
                    />
                  </div>
                  <div className="row center-xs">
                    <div className="col full">
                      <button type="submit" className="button">
                        Connect
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <ContactUs />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  settings: state.settings,
  confernece: state.conference
});

const mapDispatchToProps = dispatch => ({
  authActions: bindActionCreators(AuthActions, dispatch),
  conferenceActions: bindActionCreators(ConferenceActions, dispatch),
  settingsActions: bindActionCreators(SettingsActions, dispatch)
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomePage)
);
