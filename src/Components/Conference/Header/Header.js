import React, { Component } from "react";
import moment from "moment";
import NumberFormat from "react-number-format";
import ReactTooltip from "react-tooltip";
import CallButton from "../CallButton/CallButton";
import "./Header.css";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: 0,
      cost: 0
    };
  }

  componentDidMount() {
    // Interval that updates the call clock
    this.intervalId = setInterval(this.clockInterval, 1000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // To keep timer counter updated
  clockInterval = () => {
    const { conference } = this.props;
    if (conference.data) {
      const now = new moment();
      const durationAux = now.diff(conference.data.date);
      let duration = moment.utc(durationAux).format("HH:mm:ss");
      let cost =
        moment.duration(durationAux).asSeconds() *
        conference.data.costPerHour /
        3600;
      this.setState({ cost, duration });
    }
  };

  render() {
    const { conference, openSettings, openChat, unreadMessages } = this.props;
    const { cost, duration } = this.state;
    return (
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
          <label className="items">Call duration: {duration}</label>
          <div className="icons-top">
            <a data-tip data-for="global">
              <CallButton
                className="items"
                icon="Money"
                data-tip="ReactTooltip"
              />
            </a>
            <CallButton
              className="items"
              icon="Settings"
              onClick={openSettings}
            />
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
  }
}
export default Header;
