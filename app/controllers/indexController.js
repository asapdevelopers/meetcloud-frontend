// About screen sharing:
// Plugin: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk
// Plugin docs: https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture
// Helper lib to communicate with plugin: https://cdn.webrtc-experiment.com/getScreenId.js

angular.module("app").controller("IndexController", [
  "$scope",
  "$rootScope",
  "$location",
  "$http",
  "$timeout",
  "$interval",
  "$q",
  "ngDialog",
  "debounce",
  '$modalStack',
  '$routeParams',
  'cfpLoadingBar',
  'localStorageService',
  function($scope, $rootScope, $location, $http, $timeout, $interval, $q, ngDialog, debounce, $modalStack, $routeParams, cfpLoadingBar, localStorageService) {

    var CHAT_MESSAGE_TYPE = 'chatMessage';
    var WAKE_UP_MESSAGE_TYPE = 'wakeUpMessage';
    var SCREEN_SHARING_STREAM_NAME = 'ssharing';

    var WAKE_UP_AUDIO = new Audio('/audios/wake_up.mp3');
    var JOINED_AUDIO = new Audio('/audios/joined.mp3');
    var LEFT_AUDIO = new Audio('/audios/left.mp3');
    var NEW_MESSAGE_AUDIO = new Audio('/audios/new_message.mp3');

    var domain = window.location.hostname;
    var selfVideoElement = document.getElementById("self-video-div");

    $scope.rtcBrowser = webrtcDetectedBrowser;

    $scope.room = $routeParams.room;
    $scope.domain = null;
    $scope.error = null;

    $scope.username = null;
    $scope.connected = null;
    $scope.joined = null;
    $scope.members = [];
    $scope.membersDict = {};

    $scope.messages = {
      message: '',
      list: []
    };

    $scope.mediaSourceWorking = null;
    $scope.sharingScreen = false;
    $scope.cameraEnabled = true; // Global camera setting, can be only changed while disconnected
    $scope.camera = true; // Turn on/off cam
    $scope.mic = true; // turn on/off mic
    $scope.sharingWithMe = [];
    $scope.sharingWithMeDict = {};
    $scope.pendingCallsDict = {};
    $scope.firstRoomListener = true;

    // The lists won't be reliable on all browsers, will mostly work on chrome
    // Since firefox allows devices selection on permission and for some reason doesn't show the device names
    // and in some cases not even the lists
    $scope.audioDevices = [];
    $scope.selectedAudioDevice = null;
    $scope.videoDevices = [];
    $scope.selectedVideoDevice = null;
    $scope.audioOutputDevices = [];
    $scope.selectedAudioOutputDevice = null;

    // Load some settings from local storage
    $scope.username = localStorageService.get('username') || null;
    $scope.cameraEnabled = localStorageService.get('cameraEnabled') != null
      ? localStorageService.get('cameraEnabled')
      : true;

    $http({
      method: 'POST',
      url: 'http://localhost:8000/auth/domain/',
      data: {
        'domain': domain,
        'room': $scope.room
      }
    }).then(function(data) {
      init(data);

    }, function(data) {
      var msg = data.data && data.data.message
        ? data.data.message
        : 'Unknown error';
      $scope.alertError(msg);
      $scope.error = msg;
    });

    // init all easyrtc related stuff once we have server info.

    var init = function(data) {

      var r = data.data;

      $scope.domain = {
        token: r.token,
        id: r.id,
        name: r.name,
        friendlyName: r.friendlyName,
        server: r.server,
        room: r.room

      }

      $scope.roomToJoin = $scope.domain.name + "." + $scope.domain.room;

      // Wrap easyrtc calls in a timeout so it works with angular digest
      var wrapCall = function(f) {

        return function() {
          var params = arguments;
          $timeout(function() {
            f.apply(f, params)
          }, 1);
        }
      }

      // Wrap sound calls in case we want global muting.
      var playSound = function(obj) {
        obj.play();
      }

      // Helper to allow setting audio output of an element
      // Currently only supported by chrome
      var setAudioOutput = function(element) {
        if (element.setSinkId && $scope.selectedAudioOutputDevice) {
          element.setSinkId($scope.selectedAudioOutputDevice.deviceId);
        }
      }

      var addMessage = function(msg, source) {
        $scope.messages.list.push({date: new moment(), msg: msg, source: source});

        $timeout(function() {
          // Scroll to bottom
          $('#messages-list-holder').scrollTop($('#messages-list-holder')[0].scrollHeight);
        });
      }

      easyrtc.setSocketUrl($scope.domain.server, {
        transports: ['websocket'],
        reconnection: false
      }); // Prevent reconnection because it gives a lot of issues, see manual calls to disconnect as well
      easyrtc.enableDebug(false);
      easyrtc.setOnError(function(e) {

        // Prevent anoying pop up.
        console.log("error from easyrtc:", e)
      })

      easyrtc.setAutoInitUserMedia(false);

      // Enable audio and video medias. This can only be changed before connecting so careful.
      // These are used for calling and should be disabled if the media doesn't work otherwise connection
      // will be slower and won't properly work
      easyrtc.enableAudio(true);
      easyrtc.enableVideo(true);
      easyrtc.enableDataChannels(true);
      easyrtc.enableVideoReceive(true);
      easyrtc.enableAudioReceive(true);

      // Some defaults. The simply turn on/off
      easyrtc.enableCamera(true);
      easyrtc.enableMicrophone(false);

      // Attempt to get sources list
      easyrtc.getAudioSourceList(function(audioList) {

        $scope.audioDevices = [];
        var savedAudioDeviceId = localStorageService.get('selectedAudioDeviceId') || null;

        for (var i = 0; i < audioList.length; i++) {
          var a = audioList[i];
          // Copy object because we can't modify the original one
          a = {
            deviceId: a.deviceId,
            label: a.label
          }

          if (!a.label) {
            a.label = "Mic " + (i + 1);
          }

          if (savedAudioDeviceId === a.deviceId) {
            $scope.selectedAudioDevice = a;
          }

          $scope.audioDevices.push(a);
        }
        if ($scope.audioDevices.length > 0 && !$scope.selectedAudioDevice) {
          $scope.selectedAudioDevice = $scope.audioDevices[0];
        }
      });
      easyrtc.getVideoSourceList(function(videoList) {
        $scope.videoDevices = [];

        var savedVideoDeviceId = localStorageService.get('selectedVideoDeviceId') || null;

        for (var i = 0; i < videoList.length; i++) {
          var a = videoList[i];
          // Copy object because we can't modify the original one
          a = {
            deviceId: a.deviceId,
            label: a.label
          }

          if (!a.label) {
            a.label = "Cam " + (i + 1);
          }

          if (savedVideoDeviceId === a.deviceId) {
            $scope.selectedVideoDevice = a;
          }

          $scope.videoDevices.push(a);
        }
        if ($scope.videoDevices.length > 0 && !$scope.selectedVideoDevice) {
          $scope.selectedVideoDevice = $scope.videoDevices[0];
        }
        if ($scope.videoDevices.length == 0) {
          $scope.cameraEnabled = false;
        }
      });

      // This method is not exposed by easyrtc by default, needs to be manually added
      // basically copying from getVideoSourceList
      easyrtc.getAudioSinkList(function(outputList) {
        $scope.audioOutputDevices = [];

        var savedAudioOutputDeviceId = localStorageService.get('selectedAudioOutputDeviceId') || null;

        for (var i = 0; i < outputList.length; i++) {
          var a = outputList[i];
          // Copy object because we can't modify the original one
          a = {
            deviceId: a.deviceId,
            label: a.label
          }

          if (!a.label) {
            a.label = "Audio Out " + (i + 1);
          }

          if (savedAudioOutputDeviceId === a.deviceId) {
            $scope.selectedAudioOutputDevice = a;
          }

          $scope.audioOutputDevices.push(a);
        }
        if ($scope.audioOutputDevices.length > 0 && !$scope.selectedAudioOutputDevice) {
          $scope.selectedAudioOutputDevice = $scope.audioOutputDevices[0];
        }
      });

      easyrtc.setDisconnectListener(function() {
        console.log("Disconected");
        if ($scope.connected) {
          easyrtc.disconnect(); // must call this otherwise manual reconnect is not possible
        }
        $scope.connected = null;
        $scope.joined = null;

        $scope.sharingWithMe = [];
        $scope.sharingWithMeDict = {};
        $scope.members = [];
        $scope.membersDict = {};
        $scope.pendingCallsDict = {};

        // If we had a stream close it
        if ($scope.mediaSourceWorking) {
          easyrtc.closeLocalStream($scope.mediaSourceWorking.streamName);
          $scope.mediaSourceWorking = null;
        }

        // same with screen sharing
        if ($scope.sharingScreen) {
          easyrtc.closeLocalStream(SCREEN_SHARING_STREAM_NAME);
          $scope.sharingScreen = false;
        }

        easyrtc.setVideoObjectSrc(selfVideoElement, ""); // Clear video src
        easyrtc._roomApiFields = undefined; //Clear this since easyrtc doesn't and causes some error log due to invalid room

        cfpLoadingBar.complete();

      });

      easyrtc.setPeerListener(wrapCall(function(easyrtcid, msgType, msgData, targeting) {
        console.log("setPeerListener");

        if (msgType == CHAT_MESSAGE_TYPE) {
          addMessage(msgData.msg, msgData.source);
          playSound(NEW_MESSAGE_AUDIO);
        } else if (msgType == WAKE_UP_MESSAGE_TYPE) {
          var exists = $scope.membersDict[easyrtcid];
          $scope.alertError((exists
            ? exists.username
            : 'Unknown') + " sent you a wake up!");
          playSound(WAKE_UP_AUDIO);
        }

      }));

      // Since we are only using 1 room at a time we don't need to check for room names.
      easyrtc.setRoomOccupantListener(wrapCall(function(roomName, occupants) {
        console.log('setRoomOccupantListener');

        var before = $scope.members.length;

        $scope.members = [];
        $scope.membersDict = occupants;

        for (k in occupants) {
          $scope.members.push(occupants[k]);

          // Call anyone that's not sharing with me.
          // and not pending. Need second check because this event sometimes is called multiple times
          // without an established call
          // and if we are not restarting sources since we are going to call afterwards.
          if (!$scope.firstRoomListener) {
            $scope.callOne(k);
          }
        }

        if (!$scope.firstRoomListener) {
          var after = $scope.members.length;
          if (after > before) {
            playSound(JOINED_AUDIO);
          } else if (after < before) {
            playSound(LEFT_AUDIO);
          }
        }
        $scope.firstRoomListener = false; // Need this flag so the first room call we don't call other users, avoiding call loops.

        // Make sure all users sharing with me still exist
        // otherwise kill their streams
        for (k in $scope.sharingWithMeDict) {
          if (!$scope.membersDict[k]) {
            killUser(k);
          }
        }

      }));

      $scope.disconnect = function() {
        cfpLoadingBar.start();
        easyrtc.disconnect();
      }

      // To keep timer counter updated
      var clockInterval = $interval(function() {
        if ($scope.joined) {

          // room fields might not be instantly available
          var roomCost = easyrtc.getRoomField($scope.joined.name, "roomCost");
          if (roomCost) {
            $scope.joined.created = moment(roomCost.createdDate);
            var now = new moment();
            $scope.joined.duration = new moment().startOf('day').seconds(now.diff($scope.joined.created, 'seconds')).format('H:mm:ss');
            $scope.joined.cost = roomCost.cost;
            $scope.joined.costPerHour = parseFloat(roomCost.costPerHour);
          }
        }
      }, 1000);

      // Very important to destroy interval, otherwise we end up stacking intervals
      $scope.$on('$destroy', function() {
        $interval.cancel(clockInterval);
      })

      $scope.connect = function() {

        var dfd = $q.defer();

        if (!$scope.username) {
          dfd.reject();
          return dfd.promise;
        }

        // Save on local storage selected settings
        localStorageService.set('username', $scope.username);
        if ($scope.selectedAudioDevice) {
          localStorageService.set('selectedAudioDeviceId', $scope.selectedAudioDevice.deviceId);
        }
        if ($scope.selectedVideoDevice) {
          localStorageService.set('selectedVideoDeviceId', $scope.selectedVideoDevice.deviceId);
        }
        if ($scope.selectedAudioOutputDevice) {
          localStorageService.set('selectedAudioOutputDeviceId', $scope.selectedAudioOutputDevice.deviceId);
        }
        localStorageService.set('cameraEnabled', $scope.cameraEnabled);

        var onconnect = wrapCall(function(id) {
          console.log("Connected", id);

          $scope.connected = id;

          var onjoin = function(roomName) {
            cfpLoadingBar.complete();
            console.log("Room joined", roomName);
            $scope.joined = {
              name: roomName,
              date: new moment(),
              created: null
            };

            easyrtc.sendPeerMessage({
              targetRoom: roomName
            }, CHAT_MESSAGE_TYPE, {
              msg: "Has joined.",
              source: $scope.username
            }, function() {}, function() {});

            dfd.resolve();
          }

          var onjoinerror = function(errorCode, errorText, roomName) {
            cfpLoadingBar.complete();
            console.error("failed to join room", errorText);
            $scope.joined = null;
            $scope.alertError("Failed to join.");
            $scope.disconnect();

            dfd.reject();

          }

          var mediaSuccess = function(obj) {

            $scope.mediaSourceWorking = obj;

            easyrtc.setVideoObjectSrc(selfVideoElement, obj);

            easyrtc.enableMicrophone($scope.mic);
            easyrtc.enableCamera($scope.camera);

            // join after we have media, if we are not already joined
            if (!$scope.joined) {
              console.log("going to join room");

              $scope.firstRoomListener = true;
              $scope.sharingWithMe = [];
              $scope.sharingWithMeDict = {};
              $scope.members = [];
              $scope.membersDict = {};
              $scope.pendingCallsDict = {};

              easyrtc.joinRoom($scope.roomToJoin, {}, onjoin, onjoinerror);
            } else {
              cfpLoadingBar.complete();
              dfd.resolve();
            }

          };

          var mediaError = function(a, b) {
            console.log("Failed to get media source first time, trying again: ", a, b);

            $scope.mediaSourceWorking = null;

            // On media error attempt to disable all media features
            // so we can still receive connections
            easyrtc.enableVideo(false);

            //try again with only audio
            easyrtc.initMediaSource(mediaSuccess, function() {
              cfpLoadingBar.complete();
              console.log("Failed to get media source a second time: ", a, b);

              $scope.alertError("Failed to get media.");
              $scope.disconnect();

              dfd.reject();

            });

          };

          // init media
          if (easyrtc.supportsGetUserMedia && easyrtc.supportsGetUserMedia()) {

            easyrtc.enableVideo($scope.cameraEnabled);
            $scope.camera = $scope.cameraEnabled;

            // Select sources
            if ($scope.selectedAudioDevice) {
              easyrtc.setAudioSource($scope.selectedAudioDevice.deviceId);
            }

            if ($scope.selectedVideoDevice) {
              easyrtc.setVideoSource($scope.selectedVideoDevice.deviceId);
            }

            easyrtc.initMediaSource(mediaSuccess, mediaError);
          } else {
            $scope.disconnect();
            $scope.alertError("Browser does not support media, please switch to a real browser like Google Chrome.");
            dfd.reject();
          }

        });

        var onconnecterror = wrapCall(function(e) {
          console.error("failed to connect", e);
          easyrtc.disconnect(); // so it doesn't try automatically after and re connecting is possible
          cfpLoadingBar.complete();

          $scope.connected = null;
          $scope.joined = null;

          $scope.alertError("Failed to connect");

          dfd.reject();
        });

        cfpLoadingBar.start();

        // If already connected, skip ws connect step
        if ($scope.connected) {
          onconnect($scope.connected);
        } else {
          easyrtc.setUsername($scope.username);
          easyrtc.setCredential({'token': $scope.domain.token});
          easyrtc.connect(WEB_RTC_APP, onconnect, onconnecterror);
        }

        return dfd.promise;

      }

      // In order to change stream sources we need to re-obtain medias
      // and re connect from peers with the new streams
      $scope.changeSources = function() {

        // easy solution: reconnect with updated changes.
        easyrtc.leaveRoom($scope.roomToJoin, function() {
          $scope.joined = null;

          $timeout(function() {
            // connect will simply re-otain media
            $scope.connect()
          }, 500);
        })
        easyrtc.hangupAll();

        // this is the ideal solution but easyrtc is full of bugs
        // and doesn't seem to handle the stream changes correctly.
        /*
                // close cam/mic stream
                if($scope.mediaSourceWorking){
                    easyrtc.closeLocalStream($scope.mediaSourceWorking.streamName);
                    $scope.mediaSourceWorking = null;
                }

                // give time for parties to detect stream changes
                $timeout(function(){
                    // connect will simply re-otain media
                    $scope.connect().then(function(){

                        // After reconnected, re add streams and update audio output sink
                        for(k in $scope.membersDict){
                            easyrtc.addStreamToCall(k, $scope.mediaSourceWorking.streamName);
                            setAudioOutput(document.getElementById('u-'+k));
                        }


                    }).catch(function(err){ console.log("Failed to add stream after source change: ", err)});

                }, 200);
                */
      }

      $scope.sendMessage = function() {

        if (!$scope.messages.message) {
          return;
        }
        var msg = $scope.messages.message;

        var suc = wrapCall(function(a, b) {
          $scope.messages.message = '';
          // Add self message
          addMessage(msg, "Me");
        });

        var er = wrapCall(function(a, b) {
          $scope.alertError("Failed to send message.");
        });

        // Broadcast message to everyone in the room.
        // We can use room name (original one)

        easyrtc.sendPeerMessage({
          targetRoom: $scope.joined.name
        }, CHAT_MESSAGE_TYPE, {
          msg: msg,
          source: $scope.username
        }, suc, er);

      }

      $scope.sendWakeUp = function(target) {

        var suc = wrapCall(function(a, b) {
          cfpLoadingBar.complete();
        });

        var er = wrapCall(function(a, b) {
          cfpLoadingBar.complete();
          $scope.alertError("Failed to send.");
        });

        cfpLoadingBar.start();

        easyrtc.sendPeerMessage(target, WAKE_UP_MESSAGE_TYPE, {}, suc, er);
      }

      $scope.switchMic = function() {
        $scope.mic = !$scope.mic;
        easyrtc.enableMicrophone($scope.mic);
      }

      $scope.switchCamera = function() {
        $scope.camera = !$scope.camera;
        easyrtc.enableCamera($scope.camera);
      }

      $scope.openFullScreen = function(evt) {

        var elem = evt.currentTarget;

        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }

      }

      // Will call a specific target.
      // It is interesting to note that when calling a target, the target also calls back
      // So setStreamAcceptor is also called afterwards.
      $scope.callOne = function(target, attempt) {

        attempt = attempt != undefined
          ? attempt
          : 0;

        // only call if not already sharing with me
        if ($scope.sharingWithMeDict[k] || attempt > 5) {
          return;
        }

        // If call pending and not expired, also do not call. 5 seconds expiration
        if ($scope.pendingCallsDict[k] && (new Date().getTime() - $scope.pendingCallsDict[k]) < 5000) {

          // If pending call and not expired, set a re-try with a timeout.
          // it won't have effect if the call is established before the timeout
          $timeout(function() {
            $scope.callOne(target, attempt + 1);
          }, 3000);
          return;
        }

        var onsuc = wrapCall(function(otherCaller, mediaType) {
          delete $scope.pendingCallsDict[target];
        });

        var onerr = wrapCall(function(errorCode, errMessage) {
          console.log("Error calling: ", target, errorCode, errMessage);
          delete $scope.pendingCallsDict[target];

          // re try
          $timeout(function() {
            $scope.callOne(target, attempt + 1);
          }, 3000);
        });

        var onacc = wrapCall(function(wasAccepted, otherUser) {});

        $scope.pendingCallsDict[target] = new Date().getTime();

        console.log("Call one called");
        var streams = [];

        // Manually add the streams we want on the call
        // so we can include default one (cam/mic) and
        // screen sharing if any.

        if ($scope.mediaSourceWorking) {
          streams.push($scope.mediaSourceWorking.streamName);
        }

        if ($scope.sharingScreen) {
          streams.push(SCREEN_SHARING_STREAM_NAME);
        }

        easyrtc.call(target, onsuc, onerr, onacc, streams);
      }

      easyrtc.setAcceptChecker(wrapCall(function(id, cb) {
        // Reject calls if we are restarting sources.

        var streams = [];

        // Manually add the streams we want on the call
        // so we can include default one (cam/mic) and
        // screen sharing if any.
        if ($scope.mediaSourceWorking) {
          streams.push($scope.mediaSourceWorking.streamName);
        }

        if ($scope.sharingScreen) {
          streams.push(SCREEN_SHARING_STREAM_NAME);
        }

        // accept with our streams
        cb(true, streams);
      }));

      // Will listen incoming calls and add their video streams.
      easyrtc.setStreamAcceptor(wrapCall(function(id, stream) {

        var newShared;
        console.log(stream);

        // if already sharing, get it
        if ($scope.sharingWithMeDict[id]) {
          newShared = $scope.sharingWithMeDict[id];
        } else {
          newShared = {
            username: $scope.membersDict[id].username,
            id: id
          }
          $scope.sharingWithMe.push(newShared);
          $scope.sharingWithMeDict[id] = newShared;
        }

        if (stream.streamName == SCREEN_SHARING_STREAM_NAME) {
          newShared.screen = stream;

          $timeout(function() {
            easyrtc.setVideoObjectSrc(document.getElementById('us-' + id), stream);
          }, 10);
        } else {
          newShared.stream = stream;

          newShared.hasVideo = easyrtc.haveVideoTrack(id);
          newShared.hasAudio = easyrtc.haveAudioTrack(id);

          $timeout(function() {
            easyrtc.setVideoObjectSrc(document.getElementById('u-' + id), stream);
            setAudioOutput(document.getElementById('u-' + id));
          }, 10);
        }

        console.log("Stream accepted", newShared);

      }));

      var killUser = function(id) {
        // Find user in shared with me and remove it.
        var sharing = $scope.sharingWithMe;

        var found = null;
        for (var i = 0; i < sharing.length; i++) {
          if (sharing[i].id == id) {
            found = i;
            break;
          }
        }

        if (found != null) {
          // Clear stream source element
          easyrtc.setVideoObjectSrc(document.getElementById('u-' + id), '');
          easyrtc.setVideoObjectSrc(document.getElementById('us-' + id), '');
          $scope.sharingWithMe.splice(found, 1);
          delete $scope.sharingWithMeDict[id];
          delete $scope.pendingCallsDict[id];
        }
      }

      easyrtc.setOnStreamClosed(wrapCall(function(id, stream, streamName) {
        console.log("Stream closed: ", streamName);
        if (streamName == SCREEN_SHARING_STREAM_NAME) {
          easyrtc.setVideoObjectSrc(document.getElementById('us-' + id), '');
          if ($scope.sharingWithMeDict[id]) {
            $scope.sharingWithMeDict[id].screen = null;
          }
        } else {
          easyrtc.setVideoObjectSrc(document.getElementById('u-' + id), '');
          if ($scope.sharingWithMeDict[id]) {
            $scope.sharingWithMeDict[id].stream = null;
          }
        }

      }));

      // --- Screen sharing tests ---
      // #1: <script src="https://cdn.WebRTC-Experiment.com/getScreenId.js"></script> in order to add a helper js
      // #2: Users must download chrome extension: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

      $scope.shareScreen = function() {

        getScreenId(function(error, sourceId, screen_constraints) {
          console.log(error);
          console.log(sourceId);

          if (error || !sourceId) {
            ngDialog.open({template: "share-screen-plugin-modal.html", className: 'ngdialog-theme-default', closeByDocument: true, closeByEscape: true});
          } else {

            navigator.getUserMedia(screen_constraints, wrapCall(function(stream) {

              // register screen stream and send it to all existing peers.
              easyrtc.register3rdPartyLocalMediaStream(stream, SCREEN_SHARING_STREAM_NAME);

              $scope.sharingScreen = true;

              stream.oninactive = wrapCall(function() {
                if (stream.oninactive) {
                  stream.oninactive = undefined;
                  $scope.stopShareScreen(); // calling this twice won't hurt
                }
              });

              for (var i = 0; i < $scope.sharingWithMe.length; i++) {
                easyrtc.addStreamToCall($scope.sharingWithMe[i].id, SCREEN_SHARING_STREAM_NAME, function() {
                  console.log("Share screen accepted.");
                });
              }

            }), function(error) {
              console.error(error);
            });

          }
        });

      }

      $scope.stopShareScreen = function() {
        easyrtc.closeLocalStream(SCREEN_SHARING_STREAM_NAME);
        $scope.sharingScreen = false;
      }

      window.testScope = $scope;
    }
  }
]);
