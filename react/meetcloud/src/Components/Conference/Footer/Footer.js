import React, {Component} from 'react';
import CallButton from '../CallButton/CallButton'
import './Footer.css';
import PropTypes from 'prop-types';


class Footer extends Component {
  render() {
    const {cameraEnabled, micEnabled} = this.props;
    let cameraIcon = cameraEnabled? 'Camera': 'CameraDisabled';
    let micIcon = micEnabled? 'Mic': 'MicDisabled';
    return (
      <div className="footer">
        <div className="footer-line"></div>
        <div className="icons row center-xs">
          <CallButton icon="ShareScreen" />
          <CallButton icon={cameraIcon} onClick={this.props.onCameraClick}/>
          <CallButton icon={micIcon}/>
          <CallButton icon="Invite" onClick={this.props.onShareClick}/>
          <CallButton icon="HangUp"/>
        </div>
      </div>
    )
  }
}

Footer.propTypes = {
  cameraEnabeled: PropTypes.bool,
  micEnabled: PropTypes.bool,
  onCameraClick: PropTypes.func,
  onShareClick: PropTypes.func,
  onShareScreenClick: PropTypes.func,
  onMicClick: PropTypes.func,
  onHangUpClick: PropTypes.func
}

export default Footer;
