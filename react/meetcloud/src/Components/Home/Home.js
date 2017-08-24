import React, {Component} from 'react';
import logo from '../../assets/logo.png';
import './Home.css';
import {getBackgroundImage} from '../../Services/helpers/general'
import {authenticateDomain} from '../../Services/conference/conferenceApi'
import {Redirect} from 'react-router-dom'

const domain = window.location.hostname;

class Home extends Component {

  constructor(props) {
    super(props);
    let roomName = "";
    // if ((this.props.match.url.match(/\//g) || []).length === 1) {
    //   roomName = this.props.match.url.substring(1, this.props.match.url.length);
    // }

    if (props.match.params.roomName) {
      roomName = props.match.params.roomName;
    }

    let background = localStorage['background'] !== undefined
      ? localStorage['background']
      : '/assets/background.jpg';

    //State
    this.state = {
      roomName: roomName,
      userName: "",
      backgroundImage: background,
      redirect: false
    };
  }

  componentDidMount() {
    getBackgroundImage().then((response) => {
      if (response.status === 200) {
        response.json().then((res) => {
          if (localStorage['background'] !== res.url) {
            localStorage['background'] = res.url;
            this.setState({backgroundImage: res.url});
          }
        })
      }
    })
  }

  init = (data) => {
    let domain = {
      token: data.token,
      id: data.id,
      name: data.name,
      friendlyName: data.friendlyName,
      server: data.server,
      roomName: data.room,
      roomToJoin: `${data.name}.${data.room}`
    }
    localStorage['conference'] = JSON.stringify({domain});
    localStorage['username'] = this.state.userName;
    this.setState({redirect: true})
    this.props.history.push("/conference/" + domain.roomName);
  }

  connect = (event) => {
    event.preventDefault();
    authenticateDomain(domain, this.state.roomName).then((response) => {
      response.json().then((data) => {
        this.init(data);
      })
    }, (error) => alert(error));
  };

  render() {
    const {redirect} = this.state;

    if (redirect) {
      return <Redirect to='/conference'/>;
    }

    var sectionStyle = {
      background: `url("${this.state.backgroundImage}") no-repeat center`,
      backgroundSize: 'cover'
    };

    return (
      <div className="background" style={sectionStyle}>
        <div className="App">
          <div className="App-header">
            <div className="row">
              <div className="col-xs-12">
                <div className="box">
                  <img src={logo} className="App-logo" alt="logo"/>
                </div>
              </div>
            </div>
            <div className="row center-xs form">
                <div className="col col-responsive">
                    <form onSubmit={(event) => this.connect(event)}>
                      <div className="row">
                        <span className="text">Room name</span>
                      </div>
                      <div className="row">
                        <input className="inputText" type="text" value={this.state.roomName} onChange={(event) => this.setState({roomName: event.target.value})}></input>
                      </div>
                      <div className="row">
                        <span className="text">Your name</span>
                      </div>
                      <div className="row">
                        <input className="inputText" type="text" value={this.state.userName} onChange={(event) => this.setState({userName: event.target.value})}></input>
                      </div>
                      <div className="row center-xs">
                        <div className="col full">
                          <button type="submit" className="button">Connect</button>
                        </div>
                      </div>
                    </form>
                </div>
            </div>
          </div>
          <div className="App-footer">
            <div className="line"></div>
            <div className="row contactUs">
              <div className="col-xs-1"></div>
              <div className="col-xs-2">
                <span>CONTACT US</span>
              </div>
              <div className="col-xs-3">
                <div className="row">
                  <span>Sillicon Valley</span>
                </div>
                <div className="row">
                  <span>1701 N. California Blvd. Walnut Creek, CA 94596</span>
                </div>
                <div className="row">
                  <span>Tel: (+415) 967 3920</span>
                </div>
              </div>
              <div className="col-xs-3">
                <div className="row">
                  <span>Montevideo, Uruguay</span>
                </div>
                <div className="row">
                  <span>Av. 8 de octubre 2323, Apt. 1205</span>
                </div>
                <div className="row">
                  <span>Tel: (+598) 2408 1699</span>
                </div>
              </div>
              <div className="col-xs-3">
                <div className="row">
                  <span>Santiago, Chile</span>
                </div>
                <div className="row">
                  <span>Los Abedules 3085, Of. 201, Vitacura</span>
                </div>
                <div className="row">
                  <span>Tel: (+56) 9 9643 0806</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Home;
