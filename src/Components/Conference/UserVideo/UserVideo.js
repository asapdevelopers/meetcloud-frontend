import React, { Component } from "react";
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
  return (
    <div>
      <span className="videoName">{user.username}</span>
      {video}
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
