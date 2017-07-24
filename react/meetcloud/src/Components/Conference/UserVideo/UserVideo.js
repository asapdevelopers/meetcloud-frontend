import React, {Component} from 'react';
import './UserVideo.css';

import * as rtcHelper from '../../../Services/helpers/easyrtcHelper'
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ReactSpinner from 'react-spinjs';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      selected: this.props.selected
    };
  }

  render() {
    let video = "";
    let user = this.state.user;
    if (user.hasVideo) {
      video = <video key={'u-' + user.id} className="videoContainer" id={'u-' + user.id}></video>
    }
    if (user.screen) {
      video = <video key={'us-' + user.id} className="videoContainer" id={'us-' + user.id}></video>
    }
    return (
      <div className="userVideo">
      <span className="videoName">{user.username}</span>
        {video}
      </div>
    )
  }
}
export default Footer;
