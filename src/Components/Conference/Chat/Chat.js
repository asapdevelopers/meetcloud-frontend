import PropTypes from "prop-types";
import CloseIcon from "react-icons/lib/md/close";
import MdTagFaces from "react-icons/lib/md/tag-faces";
import React, { Component } from "react";
import { Picker } from "emoji-mart";
// import Linkify from 'linkifyjs/react';
import { emojify } from "react-emojione";
import "./Chat.css";

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: "",
      showEmojis: false,
      emojiOptions: {
        convertShortnames: true,
        convertUnicode: true,
        convertAscii: true,
        style: {
          height: 26,
          margin: 4
        }
      }
    };
  }

  addEmoji = event => {
    this.setState({
      msg: this.state.msg + event.colons
    });
    this.setState({ showEmojis: false });
  };

  formatMesasge = msg => "a";

  sendMessage = event => {
    if (event) {
      event.preventDefault();
    }
    if (this.state.msg) {
      this.props.onSendMessage(this.state.msg);
      this.setState({ msg: "" });
    }
  };

  render() {
    const { messages, opened } = this.props;
    const { showEmojis } = this.state;
    return (
      <div>
        {opened && (
          <div className="chat-box">
            <div className="icon-close" onClick={this.props.onCloseChat}>
              <CloseIcon />
            </div>
            {messages.length === 0 && (
              <span className="no-messages">No messages</span>
            )}
            <div className="chatContainer">
              <ol className="chat">
                {messages.map(message => {
                  if (message.source === "Me") {
                    return (
                      <li className="self">
                        <div key={message.date} className="msg">
                          <p className="author">
                            Me
                            <time>{message.date.format("LT")}</time>
                          </p>
                          <p>
                            {/* <Linkify> */}
                            {emojify(message.msg, this.state.emojiOptions)}
                          </p>
                        </div>
                      </li>
                    );
                  }
                  if (message.source === "New connection") {
                    return (
                      <span className="newConnect">
                        New connection: {message.msg}{" "}
                      </span>
                    );
                  }
                  if (message.source === "Lost connection") {
                    return (
                      <span className="lostConnect">
                        Lost connection: {message.msg}{" "}
                      </span>
                    );
                  }
                  if (
                    message.source !== "Lost connection" &&
                    message.source !== "New connection" &&
                    message.source !== "Me connection"
                  ) {
                    return (
                      <li className="other">
                        <div className="msg">
                          <p className="author">
                            {message.source}
                            <time>{message.date.format("LT")}</time>
                          </p>
                          <p>
                            {/* <Linkify> */}
                            {emojify(message.msg)}
                          </p>
                        </div>
                      </li>
                    );
                  }
                  return null;
                })}
              </ol>
            </div>
            {showEmojis && (
              <Picker
                style={{
                  position: "absolute",
                  bottom: "60px"
                }}
                perLine={9}
                emojiSize={25}
                title="Pick your emoji…"
                emoji="point_up"
                set="emojione"
                sheetSize={32}
                onClick={this.addEmoji}
              />
            )}
            <form onSubmit={event => this.sendMessage(event)}>
              <input
                className="textarea"
                type="text"
                placeholder="Type here!"
                value={this.state.msg}
                onChange={event => this.setState({ msg: event.target.value })}
                onFocus={() => this.setState({ showEmojis: false })}
              />
            </form>
            <div
              className="icon-send"
              onClick={() =>
                this.setState({
                  showEmojis: !this.state.showEmojis
                })
              }
            >
              <MdTagFaces />
            </div>
          </div>
        )}
      </div>
    );
  }
}

Chat.propTypes = {
  opened: PropTypes.bool
};

export default Chat;
