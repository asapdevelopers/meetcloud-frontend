import React, {Component} from 'react';
import './Chat.css';
import PropTypes from 'prop-types';
import CloseIcon from 'react-icons/lib/md/close';
import MdTagFaces from 'react-icons/lib/md/tag-faces';
import {Picker, Emoji} from 'emoji-mart';
import Linkify from 'linkifyjs/react';
import {emojify} from 'react-emojione';

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

  addEmoji = (event) => {
    this.setState({
      msg: this.state.msg + event.colons
    });
    this.setState({showEmojis: false});
  }

  formatMesasge = (msg) => {
    return "a";
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
    let emojiPicker = "";
    if (this.state.showEmojis) {
      emojiPicker = (<Picker style={{
        position: 'absolute',
        bottom: '60px'
      }} perLine={9} emojiSize={27} title='Pick your emoji…' emoji='point_up' set='emojione' onClick={this.addEmoji}/>);
    }
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
                      <p>
                        <Linkify>{emojify(message.msg, this.state.emojiOptions)}</Linkify>
                      </p>
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
                        <p>
                          <Linkify>{emojify(message.msg)}</Linkify>
                        </p>
                      </div>
                    </li>
                  )
                }
              })}
            </ol>
          </div>
          {emojiPicker}
          <form onSubmit= {(event) => this.sendMessage(event)}>
            <input className="textarea" type="text" placeholder="Type here!" value={this.state.msg} onChange={(event) => this.setState({msg: event.target.value})} onFocus={() => this.setState({showEmojis: false})}/>
          </form>
          <div className="icon-send" onClick={() => this.setState({
            showEmojis: !this.state.showEmojis
          })}><MdTagFaces/>
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
