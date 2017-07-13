import React, {Component} from 'react';
import logo from '../../assets/logo.png';
import './Home.css';
import {config} from '../../config'
import {getBackgroundImage} from '../../Services/helpers/general'

const domain = window.location.hostname;

class Home extends Component {

  constructor(props) {
    super(props);
    let roomName = "";
    if ((this.props.match.url.match(/\//g) || []).length == 1) {
      roomName = this.props.match.url.substring(1, this.props.match.url.length);
    }
    this.state = {
      roomName: roomName,
      userName: "",
      bingImage: false,
      backgroundImage: '/assets/background.jpg'
    };
    console.log(props)
  }

  componentDidMount() {
    getBackgroundImage().then((response) => {
      debugger;
      if (response.status === 200) {

        response.json().then((res) => {
          debugger;
          this.setState({
            bingImage: true,
            backgroundImage: config.backgroundImagePrefix + res.images[0].url
          })
        })
      }
    })
  }

  connect = (event) => {
    console.log("Connect " + this.state.userName + " - " + this.state.roomName);
  };

  render() {
    var sectionStyle = {
      background: `url("${this.state.backgroundImage}") no-repeat center`,
      'background-size': 'cover'
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
                    <button className="button" onClick={(event) => this.connect(event)}>Connect</button>
                  </div>
                </div>
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
