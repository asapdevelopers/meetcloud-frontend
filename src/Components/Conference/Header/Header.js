import React from "react";
import NumberFormat from "react-number-format";
import ReactTooltip from "react-tooltip";
import CallButton from "../CallButton/CallButton";
import "./Header.css";

const Header = ({
  cost,
  durationCall,
  openSettings,
  openChat,
  unreadMessages
}) => (
  <div className="Header">
    <ReactTooltip id="global" place="bottom" type="light" effect="solid">
      <NumberFormat
        value={cost}
        decimalPrecision={2}
        thousandSeparator
        prefix="$"
        displayType="text"
      />
    </ReactTooltip>
    <div className="icons row right-xs">
      <label className="items">Call duration: {durationCall}</label>
      <div className="icons-top">
        <a data-tip data-for="global">
          <CallButton className="items" icon="Money" data-tip="ReactTooltip" />
        </a>
        <CallButton className="items" icon="Settings" onClick={openSettings} />
        <CallButton
          className="items"
          icon="Chat"
          onClick={openChat}
          alert={unreadMessages}
        />
      </div>
    </div>
  </div>
);
export default Header;
