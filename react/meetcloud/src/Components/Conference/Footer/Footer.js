import React, {Component} from 'react';
import CallButton from '../CallButton/CallButton'
import './Footer.css';
import PropTypes from 'prop-types';


class Footer extends Component {
  render() {
    const {cameraEnabled, micEnabled, shareScreenEnabled, onHangUp, onShareClick,onMicClick, onCameraClick, onShareScreenClick } = this.props;
    let cameraIcon = cameraEnabled? 'Camera': 'CameraDisabled';
    let micIcon = micEnabled? 'Mic': 'MicDisabled';
    let ssIcon = shareScreenEnabled? 'ShareScreen': 'ShareScreenDisabled';
    return (
      <div className="footer">
        <div className="footer-line"></div>
        <div className="icons row center-xs">
          <CallButton icon={ssIcon} onClick={onShareScreenClick}/>
          <CallButton icon={cameraIcon} onClick={onCameraClick}/>
          <CallButton icon={micIcon} onClick={onMicClick}/>
          <CallButton icon="Invite" onClick={onShareClick}/>
          <CallButton icon="HangUp" onClick={onHangUp}/>
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
