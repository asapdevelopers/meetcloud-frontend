import React, {Component} from 'react';
import './Chat.css';
import PropTypes from 'prop-types';
import CloseIcon from 'react-icons/lib/md/close';
import SendIcon from 'react-icons/lib/md/send';
import Linkify from 'react-linkify'

class Chat extends Component {

  constructor(props) {
    super(props);
    this.state = {
      msg: ""
    };
  }

  sendMessage = (event) => {
    if (event) {
      event.preventDefault();
    }
    console.log(this.state.msg);
    if (this.state.msg) {
      this.props.onSendMessage(this.state.msg)
      this.setState({msg: ""});
    }
  }

  render() {
    let messages = this.props.messages;
    let chats = "";
    if (messages.length === 0) {
      chats = (
        <span className="no-messages">No messages</span>
      )
    }
    let chatBox = "";
    if (this.props.opened) {
      chatBox = (
        <div className="chat-box">
          <div className="chat-title">
            <span>Chat</span>
            <div className="icon-close" onClick={this.props.onCloseChat}>
              <CloseIcon/>
            </div>
          </div>
          {chats}
          <div className="chatContainer">
          <ol className="chat">

            {messages.map(message => {
              if (message.source === "Me") {
                return <li className="self">
                  <div key={message.date} className="msg">
                    <p className="author">
                      Me
                      <time>{message.date.format("LT")}</time>
                    </p>
                    <p><Linkify>{message.msg}</Linkify></p>
                  </div>
                </li>
              } else {
                return (
                  <li className="other">
                    <div className="msg">
                      <p className="author">
                        {message.source}
                        <time>{message.date.format("LT")}</time>
                      </p>
                      <p><Linkify>{message.msg}</Linkify></p>
                    </div>
                  </li>
                )
              }
            })}
          </ol>
          </div>
          <form onSubmit= {(event) => this.sendMessage(event)}>
            <input className="textarea" type="text" placeholder="Type here!" value={this.state.msg} onChange={(event) => this.setState({msg: event.target.value})}/>
          </form>
          <div className="icon-send" onClick={this.sendMessage}><SendIcon/>
          </div>
        </div>
      )
    }

    return (
      <div>{chatBox}
      </div>
    )
  }
}

Chat.propTypes = {
  opened: PropTypes.bool
}

export default Chat;
