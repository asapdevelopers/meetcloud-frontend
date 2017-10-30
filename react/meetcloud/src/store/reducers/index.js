import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import videos from './videos';
import auth from './auth';
import settings from './settings';
import profile from './profile';
import conference from './conference';

const rootReducer = combineReducers({
    videos,
    auth,
    settings,
    profile,
    conference,
    routing: routerReducer
});

export default rootReducer;