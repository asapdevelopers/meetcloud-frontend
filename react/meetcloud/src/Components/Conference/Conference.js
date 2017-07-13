import React, {Component} from 'react';
import logo from '../../assets/logo.png';
import './Conference.css';
import {config} from '../../config'
import {getBackgroundImage} from '../../Services/helpers/general'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

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
