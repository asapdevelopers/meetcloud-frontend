import * as settingsActions from '../../constants/actions/settingsActions';

function settingsReducer(state = [], { type, payload }) {
    switch (type) {
        case settingsActions.SETTINGS_CHANGE_LANGUAGE:
            {
                return {
                    language: payload.value
                }
            }
        default:
            return state;
    }
}

export default settingsReducer;