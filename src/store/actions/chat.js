import * as chatActions from "../../constants/actions/chatActions";

// conference data
export const swithVisible = () => ({
  type: chatActions.CHAT_SWITCH_VISIBLE
});

// peers
export const addMessage = (message, userType) => ({
  type: chatActions.CHAT_ADD_MESSAGE,
  payload: { message, userType }
});

export const clearChat = () => ({
  type: chatActions.CHAT_CLEAR
});
