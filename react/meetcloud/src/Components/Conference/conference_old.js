// Load some settings from local storage
//$scope.username = localStorageService.get('username') || null;

var init = function(data) {
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
    debugger;
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
