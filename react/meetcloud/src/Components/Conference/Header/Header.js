import React, {Component} from 'react';
import CallButton from '../CallButton/CallButton'
import './Header.css';


class Header extends Component {
  render() {
    return (
      <div className="Header">
        <div className="icons row right-xs">
          <CallButton icon="Money"/>
          <CallButton icon="Settings"/>
          <CallButton icon="Chat"/>
        </div>
      </div>
    )
  }
}
export default Header;
