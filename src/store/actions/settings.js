import * as settingsActions from "../../constants/actions/settingsActions";
// language
export const changeLanguage = value => ({
  type: settingsActions.SETTINGS_CHANGE_LANGUAGE,
  payload: {
    value
  }
});
// devices
export const audioDevicesList = value => ({
  type: settingsActions.SETTINGS_AUDIO_DEVICES_LIST,
  payload: value
});
export const audioDeviceSelected = value => ({
  type: settingsActions.SETTINGS_AUDIO_DEVICE_SELECTED,
  payload: value
});
export const audioDevicesSinkList = value => ({
  type: settingsActions.SETTINGS_AUDIO_DEVICES_SINK_LIST,
  payload: value
});
export const audioDeviceSinkSelected = value => ({
  type: settingsActions.SETTINGS_AUDIO_DEVICE_SINK_SELECTED,
  payload: value
});
export const videoDevicesList = value => ({
  type: settingsActions.SETTINGS_VIDEO_DEVICES_LIST,
  payload: value
});
export const videoDevicesSelected = value => ({
  type: settingsActions.SETTINGS_VIDEO_DEVICE_SELECTED,
  payload: value
});
