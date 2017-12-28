import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import videos from './videos';
import auth from './auth';
import settings from './settings';
import profile from './profile';
import conference from './conference';
import chat from './chat';

const rootReducer = combineReducers({
    videos,
    auth,
    settings,
    profile,
    conference,
    chat,
    routing: routerReducer
});

export default rootReducer;