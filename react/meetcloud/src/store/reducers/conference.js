import * as conferenceActions from "../../constants/actions/conferenceActions";

function conferenceReducer(state = [], { type, payload }) {
  switch (type) {
    case conferenceActions.CONFERENCE_PEERS_UPDATE_LIST: {
      let peers = Object.values(payload);
      return { ...state, peers };
    }
    // Loading
    case conferenceActions.CONFERECE_SHOW_LOADING: {
      return { ...state, loading: true };
    }
    case conferenceActions.CONFERECE_HIDE_LOADING: {
      return { ...state, loading: false };
    }
    // Peers
    case conferenceActions.CONFERENCE_PEERS_ADD_PEER: {
      return {
        ...state,
        peers: [
          ...state.peers,
          {
            callerEasyrtcid: payload.callerEasyrtcid,
            stream: payload.stream,
            username: payload.username,
            hasVideo: true,
            hasAudio: true
          }
        ]
      };
    }
    case conferenceActions.CONFERENCE_PEERS_REMOVE_PEER: {
      return {
        ...state,
        peers: state.peers.filter(
          x => x.callerEasyrtcid !== payload.callerEasyrtcid
        )
      };
    }
    case conferenceActions.CONFERENCE_UPDATE_OTHER_PEOPLE: {
      let op = Object.values(payload);
      return {
        ...state,
        otherPeople: op
      };
    }
    case conferenceActions.CONFERENCE_ADD_DATA: {
      return {
        ...state,
        domain: payload
      };
    }
    // Media
    case conferenceActions.CONFERENCE_SWITCH_CAMERA: {
      return {
        ...state,
        cameraEnabled: !state.cameraEnabled
      };
    }
    case conferenceActions.CONFERECE_UPDATE_JOINED_DATA: {
      return {
        ...state,
        joinedData: payload
      };
    }
    case conferenceActions.CONFERECE_UPDATE_GENERAL_DATA: {
      return {
        ...state,
        data: payload
      };
    }
    case conferenceActions.CONFERENCE_SWITCH_MIC: {
      return {
        ...state,
        micEnabled: !state.micEnabled
      };
    }
    default:
      return state;
  }
}

export default conferenceReducer;
