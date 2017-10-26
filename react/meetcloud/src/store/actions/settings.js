import * as settingsActions from '../../constants/actions/settingsActions';

export const changeLanguage = (value) => ({ type: settingsActions.SETTINGS_CHANGE_LANGUAGE, payload:{value}});