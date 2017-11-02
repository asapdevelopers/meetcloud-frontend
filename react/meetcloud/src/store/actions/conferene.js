import * as conferenceActions from "../../constants/actions/conferenceActions";

//conference data
export const addConferenceData = conferenceData => ({
  type: conferenceActions.CONFERENCE_ADD_DATA,
  payload: conferenceData
});

//peers
export const updatePeers = peerList => ({
  type: conferenceActions.CONFERENCE_PEERS_UPDATE_LIST,
  payload: peerList
});

export const updatePeerSettings = id => ({
  type: conferenceActions.CONFERENCE_PEERS_UPDATE_PEER_SETTINGS,
  payload: id
});
