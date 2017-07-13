// Wrap sound calls in case we want global muting.
export function playSound(obj) {
  obj.play();
}

// Helper to allow setting audio output of an element
// Currently only supported by chrome
export function setAudioOutput(element) {
  if (element.setSinkId && $scope.selectedAudioOutputDevice) {
    element.setSinkId($scope.selectedAudioOutputDevice.deviceId);
  }
}

export function addMessage(msg, source) {
  $scope.messages.list.push({date: new moment(), msg: msg, source: source});

  $timeout(function() {
    // Scroll to bottom
    $('#messages-list-holder').scrollTop($('#messages-list-holder')[0].scrollHeight);
  });
}
