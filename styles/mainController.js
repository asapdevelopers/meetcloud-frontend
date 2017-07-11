angular.module("app").controller("MainController", ["$scope", "$rootScope", "$location", "$http", "$timeout", "$interval", "$q", "ngDialog","debounce", '$modalStack',
	function ($scope, $rootScope, $location, $http, $timeout, $interval, $q, ngDialog, debounce, $modalStack) {

	    $scope.mainLoaded = true;


		// Should get rtc host and set main loaded true

		$scope.rtcHost = 'ws://localhost:8081';
        
	}    
    
]);