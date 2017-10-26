import { call, put, takeLatest } from 'redux-saga/effects';
import * as videoActions from '../../constants/actions/videoActions';
import { fetchJSON, handleError } from './utils';
import { api } from '../../configuration';

function* list() {
    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    try {
        const { count, next, page_size, previous, results } = yield call(fetchJSON, api.videos.list, options);
        yield put({ type: videoActions.VIDEO_GET_LIST_SUCCESS, payload: { count, next, page_size, previous, results } });
    } catch (error) {
        let message = handleError(error.status);
        yield put({ type: videoActions.VIDEO_GET_LIST_FAILURE, payload: message });
    }
}

function* upload({ payload: { id, file } }) {
    var data = new FormData()
    data.append('file', file)
    const options = {
        method: 'POST',        
        headers: {},
        body: data
    };

    try {
        console.log("Options", options);
        const upload = yield call(fetchJSON, api.videos.upload({ pk: id }), options);
        yield put({ type: videoActions.VIDEO_UPLOAD_SUCCESS, payload: {} });
    } catch (error) {
        let message = handleError(error.status);
        yield put({ type: videoActions.VIDEO_UPLOAD_FAILURE, payload: message });
    }
}

function* VideosSaga() {
    yield [
        takeLatest(videoActions.VIDEO_GET_LIST, list),
        takeLatest(videoActions.VIDEO_UPLOAD, upload)
    ]
}

export default VideosSaga;