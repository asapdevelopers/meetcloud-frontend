import React, { Component } from "react";
import "./SettingsPopup.css";
import Modal from "react-modal";
import { inviteToConference } from "../../../Services/conference/conferenceApi";
import CloseIcon from "../../Icons/Close";
import CallButton from '../CallButton/CallButton';

export default class SettingsPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { isOpen, onCloseModal } = this.props;
    return (
      <Modal isOpen={true} className="openSettings">
        <div className="share-text">Settings</div>
        <div onClick={onCloseModal}>
          <CloseIcon className="closeIcon" />
        </div>
        <div className="w-100 d-flex flex-column align-items-center justify-content-center">

          <div className="d-flex flex-row align-items-center justify-content-center">
            <CallButton className="settingsIcon" icon="VideoCamera"/>
            <select>
              <option value="Camera1">Camera 1</option>
              <option value="Camera2">Camera 2</option>
              <option value="Camera3">Camera 3</option>
            </select>
          </div>

          <div className="d-flex flex-row align-items-center justify-content-center">
            <CallButton className="settingsIcon mt-1" icon="Input"/>
            <select>
              <option value="Input1">Input 1</option>
              <option value="Input2">Input 2</option>
              <option value="Input3">Input 3</option>
            </select>
          </div>

          <div className="d-flex flex-row align-items-center justify-content-center">
            <CallButton className="settingsIcon mt-1" icon="Output"/>
            <select>
              <option value="Output1">Output 1</option>
              <option value="Output2">Output 2</option>
              <option value="Output3">Output 3</option>
            </select>
          </div>

          <div className="w-100 mt-5 buttonsSettings d-flex flex-row align-items-center justify-content-center">
            <button className="secondarybutton mr-2" type="submit">
              Cancel
            </button>
            <button className="button" type="submit">
              Save
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}
