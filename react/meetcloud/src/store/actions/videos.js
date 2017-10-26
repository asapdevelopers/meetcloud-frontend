import * as videoActions from '../../constants/actions/videoActions';

export const list = () => ({ type: videoActions.VIDEO_GET_LIST, payload:{}});
export const upload = (id, file) => ({ type: videoActions.VIDEO_UPLOAD, payload:{id, file}});
export const like = id => ({ type: videoActions.VIDEO_ADD_LIKE, payload:{id} });
