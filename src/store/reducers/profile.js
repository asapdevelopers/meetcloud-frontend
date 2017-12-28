import * as profileActions from '../../constants/actions/profileActions';

function profileReducer(state = [], { type, payload }) {
    switch (type) {
        case profileActions.PROFILE_GET_DATA_SUCCESS:
            {
                return payload;
            }
        case profileActions.PROFILE_GET_DATA_FAILURE:
            {
                return state;
            }
        default:
            return state;
    }
}

export default profileReducer;