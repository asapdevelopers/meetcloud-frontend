import React, {Component} from 'react';
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
      video = <video key={'u-' + user.id} className="videoContainer" id={'u-' + user.id}></video>
    }
    if (user.screen) {
      video = <video key={'us-' + user.id} className="videoContainer" id={'us-' + user.id}></video>
    }
    return (
      <div className={this.props.selected
        ? 'userVideo selected'
        : 'userVideo'}>
        <span className="videoName">{user.username}</span>
        {video}
      </div>
    )
  }
}
UserVideo.propTypes ={
    selected: React.PropTypes.bool
}
export default UserVideo;
