import React, { Component } from "react";
import PropTypes from "prop-types";
import differenceInSeconds from "date-fns/difference_in_seconds";
import distanceInWordsStrict from "date-fns/distance_in_words_strict";
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
      const diffSeconds = differenceInSeconds(new Date(), conference.data.date);
      const duration = distanceInWordsStrict(new Date(), conference.data.date); // format(durationAux, "HH:mm:ss");
      const cost = diffSeconds / 60 / 60 * conference.data.costPerHour;
      this.setState({ cost, duration });
    }
  };

  render() {
    const { openSettings, openChat, unreadMessages } = this.props;
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
          <span className="items">Call duration: {duration}</span>
          <div className="icons-top">
            <span data-tip data-for="global">
              <CallButton
                className="items"
                icon="Money"
                data-tip="ReactTooltip"
              />
            </span>
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

Header.propTypes = {
  conference: PropTypes.object.isRequired,
  openSettings: PropTypes.func.isRequired,
  openChat: PropTypes.func.isRequired,
  unreadMessages: PropTypes.number
};

Header.defaultProps = {
  unreadMessages: 0
};
export default Header;
