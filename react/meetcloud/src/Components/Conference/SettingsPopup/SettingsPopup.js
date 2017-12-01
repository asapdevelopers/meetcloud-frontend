import React, { Component } from "react";
import "./SettingsPopup.css";
import Modal from "react-modal";
import { inviteToConference } from "../../../Services/conference/conferenceApi";
import CloseIcon from "../../Icons/Close";

export default class SettingsPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { isOpen, onCloseModal } = this.props;
    return (
      <Modal isOpen={true} className="share-dialog">
        <div className="share-text">Settings</div>
        <div onClick={onCloseModal}>
          <CloseIcon className="closeIcon" />
        </div>
        <div>
          <img src="../../../assets/images/camera1.png"/>
          <select></select>
        </div>
      </Modal>
    );
  }
}
