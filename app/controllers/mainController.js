angular.module("app").controller("MainController", [
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
  function($scope, $rootScope, $location, $http, $timeout, $interval, $q, ngDialog, debounce, $modalStack, $routeParams) {

    $scope.mainLoaded = true;

    $scope.alertError = debounce(function(msg) {
      ngDialog.open({
        template: $rootScope.TEMPLATES.errorDialog,
        className: 'ngdialog-theme-default',
        data: {
          'msg': msg
        },
        closeByDocument: true,
        closeByEscape: true
      });
    }, 200);
  }
]);
