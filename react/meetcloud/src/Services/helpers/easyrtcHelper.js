import * as conferenceConsts from '../../Consts/conference';

const browser = require('detect-browser');

// private functions
function callEverybodyElse(roomName, otherPeople) {
    // so we're only called once.
    window.easyrtc.setRoomOccupantListener(null); 

    var list = [];
    var connectCount = 0;
    for(var easyrtcid in otherPeople) {
        list.push(easyrtcid);
    }
    //
    // Connect in reverse order. Latter arriving people are more likely to have
    // empty slots.
    //
    function establishConnection(position) {
        function callSuccess() {
            connectCount++;
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        function callFailure(errorCode, errorText) {
            easyrtc.showError(errorCode, errorText);
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        window-easyrtc.call(list[position], callSuccess, callFailure);

    }
    if( list.length > 0) {
        establishConnection(list.length-1);
    }
}

// 1. Establish the room connection
// 2. Establish the connection with the EasyRTC server
export function establishConnection(roomName, onJoinSuccess, onJoinError, onConnectSuccess, onConnectError) {
    window.easyrtc.setRoomOccupantListener(callEveryoneElse);
    window.easyrtc.joinRoom(roomName, {}, onJoinSuccess, onJoinError);
    window.easyrtc.connect(conferenceConsts.WEB_RTC_APP, onConnectSuccess, onConnectionError);
}

// Initialize
export function initializeEasyRTC(domainServer) {
    // Prevent reconnection because it gives a lot of issues, see manual calls to disconnect as well
    /*window.easyrtc.setSocketUrl(domainServer, {
        transports: ['websocket'],
        reconnection: false
    });*/
    window.easyrtc.enableDebug(conferenceConsts.DEBUG);
    window.easyrtc.setOnError(function(e) {
        // Prevent anoying pop up.
        console.log("error from easyrtc:", e)
    });

    window.easyrtc.setAutoInitUserMedia(false);

    // Enable audio and video medias. This can only be changed before connecting so careful.
    // These are used for calling and should be disabled if the media doesn't work otherwise connection
    // will be slower and won't properly work
    window.easyrtc.enableAudio(true);
    window.easyrtc.enableVideo(true);
    window.easyrtc.enableDataChannels(true);
    window.easyrtc.enableVideoReceive(true);
    window.easyrtc.enableAudioReceive(true);

    // Some defaults. The simply turn on/off
    window.easyrtc.enableCamera(true);
    window.easyrtc.enableMicrophone(false);
};

function performCall(easyrtcid) {
    window.easyrtc.call(
        easyrtcid,
        function(easyrtcid) { console.log("completed call to " + easyrtcid); },
        function(errorMessage) { console.log("err:" + errorMessage); },
        function(accepted, bywho) {
            console.log((accepted ? "accepted" : "rejected") + " by " + bywho);
        }
    );
}

export function* getAudioSourceList() {
    //var index = 0;
    var selectedAudioDevice = null;
    var audioDevices = []

    yield new Promise(resolve => {
        window.easyrtc.getAudioSourceList(function(audioList) {
            let savedAudioDeviceId = localStorage.getItem('selectedAudioDeviceId');

            for (var i = 0; i < audioList.length; i++) {
                let a = audioList[i];
                // Copy object because we can't modify the original one
                a = {
                    deviceId: a.deviceId,
                    label: a.label
                }
                if (!a.label) {
                    a.label = "Mic " + (i + 1);
                }
                if (savedAudioDeviceId === a.deviceId) {
                    selectedAudioDevice = a;
                }
                audioDevices.push(a);
            }
            if (audioDevices.length > 0 && !selectedAudioDevice) {
                selectedAudioDevice = audioDevices[0];
            }
            resolve({ selectedAudioDevice, audioDevices })
        })
    });
}

export function* getVideoSourceList() {
    var selectedVideoDevice = null;
    var videoDevices = []

    yield new Promise(resolve => {
        window.easyrtc.getVideoSourceList(function(videoList) {

            let savedVideoDeviceId = localStorage.getItem('selectedVideoDeviceId');

            for (var i = 0; i < videoList.length; i++) {
                let a = videoList[i];
                // Copy object because we can't modify the original one
                a = {
                    deviceId: a.deviceId,
                    label: a.label
                }

                if (!a.label) {
                    a.label = "Cam " + (i + 1);
                }

                if (savedVideoDeviceId === a.deviceId) {
                    selectedVideoDevice = a;
                }

                videoDevices.push(a);
            }
            if (videoDevices.length > 0 && !selectedVideoDevice) {
                selectedVideoDevice = videoDevices[0];
            }
            //TODO: check if camera is enabled
            let cameraEnabled = true;
            if (videoDevices.length === 0) {
                cameraEnabled = false;
            }
            resolve({ selectedVideoDevice, videoDevices, cameraEnabled })
        });
    });
}

export function* getAudioSinkList() {
    var audioOutputDevices = [];
    var selectedAudioOutputDevice = null;

    yield new Promise(resolve => {
        window.easyrtc.getAudioSinkList(function(outputList) {
            audioOutputDevices = [];

            let savedAudioOutputDeviceId = localStorage.getItem('selectedAudioOutputDeviceId');

            for (var i = 0; i < outputList.length; i++) {
                let a = outputList[i];
                // Copy object because we can't modify the original one
                a = {
                    deviceId: a.deviceId,
                    label: a.label
                }

                if (!a.label) {
                    a.label = "Audio Out " + (i + 1);
                }

                if (savedAudioOutputDeviceId === a.deviceId) {
                    selectedAudioOutputDevice = a;
                }

                audioOutputDevices.push(a);
            }
            if (audioOutputDevices.length > 0 && !selectedAudioOutputDevice) {
                selectedAudioOutputDevice = audioOutputDevices[0];
            }
        })
    });
}

export function detectBrowser() {
    if (browser) {
        return browser.name;
    } else {
        return "other"
    }
}

export function playSound(obj) {
    obj.play();
}