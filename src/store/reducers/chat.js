import * as chatActions from "../../constants/actions/chatActions";
import moment from "moment";

function chatReducer(state = [], { type, payload }) {
  switch (type) {
    case chatActions.CHAT_SWITCH_VISIBLE: {
      return { ...state, visible: !state.visible };
    }
    case chatActions.CHAT_ADD_MESSAGE: {
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            date: new moment(),
            msg: payload.msg,
            source: payload.source
          }
        ]
      };
    }
    case chatActions.CHAT_ADD_UNREAD:{
      return {
        ...state,
        unreadMessages: state.unreadMessages + 1
      };
    }
    case chatActions.CHAT_MARK_AS_READ:{
      return {
        ...state,
        unreadMessages: 0
      };
    }
    default:
      return state;
  }
}

export default chatReducer;