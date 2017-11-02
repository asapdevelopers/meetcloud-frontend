import * as conferenceActions from "../../constants/actions/conferenceActions";

function conferenceReducer(state = [], { type, payload }) {
  switch (type) {
    case conferenceActions.CONFERENCE_PEERS_UPDATE_LIST: {
      let peers = Object.values(payload);
      return { ...state, peers };
    }
    case conferenceActions.CONFERENCE_PEERS_UPDATE_PEER_SETTINGS: {
      let index = state.peers.findIndex(x => x.easyrtcid === payload);
      if (index !== -1) {
        return {
          ...state,
          peers: [
            //TODO: verify that it has video and audio
            ...state.peers.slice(0, index),
            {
              ...state.peers[index],
              hasVideo: true,//window.easyrtc.haveVideoTrack(payload),
              hasAudio: true//window.easyrtc.haveAudioTrack(payload)
            },
            ...state.peers.slice(index + 1)
          ]
        };
      } else {
        return state;
      }
    }
    case conferenceActions.CONFERENCE_ADD_DATA: {
      return {
        ...state,
        domain: payload
      };
    }
    default:
      return state;
  }
}

export default conferenceReducer;
