import * as conferenceActions from "../../constants/actions/conferenceActions";

//conference data
export const addConferenceData = conferenceData => ({
  type: conferenceActions.CONFERENCE_ADD_DATA,
  payload: conferenceData
});

export const updateGeneralData = data => ({
  type: conferenceActions.CONFERECE_UPDATE_GENERAL_DATA,
  payload: data
});

//peers
export const updatePeers = peerList => ({
  type: conferenceActions.CONFERENCE_PEERS_UPDATE_LIST,
  payload: peerList
});

export const updateOtherPeople = list => ({
  type: conferenceActions.CONFERENCE_UPDATE_OTHER_PEOPLE,
  payload: list
});

// media
export const switchCamera = () => ({
  type: conferenceActions.CONFERENCE_SWITCH_CAMERA
});

export const switchMic = () => ({
  type: conferenceActions.CONFERENCE_SWITCH_MIC
});
export const switchShare = () => ({
  type: conferenceActions.CONFERENCE_SWITCH_SHARE
});
export const addLocalStream = () => ({
  type: conferenceActions.CONFERENCE_ADD_LOCAL_STREAM
});
