import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import CallButton from '../CallButton/CallButton';
import  NumberFormat from 'react-number-format';
import './Header.css';

class Header extends Component {
  render() {
    return (
      <div className="Header">
        <ReactTooltip id="global" place="bottom" type="light" effect="solid">
          <NumberFormat value={this.props.cost} decimalPrecision={2} thousandSeparator={true} prefix={'$'} displayType={'text'}/>          
        </ReactTooltip>
        <div className="icons row right-xs">
          <label className="items">Call duration: {this.props.durationCall}</label>
          <div className="icons-top">
            <a data-tip data-for='global'><CallButton className="items" icon="Money" data-tip="ReactTooltip"/></a>
            <CallButton className="items" icon="Settings"/>
            <CallButton className="items" icon="Chat" onClick={this.props.openChat} alert={this.props.unreadMessages}/>
          </div>
        </div>
      </div>
    )
  }
}
export default Header;
