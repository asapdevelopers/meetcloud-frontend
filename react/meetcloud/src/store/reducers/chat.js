import * as chatActions from "../../constants/actions/chatActions";

function chatReducer(state = [], { type, payload }) {
  switch (type) {
    case chatActions.CHAT_SWITCH_VISIBLE: {
      return { ...state, visible: !state.visible };
    }
    case chatActions.CHAT_ADD_MESSAGE: {
      return { ...state, messages:
          state.messages.push(payload)
       };
    }
    default:
      return state;
  }
}

export default chatReducer;
