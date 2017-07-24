import React, {Component} from 'react';
import './CallButton.css';

import Call1 from '../../../assets/images/Call1.png';
import Call2 from '../../../assets/images/Call2.png';
import Call3 from '../../../assets/images/Call3.png';
import Call4 from '../../../assets/images/Call4.png';
import Call5 from '../../../assets/images/Call5.png';

class CallButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icon: this.props.icon
    }
  }

  render() {
    let icon = null;
    switch (this.state.icon) {
      case "Call1":
        icon = Call1;
        break;
      case "Call2":
        icon = Call2;
        break;
      case "Call3":
        icon = Call3;
        break;
      case "Call4":
        icon = Call4;
        break;
      case "Call5":
        icon = Call5;
        break;
      default:
        icon = Call1;
    }
    return (
      <div className="roundedButton">
        <img className="buttonIcon" src={icon}/>
      </div>
    )
  }
}
export default CallButton;
