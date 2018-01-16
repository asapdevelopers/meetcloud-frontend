import React from "react";
import PropTypes from "prop-types";
import CallButton from "../CallButton/CallButton";
import "./Footer.css";

const Footer = ({
  cameraEnabled,
  micEnabled,
  shareScreenEnabled,
  onHangUp,
  onShareClick,
  onMicClick,
  onCameraClick,
  onShareScreenClick
}) => {
  const cameraIcon = cameraEnabled ? "Camera" : "CameraDisabled";
  const micIcon = micEnabled ? "Mic" : "MicDisabled";
  const ssIcon = shareScreenEnabled ? "ShareScreen" : "ShareScreenDisabled";

  return (
    <div className="footer">
      <div className="footer-line" />
      <div className="icons row center-xs">
        <CallButton icon={ssIcon} onClick={onShareScreenClick} />
        <CallButton icon={cameraIcon} onClick={onCameraClick} />
        <CallButton icon={micIcon} onClick={onMicClick} />
        <CallButton icon="Invite" onClick={onShareClick} />
        <CallButton icon="HangUp" onClick={onHangUp} />
      </div>
    </div>
  );
};

Footer.propTypes = {
  cameraEnabled: PropTypes.bool,
  shareScreenEnabled: PropTypes.bool,
  micEnabled: PropTypes.bool,
  onCameraClick: PropTypes.func.isRequired,
  onShareClick: PropTypes.func.isRequired,
  onShareScreenClick: PropTypes.func.isRequired,
  onMicClick: PropTypes.func.isRequired,
  onHangUpClick: PropTypes.func.isRequired,
  onHangUp: PropTypes.func.isRequired
};

export default Footer;
