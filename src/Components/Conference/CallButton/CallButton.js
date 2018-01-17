import React from "react";
import PropTypes from "prop-types";
import "./CallButton.css";

import Camera from "../../../assets/images/Camera.png";
import CameraDisabled from "../../../assets/images/CameraDisabled.png";
import Mic from "../../../assets/images/Mic.png";
import MicDisabled from "../../../assets/images/MicDisabled.png";
import ShareScreen from "../../../assets/images/ShareScreen.png";
import ShareScreenDisabled from "../../../assets/images/ShareScreenDisabled.png";
import Money from "../../../assets/images/Money.png";
import Settings from "../../../assets/images/Settings.png";
import Chat from "../../../assets/images/Chat.png";
import Invite from "../../../assets/images/Invite.png";
import HangUp from "../../../assets/images/HangUp.png";

import VideoCamera from "../../../assets/images/camera1.png";
import Input from "../../../assets/images/input.png";
import Output from "../../../assets/images/Output.png";

const ICONS = {
  Camera,
  CameraDisabled,
  Mic,
  MicDisabled,
  ShareScreen,
  ShareScreenDisabled,
  Money,
  Settings,
  Chat,
  Invite,
  HangUp,
  VideoCamera,
  Input,
  Output
};

const CallButton = ({ onClick, icon, alert }) => {
  let alertIcon = "";
  if (alert) {
    alertIcon = <div className="alert" />;
  }
  return (
    <div aria-hidden role="button" className="roundedButton" onClick={onClick}>
      {alertIcon}
      <img alt={icon} className="buttonIcon" src={ICONS[icon]} />
    </div>
  );
};

CallButton.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.string.isRequired,
  alert: PropTypes.number
};

CallButton.defaultProps = {
  alert: 0,
  onClick() {}
};

export default CallButton;
