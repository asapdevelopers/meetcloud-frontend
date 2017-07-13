import React, {Component} from 'react';
import './Conference.css';
class Conference extends Component {

  constructor(props) {
    super(props);
    this.state = {
      roomName: "",
      userName: ""
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div>
      Conference
      </div>
    )
  }
}

export default Conference;
