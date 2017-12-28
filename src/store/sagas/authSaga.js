import { call, put, takeLatest } from 'redux-saga/effects';
import * as authActions from '../../constants/actions/authActions';
import { fetchJSON, handleError } from './utils';
import { api } from '../../configuration';

function* authorize({ payload: { email, password } }) {
    const options = {
        body: JSON.stringify({ email, password }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        const { token, user, expiration } = yield call(fetchJSON, api.userauth.authenticate, options);
        yield put({ type: authActions.AUTH_REQUEST_SUCCESS, payload: { token, user, expiration } });
        localStorage.setItem('auth', JSON.stringify({ token, user, expiration }));
    } catch (error) {
        let message = handleError(error.status);
        yield put({ type: authActions.AUTH_REQUEST_FAILURE, payload: message });
        localStorage.removeItem('token');
    }
}

function* register({ payload: { username, password, first_name, last_name } }) {
    const options = {
        body: JSON.stringify({ email: username, password, first_name, last_name }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        yield call(fetchJSON, api.userauth.register, options);
        yield put({ type: authActions.AUTH_REGISTER_SUCCESS });
    } catch (error) {
        console.log("Error", error);
        let message;
        switch (error.status) {
            case 500:
                message = 'Internal Server Error';
                break;
            case 400:
                message = 'Validation error';
                break;
            default:
                message = 'Something went wrong';
        }
        yield put({ type: authActions.AUTH_REGISTER_FAILURE, payload: message });
    }
}

function* AuthSaga() {
    yield [
        takeLatest(authActions.AUTH_REQUEST, authorize),
        takeLatest(authActions.AUTH_REGISTER, register)
    ]
}

export default AuthSaga;