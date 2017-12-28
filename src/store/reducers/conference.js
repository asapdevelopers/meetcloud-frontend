import * as conferenceActions from "../../constants/actions/conferenceActions";
import * as conferenceConsts from "../../constants/conference";

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
      let newPeers = state.peers;
      let hasVideo = payload.stream.streamName === conferenceConsts.SCREEN_SHARING_STREAM_NAME? false : true;
      let hasScreen = payload.stream.streamName === conferenceConsts.SCREEN_SHARING_STREAM_NAME? true : false;
      // Is the peer new?
      let index = state.peers.findIndex(x => x.callerEasyrtcid === payload.callerEasyrtcid);
      // if the peer is already on the store, we update the hasVideo and hasScreen variables
      if (index !==-1 ){
        newPeers = [
          ...state.peers.slice(0, index),
          { ...state.peers[index], hasVideo, hasScreen },
          ...state.peers.slice(index + 1)
        ]
      }else{
        // if the peer is not on the store, we add it
        newPeers = [
          ...state.peers,
          {
            callerEasyrtcid: payload.callerEasyrtcid,
            stream: payload.stream,
            username: payload.username,
            hasVideo,
            hasAudio: true,
            hasScreen
          }
        ]
      }
      return {
        ...state,
        peers: newPeers
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
    case conferenceActions.CONFERENCE_ADD_LOCAL_STREAM: {
      return {
        ...state,
        localStream: payload
      };
    }
    case conferenceActions.CONFERENCE_REMOVE_LOCAL_STREAM: {
      return {
        ...state,
        localStream: {}
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
    case conferenceActions.CONFERENCE_SWITCH_SHARE: {
      return {
        ...state,
        sharingScreen: !state.sharingScreen
      };
    }
    default:
      return state;
  }
}

export default conferenceReducer;
