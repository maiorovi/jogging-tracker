var joggingApp = angular.module('joggingApp', ['ngRoute', 'ngMessages'])
    .controller('LoginController', function ($scope, $routeParams, $location, $http, $session) {
        $scope.credentials = {
            "email": "",
            "password": ""
        }

        $scope.login = function () {
            $scope.credentials.$error = {};
            var loginPromise = $http.post("http://localhost:9090/login", $scope.credentials)

            loginPromise.success(function(data, status, headers, config) {
                if (data.token) {
                    $location.path('/joggingList')
                    $session.create(data.token)
                }
                else {
                    $scope.credentials.$error.generalLogin = true
                }
            });
            loginPromise.error(function(data, status, headers, config) {
                if (status == 403) {
                    $scope.credentials.$error.invalidCredentials = true
                }
                else {
                    $scope.credentials.$error.generalLogin = true
                }
            });
        }

        $scope.register = function() {
            $location.path('/register')
        }
    })

    .controller('JoggingController', function ($scope, $routeParams, $location, $http, $session) {
        $scope.jogRecords = []
        var jogDataPromise = $http.get("http://localhost:9090/jogRecord", {
            "headers": {"Auth-Token": $session.token}
        })

        jogDataPromise.success(function(data, status, headers, config) {
            $scope.jogRecords = data
        });
        jogDataPromise.error(function(data, status, headers, config) {
        });
    })

    .controller('RegistrationController', function ($scope, $routeParams, $location, $http) {
        $scope.credentials = {}

        $scope.register = function () {
            $scope.credentials.$error = {};
            var registerPromise = $http.post("http://localhost:9090/user", $scope.credentials)

            registerPromise.success(function(data, status, headers, config) {
                if (data.email) {
                    $location.path('/')
                }
                else {
                    $scope.credentials.$error.registrationFailure = true
                }
            });
            registerPromise.error(function(data, status, headers, config) {
                if (status == 409) {
                    $scope.credentials.$error.userExists = true
                }
                else {
                    $scope.credentials.$error.registrationFailure = true
                }
            });
        }
    })

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/login.html',
                controller: 'LoginController'
            })
            .when('/joggingList/', {
                templateUrl: 'partials/recordList.html',
                controller: 'JoggingController'
            })
            .when('/register/', {
                templateUrl: 'partials/register.html',
                controller: 'RegistrationController'
            })
            .otherwise({
                redirectTo: '/'
            })
    })

    .service('$session', function () {
        this.create = function (token) {
            this.token = token;
        };
        this.destroy = function () {
            this.token = null;
        };
        return this;
    })