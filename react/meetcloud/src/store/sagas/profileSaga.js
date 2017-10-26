import { call, put, takeLatest } from 'redux-saga/effects';
import * as profileActions from '../../constants/actions/profileActions';
import { fetchJSON, handleError } from './utils';
import { api } from '../../configuration';

function* getProfile() {
    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        const profileData = yield call(fetchJSON, api.profile.getProfile, options);
        yield put({ type: profileActions.PROFILE_GET_DATA_SUCCESS, payload: profileData });
    } catch (error) {
        let message = handleError(error.status);
        yield put({ type: profileActions.PROFILE_GET_DATA_FAILURE, payload: message });
    }
}

function* ProfileSaga() {
    yield takeLatest(profileActions.PROFILE_GET_DATA, getProfile);
}

export default ProfileSaga;