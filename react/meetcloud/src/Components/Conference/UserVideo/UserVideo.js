import React, { Component } from "react";
import PropTypes from "prop-types";
import "./UserVideo.css";

class UserVideo extends Component {
  render() {
    const { user, selected } = this.props;
    let video = "";
    if (user.hasVideo) {
      video = (
        <video
          className={selected ? "videoContainer selected" : "videoContainer"}
          key={"u-" + user.callerEasyrtcid}
          id={"u-" + user.callerEasyrtcid}
        />
      );
    }
    if (user.screen) {
      video = (
        <video
          className={selected ? "videoContainer selected" : "videoContainer"}
          key={"us-" + user.callerEasyrtcid}
          id={"us-" + user.callerEasyrtcid}
        />
      );
    }
    return (
      <div>
        <span className="videoName">{user.username}</span>
        {video}
      </div>
    );
  }
}

UserVideo.propTypes = {
  selected: PropTypes.bool
};

export default UserVideo;
