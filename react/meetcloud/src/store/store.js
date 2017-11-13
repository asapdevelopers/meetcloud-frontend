import { createStore, applyMiddleware, compose } from "redux";
import { routerMiddleware } from "react-router-redux";
// history
import createHistory from "history/createBrowserHistory";
// saga
import createSagaMiddleware from "redux-saga";
import AuthSaga from "./sagas/authSaga";
// import root reducer
import rootReducer from "./reducers/index";
// i18n
//import {loadi18n} from "../i18n";

// create middlewares
const history = createHistory();
const sagaMiddleware = createSagaMiddleware();

const middleware = applyMiddleware(routerMiddleware(history), sagaMiddleware);

let authData = {};
if (localStorage.auth) {
  authData = JSON.parse(localStorage.auth);
}

let domainData = {};
if (localStorage.conference) {
  domainData = JSON.parse(localStorage.conference);
}

const defaultState = {
  auth: {
    token: authData.token,
    expiration: authData.expiration,
    user: authData.user,
    error: null
  },
  conference: {
    peers: [],
    domain: domainData.domain,
    cameraEnabled: true,
    micEnabled: true,
    joined: false,
    data: {
      duration: 0,
      date: new Date(),
      cost: 0
    }
  },
  chat: {
    visible: false,
    messages: [],
    unreadMessages: 0
  }
};

// Use Redux devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(middleware);

// Create the store
export const store = createStore(rootReducer, defaultState, enhancer);

// Run saga middleware
sagaMiddleware.run(AuthSaga);
