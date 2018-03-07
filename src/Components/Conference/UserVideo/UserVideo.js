import React from "react";
import PropTypes from "prop-types";
import "./UserVideo.css";

const UserVideo = ({ user, selected }) => {
  let video = "";
  if (user.hasVideo) {
    video = (
      <video
        className={
          selected ? "videoContainer selected mirror" : "videoContainer"
        }
        key={`u-${user.callerEasyrtcid}`}
        id={`u-${user.callerEasyrtcid}`}
      />
    );
  }
  if (user.hasScreen) {
    video = (
      <video
        className={selected ? "videoContainer selected" : "videoContainer"}
        key={`us-${user.callerEasyrtcid}`}
        id={`us-${user.callerEasyrtcid}`}
      />
    );
  }

  let stylesCamera = selected ? "videoContainer selected mirror" : "videoContainer";
  if(!user.hasVideo){
    stylesCamera += " hidden";
  }
  let stylesScreen = selected ? "videoContainer selected" : "videoContainer";
  if(!user.hasScreen){
    stylesScreen += " hidden";
  }

  return (
    <div>
      <span className="videoName">{user.username}</span>
      {/* User video (camera) */}
      <video
        className={stylesCamera}
        key={`u-${user.callerEasyrtcid}`}
        id={`u-${user.callerEasyrtcid}`}
      />
      {/* User screen */}
      <video
        className={stylesScreen}
        key={`us-${user.callerEasyrtcid}`}
        id={`us-${user.callerEasyrtcid}`}
      />
      {/* video */}
    </div>
  );
};

UserVideo.propTypes = {
  selected: PropTypes.bool
};

UserVideo.defaultProps = {
  selected: false
};

export default UserVideo;
