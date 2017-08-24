import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './UserVideo.css';

class UserVideo extends Component {
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
      video = <video className={this.props.selected
        ? 'videoContainer selected'
        : 'videoContainer'} key={'u-' + user.id} id={'u-' + user.id}></video>
    }
    if (user.screen) {
      video = <video className={this.props.selected
        ? 'videoContainer selected'
        : 'videoContainer'} key={'us-' + user.id} id={'us-' + user.id}></video>
    }
    return (
      <div >
        <span className="videoName">{user.username}</span>
        {video}
      </div>
    )
  }
}

UserVideo.propTypes = {
  selected: PropTypes.bool
}

export default UserVideo;
