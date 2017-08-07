import React, {Component} from 'react';
import CallButton from '../CallButton/CallButton'
import './Header.css';

class Header extends Component {
  render() {
    return (
      <div className="Header">
        <div className="icons row right-xs">
          <label className="items">Call duration: {this.props.durationCall}</label>
          <CallButton className="items" icon="Money"/>
          <CallButton className="items" icon="Settings"/>
          <CallButton className="items" icon="Chat"/>
        </div>
      </div>
    )
  }
}
export default Header;
