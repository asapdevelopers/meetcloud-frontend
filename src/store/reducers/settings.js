import * as settingsActions from "../../constants/actions/settingsActions";

function settingsReducer(state = [], { type, payload }) {
  switch (type) {
    case settingsActions.SETTINGS_CHANGE_LANGUAGE: {
      return {
        ...state,
        language: payload.value
      };
    }
    case settingsActions.SETTINGS_AUDIO_DEVICE_SELECTED: {
      localStorage.setItem("selectedAudioDeviceId", payload.deviceId);
      return {
        ...state,
        audioDeviceSelected: payload
      };
    }
    case settingsActions.SETTINGS_AUDIO_DEVICES_LIST: {
      return {
        ...state,
        audioDevicesList: payload
      };
    }
    case settingsActions.SETTINGS_VIDEO_DEVICE_SELECTED: {
      localStorage.setItem("selectedVideoDeviceId", payload.deviceId);
      return {
        ...state,
        videoDeviceSelected: payload
      };
    }
    case settingsActions.SETTINGS_VIDEO_DEVICES_LIST: {
      return {
        ...state,
        videoDevicesList: payload
      };
    }

    case settingsActions.SETTINGS_AUDIO_DEVICE_SINK_SELECTED: {
      localStorage.setItem("selectedAudioOutputDeviceId", payload.deviceId);
      return {
        ...state,
        audioDeviceSinkSelected: payload
      };
    }
    case settingsActions.SETTINGS_AUDIO_DEVICES_SINK_LIST: {
      return {
        ...state,
        audioDevicesSinkList: payload
      };
    }
    default:
      return state;
  }
}

export default settingsReducer;
