import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import videos from './videos';
import auth from './auth';
import settings from './settings';
import profile from './profile';

//import localize reducer
import { localeReducer } from 'react-localize-redux';

const rootReducer = combineReducers({
    videos,
    auth,
    settings,
    profile,
    locale: localeReducer,
    routing: routerReducer
});

export default rootReducer;