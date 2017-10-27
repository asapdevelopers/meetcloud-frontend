import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import videos from './videos';
import auth from './auth';
import settings from './settings';
import profile from './profile';

const rootReducer = combineReducers({
    videos,
    auth,
    settings,
    profile,
    routing: routerReducer
});

export default rootReducer;