import Modal from "react-modal";
import React, { Component } from "react";
import "./InvitePeoplePopup.css";
import { inviteToConference } from "../../../Services/conference/conferenceApi";
import CloseIcon from "../../Icons/Close";

export default class InvitePeoplePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ""
    };
  }

  invitePeople = event => {
    const { email } = this.state;
    event.preventDefault();
    inviteToConference(email, window.location.href).then(
      response => {
        response.json().then(res => {
          // TODO: add notification

          /* this.addNotification(
            "Invitation",
            "Your invitation was sent",
            "success"
          ); */
          this.setState({ email: "" });
          this.props.onCloseModal();
        });
      },
      error => alert(error)
    );
  };

  render() {
    const { isOpen, onCloseModal } = this.props;
    return (
      <Modal isOpen={isOpen} className="share-dialog">
        <div className="share-text">Invite your friends to this room.</div>
        <div aria-hidden role="button" onClick={onCloseModal}>
          <CloseIcon className="closeIcon" />
        </div>
        <form onSubmit={event => this.invitePeople(event)}>
          <span className="share-email">Email :</span>
          <input
            className="inputText"
            type="text"
            value={this.state.email}
            onChange={event => this.setState({ email: event.target.value })}
          />
          <div className="share-text">
            <button className="button" type="submit">
              Invite
            </button>
          </div>
        </form>
      </Modal>
    );
  }
}
