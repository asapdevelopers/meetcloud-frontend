import React, {Component} from 'react';
import CallButton from '../CallButton/CallButton'
import './Footer.css';


class Footer extends Component {
  render() {
    return (
      <div className="footer">
        <div className="footer-line"></div>
        <div className="icons row center-xs">
          <CallButton icon="Call1"/>
          <CallButton icon="Call2" onClick={this.props.onCameraClick}/>
          <CallButton icon="Call3"/>
          <CallButton icon="Call4" onClick={this.props.onShareClick}/>
          <CallButton icon="Call5"/>
        </div>
      </div>
    )
  }
}
export default Footer;
