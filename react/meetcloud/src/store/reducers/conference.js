import * as conferenceActions from "../../constants/actions/conferenceActions";

function conferenceReducer(state = [], { type, payload }) {
  switch (type) {
    case conferenceActions.CONFERENCE_PEERS_ADD: {
      let peers = state.peers;
      peers.push(payload);
      return { ...state, peers };
    }
    case conferenceActions.CONFERENCE_PEERS_REMOVE: {
      return {
        ...state,
        peers: state.peers.filter((item, index) => index !== payload.index)
      };
    }
    case conferenceActions.CONFERENCE_ADD_DATA:{
      return {
        ...state,
        domain: payload
      }
    }
    default:
      return state;
  }
}

export default conferenceReducer;
