import React, {Component} from 'react';
import logo from '../../logo.png';
import './Home.css';
import {getBackgroundImage} from '../../Services/helpers/general'

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      roomName: "",
      userName: "",
      backgroundImage: ""
    };

  }

  componentDidMount() {
    let image = getBackgroundImage();
    this.setState({backgroundImage: "https://www.bing.com/az/hprichbg/rb/GhostCrab_EN-US12586461381_1920x1080.jpg"});
  }

  render() {
    var background = this.state.backgroundImage;
    var sectionStyle = {
      background: `url("${background}") no-repeat center`
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
                  <span className="text">Select a room</span>
                </div>
                <div className="row">
                  <input className="inputText" type="text"></input>
                </div>
                <div className="row">
                  <span className="text">Your name</span>
                </div>
                <div className="row">
                  <input className="inputText" type="text"></input>
                </div>
                <div className="row center-xs">
                  <div className="col full">
                    <button className="button">Connect</button>
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
