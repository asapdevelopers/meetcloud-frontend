import React, {Component} from 'react';
import CallButton from '../CallButton/CallButton'
import './Footer.css';


class UserVideo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="footer">
        <div className="footer-line"></div>
        <div className="row center-xs">

          <CallButton icon="Call1"/>
          <CallButton icon="Call2"/>
          <CallButton icon="Call3"/>
          <CallButton icon="Call4"/>
          <CallButton icon="Call5"/>
        </div>
      </div>
    )
  }
}
export default UserVideo;
