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

export const updateOtherPeople = list => ({
  type: conferenceActions.CONFERENCE_UPDATE_OTHER_PEOPLE,
  payload: list
});


// media
export const switchCamera = () => ({
  type:conferenceActions.CONFERENCE_SWITCH_CAMERA
})

export const switchMic = () => ({
  type:conferenceActions.CONFERENCE_SWITCH_MIC
})