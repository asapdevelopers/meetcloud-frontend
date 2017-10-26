import * as videoActions from '../../constants/actions/videoActions';

function videosReducer(state = [], { type, payload }) {
    switch (type) {
        case videoActions.VIDEO_GET_LIST_SUCCESS:
            {
                return {...state, count: payload.count, next: payload.next, page_size: payload.page_size, previous: payload.previous, results: payload.results};
            }
        case videoActions.VIDEO_GET_LIST_FAILURE:
            {
                return state;
            }
        case videoActions.VIDEO_ADD_LIKE:
            {
                let index = state.findIndex(x => x.id === payload.id);
                if (index !== -1) {
                    return [
                        ...state.slice(0, index),
                        { ...state[index], likes: state[index].likes + 1 },
                        ...state.slice(index + 1)
                    ]
                } else {
                    return state;
                }
            }
        default:
            return state;
    }
}

export default videosReducer;