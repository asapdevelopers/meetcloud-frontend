import React, {Component} from "react";
import "./SettingsPopup.css";
import Modal from "react-modal";
import CloseIcon from "../../Icons/Close";
import CallButton from '../CallButton/CallButton';

export default class SettingsPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAudioInput: {},
      selectedAudioOutput: {},
      selectedVideoInput: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.settings) {
      this.setState({selectedAudioInput: nextProps.settings.audioDeviceSelected.deviceId});
      this.setState({selectedAudioOutput: nextProps.settings.audioDeviceSinkSelected.deviceId});
      this.setState({selectedVideoInput: nextProps.settings.videoDeviceSelected.deviceId});
    }
  }

  saveSettings = () => {
    debugger;
    if (this.props.settings.audioDevicesList) {
      let selectedAudioInput = this
        .props
        .settings
        .audioDevicesList
        .find(x => x.deviceId === this.state.selectedAudioInput);
      this
        .props
        .onAudioInputSelected(selectedAudioInput);
    }

    if (this.props.settings.videoDevicesList) {
      let selectedVideoInput = this
        .props
        .settings
        .videoDevicesList
        .find(x => x.deviceId === this.state.selectedVideoInput);
      this
        .props
        .onVideoInputSelected(selectedVideoInput);
    }

    if (this.props.settings.audioDevicesSinkList) {
      let selectedAudioOutput = this
        .props
        .settings
        .audioDevicesSinkList
        .find(x => x.deviceId === this.state.selectedAudioOutput);
      this
        .props
        .onAudioOutputSelected(selectedAudioOutput);
    }
    this.props.onSaveSettings();
    this
      .props
      .onCloseModal();
  }

  render() {
    const {onCloseModal} = this.props;
    return (
      <Modal isOpen={this.props.isOpen} className="openSettings">
        <div className="share-text">Settings</div>
        <div onClick={onCloseModal}>
          <CloseIcon className="closeIcon"/>
        </div>
        <div
          className="w-100 d-flex flex-column align-items-center justify-content-center">

          <div className="d-flex flex-row align-items-center justify-content-center">
            <CallButton className="settingsIcon" icon="VideoCamera"/>
            <select
              value={this.state.selectedVideoInput}
              onChange={(e) => {
              this.setState({selectedVideoInput: e.target.value})
            }}>
              {this
                .props
                .settings
                .videoDevicesList
                .map((item) => <option value={item.deviceId}>{item.label}</option>)}
            </select>
          </div>

          <div className="d-flex flex-row align-items-center justify-content-center">
            <CallButton className="settingsIcon mt-1" icon="Input"/>
            <select
              value={this.state.selectedAudioInput}
              onChange={(e) => {
              this.setState({selectedAudioInput: e.target.value})
            }}>
              {this
                .props
                .settings
                .audioDevicesList
                .map((item) => <option value={item.deviceId}>{item.label}</option>)}
            </select>
          </div>

          <div className="d-flex flex-row align-items-center justify-content-center">
            <CallButton className="settingsIcon mt-1" icon="Output"/>
            <select
              value={this.state.selectedAudioOutput}
              onChange={(e) => {
              this.setState({selectedAudioOutput: e.target.value})
            }}>
              {this
                .props
                .settings
                .audioDevicesSinkList
                .map((item) => <option value={item.deviceId}>{item.label}</option>)}
            </select>
          </div>

          <div
            className="w-100 mt-5 buttonsSettings d-flex flex-row align-items-center justify-content-center">
            <button className="secondarybutton mr-2" onClick={onCloseModal}>
              Cancel
            </button>
            <button className="button" onClick={this.saveSettings}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}