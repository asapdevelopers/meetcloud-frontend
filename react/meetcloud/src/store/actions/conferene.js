import * as conferenceActions from "../../constants/actions/conferenceActions";

//conference data
export const addConferenceData = (conferenceData) => ({
  type: conferenceActions.CONFERENCE_ADD_DATA,
  payload: conferenceData
});

//peers
export const addPeer = () => ({
  type: conferenceActions.CONFERENCE_PEERS_ADD,
  payload: {}
});

export const removePeer = () => ({
  type: conferenceActions.CONFERENCE_PEERS_REMOVE,
  payload: {}
});
