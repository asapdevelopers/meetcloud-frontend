var WEB_RTC_APP = 'app';


angular.module('app').run(["$route","$rootScope", function ($route, $rootScope) {

    //Add some templates we need on variables
    $rootScope.TEMPLATES = {
        'errorDialog': "/app/templates/errorDialog.html"
    };


    $route.reload();
}]);


angular.module("app").config(["$routeProvider", "$locationProvider", "$httpProvider", '$compileProvider','cfpLoadingBarProvider',
    function ($routeProvider, $locationProvider, $httpProvider, $compileProvider, cfpLoadingBarProvider) {

        $locationProvider.hashPrefix("!").html5Mode(true);

        $routeProvider.when("/:room?", {
            templateUrl: "/app/templates/index.html",
            controller: "IndexController"
        })
        .otherwise({ redirectTo: '/' });


        // Loader styles
        cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
        cfpLoadingBarProvider.latencyThreshold = 100;

        $compileProvider.debugInfoEnabled(true);
    }
]);


//To work with strings, dates or moment dates
angular.module('app').filter('localeDate', function () {
    return function (input) {
        if (input == null) {
            return "";
        }

        var d = new moment(input);
        return d.isValid() ? d.format("L") : input;
    };
});

angular.module('app').filter('localeDateAsOf', function () {
    return function (input) {
        if (input == null) {
            return "";
        }

        return moment(input).format('MMMM DD, YYYY');
    };
});

angular.module('app').filter('localeDateTime', function () {
    return function (input) {
        if (input == null) {
            return "";
        }

        var d = new moment(input);
        return d.isValid() ? d.format("L LT") : input;
    };
});

angular.module('app').filter('localeMonthYear', function () {
    return function (input) {
        if (input == null) {
            return "";
        }

        var d = new moment(input);
        return d.isValid() ? d.format("MMM-YY") : input;
    };
});

angular.module('app').filter('localeMonthDayYear', function () {
    return function (input) {
        if (input == null) {
            return "";
        }

        var d = new moment(input);
        return d.isValid() ? d.format("MMM DD, YYYY") : input;
    };
});

angular.module("app").directive('ngRightClick', ["$parse", function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, { $event: event });
            });
        });
    };
}]);
