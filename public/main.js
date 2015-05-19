'use strict';
var app = angular.module('FullstackBotsApp', ['ui.router', 'fsaPreBuilt', 'ui.ace']);

app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});
'use strict';
app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope) {

    // Images of beautiful Fullstack people.
    $scope.images = ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large'];
});
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('battle', {
        url: '/battle',
        controller: 'EventsController',
        templateUrl: 'js/events/battle.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('EventsController', function ($scope, $stateParams, EventsFactory) {

    $scope.data = {
        preferences: '',
        slots: 1,
        createEvent: false
    };

    $scope.waiting = false;

    if (!$scope.pendingEvents) EventsFactory.getPendingEvents().then(function (events) {
        $scope.pendingEvents = events;
    });

    //TODO
    // if (!$scope.liveEvents) EventsFactory.getLiveEvents().then(function(events){
    // 	$scope.liveEvents = events;
    // });
    $scope.liveEvents = [];

    //TODO
    // if (!$scope.challenges) EventsFactory.getPendingChallenges().then(function(challenges){
    //     $scope.challenges = challenges;
    // });
    $scope.challenges = [];

    // //SCOPE METHODS
    $scope.createNewEvent = function () {

        var newEvent = {
            preferences: $scope.data.preferences,
            slots: $scope.data.slots
        };

        EventsFactory.createEvent(newEvent).then(function (event) {
            console.log('EVENT ADDED!');
            $scope.pendingEvents.push(event);
            $scope.data.createEvent = false;
            $scope.data.preferences = '';
            $scope.data.slots = 1;
        });
    };

    $scope.deleteEvent = function (index) {
        EventsFactory.deleteEvent($scope.pendingEvents[index]).then(function (event) {
            $scope.pendingEvents.splice(index, 1);
        });
    };

    $scope.joinEvent = function (index) {

        EventsFactory.joinEvent($scope.pendingEvents[index]).then(function (event) {
            $scope.waiting = true;
        });
    };
});

// app.filter('rankFilter', function () {

//   return function ( events, number ) {
//     var filtered = [];
//     for (var i = 0; i < events.length; i++) {
//       if ( events[i].rank<= number ) {
//         filtered.push( events[i] );
//       }
//     }
//     return filtered;
//   };
// });
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('events', {
        url: '/events',
        controller: 'EventsController',
        templateUrl: 'js/events/events.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('mainEventCtrl', function ($scope, $stateParams) {
    $scope.eventsObj = {};
    console.log('revised mainEventCtrl');
    $scope.$on('refreshEventObj', function (event, data) {
        console.log('mainEventCtrl data=', data);
        $scope.eventsObj = data;
    });
});

app.controller('EventsController', function ($scope, $stateParams, EventsFactory, $rootScope) {

    $scope.data = {
        preferences: '',
        slots: 1,
        createEvent: false
    };

    $scope.eventLaunched = false;
    $scope.directEventID = '';
    $scope.waiting = false;
    if (!$scope.pendingEvents) EventsFactory.getPendingEvents().then(function (events) {
        $scope.pendingEvents = events;
    });

    //TODO
    // if (!$scope.liveEvents) EventsFactory.getLiveEvents().then(function(events){
    // 	$scope.liveEvents = events;
    // });
    $scope.liveEvents = [];

    //TODO
    // if (!$scope.challenges) EventsFactory.getPendingChallenges().then(function(challenges){
    //     $scope.challenges = challenges;
    // });
    $scope.challenges = [];

    // //SCOPE METHODS
    $scope.createNewEvent = function () {

        var newEvent = {
            preferences: $scope.data.preferences,
            slots: $scope.data.slots
        };

        EventsFactory.createEvent(newEvent).then(function (event) {
            console.log('EVENT ADDED!');
            $scope.pendingEvents.push(event);
            $scope.data.createEvent = false;
            $scope.data.preferences = '';
            $scope.data.slots = 1;
        });
    };

    $scope.deleteEvent = function (index) {
        EventsFactory.deleteEvent($scope.pendingEvents[index]).then(function (event) {
            $scope.pendingEvents.splice(index, 1);
        });
    };

    $scope.joinEvent = function (index) {

        if ($scope.eventLaunched) {
            console.log('toggle from', $scope.eventLaunched);
            $scope.eventLaunched = false;
        } else {
            $scope.directEventID = $scope.pendingEvents[index]._id;
            $scope.eventLaunched = true;
            $scope.$emit('refreshEventObj', {
                eventID: $scope.pendingEvents[index]._id, eventType: 'pending'
            });
            $scope.$emit('launchEvent', {
                eventID: $scope.pendingEvents[index]._id, eventType: 'pending'
            });
            console.log('EventsController \'launchEvent\' $scope.pendingEvents[index]._id id', $scope.pendingEvents[index]._id);
        }

        //        EventsFactory.joinEvent( $scope.pendingEvents[index] )
        //        .then(function (event) {
        //        	$scope.waiting = true;
        //            $scope.eventLaunched = true;
        //        }).catch(function(err){
        //            	console.log(err);
        //        });
    };
});

app.controller('PlayCanvasCtrl', function ($scope, $sce) {
    //playCanvas URL can be changed to anything including:
    // FullStackBots: /pc/index.html ,
    // FSB: http://playcanv.as/p/bbMQlNMt?server=fsb,
    // Tanx: http://playcanv.as/p/aP0oxhUr ,
    // Voyager: http://playcanv.as/p/MmS7rx1i ,
    // Swoop: http://playcanv.as/p/JtL2iqIH ,
    // Hack: http://playcanv.as/p/KRE8VnRm

    // trustAsResourceUrl can be highly insecure if you do not filter for secure URLs
    // it compounds the security risk of malicious code injection from the Code Editor

    console.log('$scope.$parent.directEventID', $scope.$parent.directEventID);
    $scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb&eventID=' + $scope.$parent.directEventID);
    ////	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb&eventID='+'5559f60123b028a5143b6e63');
    ////	$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb');
    //
    //	$scope.$on('launchEvent',function(event, data){
    //		console.log("PlayCanvasCtrl data=",data);
    //		$scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb&eventID='+data.eventID);
    //	});
});

// app.filter('rankFilter', function () {

//   return function ( events, number ) {
//     var filtered = [];
//     for (var i = 0; i < events.length; i++) {
//       if ( events[i].rank<= number ) {
//         filtered.push( events[i] );
//       }
//     }
//     return filtered;
//   };
// });
(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function ($location) {

        if (!window.io) throw new Error('socket.io not found!');

        var socket;

        if ($location.$$port) {
            socket = io('http://localhost:1337');
        } else {
            socket = io('/');
        }

        return socket;
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function () {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.
            if (this.isAuthenticated()) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin)['catch'](function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin)['catch'](function (response) {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();
'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});

app.factory('botCodeFactory', function ($http) {
    return {
        getBot: function getBot(bot) {

            var queryParams = {
                bot: bot
            };

            if (!bot) {
                console.log('no bot');
                return;
            }

            return $http.get('/api/dispatcher/readFile/', {
                params: queryParams
            }).then(function (response) {
                //return to controller
                return response.data;
            });
        },

        saveBot: function saveBot(bot) {
            //        	if(!bot._id){
            //        		bot._id = '5556463aaadfdb33433b63b5';
            //        	}

            var data; //data packet to send
            data = { bot: bot };

            return $http.post('/api/dispatcher/saveFile/', data).then(function (res) {
                //                update.currentOrder = res.data;
                //                update.justOrdered = true;
                console.log('saveFile res.data', res.data);
                return res.data;
            }, function (err) {
                throw new Error(err);
            });
        }

    };
});

app.controller('CodeEditorCtrl', function ($scope, botCodeFactory) {

    $scope.bot = {};

    //Could also be a Panel of Tabs, TODO upon selection or forking of a bot
    botCodeFactory.getBot('5556463aaadfdb33433b63b5').then(function (bot) {
        console.log('controller data', bot);
        $scope.bot.botCode = bot.botCode;
        $scope.bot._id = bot._id;
    });

    $scope.saveBot = function () {
        botCodeFactory.saveBot($scope.bot);
    };

    // ui.ace start
    $scope.aceLoaded = function (_editor) {
        // Options
        _editor.setReadOnly(false);
    };
    $scope.aceChanged = function (e) {};
});

app.controller('CodeConsoleCtrl', function ($scope) {});

app.controller('ButtonsCtrl', function ($scope) {});

app.controller('SideMenuCtrl', function ($scope) {});

app.controller('msgCtrl', function ($scope) {
    if (typeof EventSource !== 'undefined') {

        // Yes! Server-sent events support!
        var source = new EventSource('/api/dispatcher/');
        source.onopen = function (event) {
            console.log('open', event);
        };
        // creat an eventHandler for when a message is received
        source.onmessage = function (event) {
            console.log('messaage data:', event.data);
            $scope.msg = JSON.parse(event.data);
            //            $scope.$apply();
            //            console.log($scope.msg);
        };
        source.onerror = function (event) {
            console.log('error', event);
        };
    } else {
        // Sorry! No server-sent events support..
        console.log('SSE not supported by browser.');
    }
});
app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('events');
        })['catch'](function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/members-area',
        template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
        controller: function controller($scope, SecretStash) {
            SecretStash.getStash().then(function (stash) {
                $scope.stash = stash;
            });
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });
});

app.factory('SecretStash', function ($http) {

    var getStash = function getStash() {
        return $http.get('/api/members/secret-stash').then(function (response) {
            return response.data;
        });
    };

    return {
        getStash: getStash
    };
});
'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('tutorial', {
        url: '/tutorial',
        templateUrl: 'js/tutorial/tutorial.html',
        controller: 'TutorialCtrl',
        resolve: {
            tutorialInfo: function tutorialInfo(TutorialFactory) {
                return TutorialFactory.getTutorialVideos();
            }
        }
    });
});

app.factory('TutorialFactory', function ($http) {

    return {
        getTutorialVideos: function getTutorialVideos() {
            return $http.get('/api/tutorial/videos').then(function (response) {
                return response.data;
            });
        }
    };
});

app.controller('TutorialCtrl', function ($scope, tutorialInfo) {

    $scope.sections = tutorialInfo.sections;
    $scope.videos = _.groupBy(tutorialInfo.videos, 'section');

    $scope.currentSection = { section: null };

    $scope.colors = ['rgba(34, 107, 255, 0.10)', 'rgba(238, 255, 68, 0.11)', 'rgba(234, 51, 255, 0.11)', 'rgba(255, 193, 73, 0.11)', 'rgba(22, 255, 1, 0.11)'];

    $scope.getVideosBySection = function (section, videos) {
        return videos.filter(function (video) {
            return video.section === section;
        });
    };
});
app.factory('EventsFactory', function ($http) {

    return {

        getPendingEvents: function getPendingEvents() {

            return $http.get('/api/members/pending').then(function (response) {
                return response.data;
            });
        },

        getLiveEvents: function getLiveEvents() {

            return $http.get('/api/members/live').then(function (response) {
                return response.data;
            });
        },

        createEvent: function createEvent(event) {
            console.log(event);
            return $http.post('/api/members/', event).then(function (response) {
                return response.data;
            });
        },

        joinEvent: function joinEvent(event) {

            return $http.put('/api/members/' + event._id, event).then(function (response) {
                return response.data;
            });
        },

        deleteEvent: function deleteEvent(event) {

            return $http['delete']('/api/members/' + event._id).then(function (response) {
                return response.data;
            });
        }
    };
});
'use strict';
app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});
'use strict';

'use strict';

app.directive('tutorialSection', function () {
    return {
        restrict: 'E',
        scope: {
            name: '@',
            videos: '=',
            background: '@'
        },
        templateUrl: 'js/tutorial/tutorial-section/tutorial-section.html',
        link: function link(scope, element) {
            element.css({ background: scope.background });
        }
    };
});
'use strict';
app.directive('tutorialSectionMenu', function () {
    return {
        restrict: 'E',
        require: 'ngModel',
        templateUrl: 'js/tutorial/tutorial-section-menu/tutorial-section-menu.html',
        scope: {
            sections: '='
        },
        link: function link(scope, element, attrs, ngModelCtrl) {

            scope.currentSection = scope.sections[0];
            ngModelCtrl.$setViewValue(scope.currentSection);

            scope.setSection = function (section) {
                scope.currentSection = section;
                ngModelCtrl.$setViewValue(section);
            };
        }
    };
});
'use strict';
app.directive('tutorialVideo', function ($sce) {

    var formYoutubeURL = function formYoutubeURL(id) {
        return 'https://www.youtube.com/embed/' + id;
    };

    return {
        restrict: 'E',
        templateUrl: 'js/tutorial/tutorial-video/tutorial-video.html',
        scope: {
            video: '='
        },
        link: function link(scope) {
            scope.trustedYoutubeURL = $sce.trustAsResourceUrl(formYoutubeURL(scope.video.youtubeID));
        }
    };
});
'use strict';
app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
'use strict';
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'about' }, { label: 'Tutorial', state: 'tutorial' }, { label: 'Members Only', state: 'membersOnly', auth: true }];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});
'use strict';
app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});

//

//Code output, console logs, errors etc.

//Practice and/or Compete

//Chat, Repo, FAQ. etc
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYmF0dGxlL2JhdHRsZS5qcyIsImV2ZW50cy9ldmVudHMuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImhvbWUvaG9tZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibWVtYmVycy1vbmx5L21lbWJlcnMtb25seS5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9FdmVudHNGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZmFjdG9yaWVzL1NvY2tldC5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24vdHV0b3JpYWwtc2VjdGlvbi5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24tbWVudS90dXRvcmlhbC1zZWN0aW9uLW1lbnUuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC12aWRlby90dXRvcmlhbC12aWRlby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLElBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxhQUFBLEVBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7OztBQUdBLFFBQUEsNEJBQUEsR0FBQSxTQUFBLDRCQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0tBQ0EsQ0FBQTs7OztBQUlBLGNBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOztBQUVBLFlBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOzs7QUFHQSxhQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNsREEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSx1REFBQSxFQUNBLHFIQUFBLEVBQ0EsaURBQUEsRUFDQSxpREFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsQ0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDeEJBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLGtCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBOzs7OztBQUFBLEtBS0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsa0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsYUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsYUFBQSxHQUFBLE1BQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7O0FBTUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7Ozs7OztBQU1BLFVBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFJQSxVQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7O0FBRUEsWUFBQSxRQUFBLEdBQUE7QUFDQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO1NBQ0EsQ0FBQTs7QUFFQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxrQkFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxrQkFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7OztBQzNFQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFNBQUE7QUFDQSxrQkFBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQTs7Ozs7QUFBQSxLQUtBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEscUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsa0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLGFBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGFBQUEsR0FBQSxNQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7Ozs7OztBQU1BLFVBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOzs7Ozs7QUFNQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7O0FBSUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxZQUFBOztBQUVBLFlBQUEsUUFBQSxHQUFBO0FBQ0EsdUJBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtTQUNBLENBQUE7O0FBRUEscUJBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUNBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUNBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxZQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsTUFDQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxHQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esa0JBQUEs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QSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOzs7Ozs7QUFNQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBOzs7OztBQUtBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7QUMzSUEsWUFBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQSxHQUFBLEVBQUE7O0FBRUEsZ0JBQUEsV0FBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUE7YUFDQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFdBQUE7YUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBOztBQUVBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxlQUFBLEVBQUEsaUJBQUEsR0FBQSxFQUFBOzs7OztBQUtBLGdCQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwyQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTs7O0FBR0EsdUJBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxHQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLHNCQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7O0tBRUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFHQSxrQkFBQSxDQUFBLE1BQUEsQ0FBQSwwQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxlQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUFBLEVBQUEsRUFFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUdBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUdBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUdBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxXQUFBLEtBQUEsV0FBQSxFQUFBOzs7QUFHQSxZQUFBLE1BQUEsR0FBQSxJQUFBLFdBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxjQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7O1NBR0EsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBQ0EsTUFBQTs7QUFFQSxlQUFBLENBQUEsR0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FBQTtLQUNBO0NBQ0EsQ0FBQSxDQUFBO0FDcEhBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxXQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMzQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsZUFBQTtBQUNBLGdCQUFBLEVBQUEsbUVBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOzs7QUFHQSxZQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLElBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsUUFBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMvQkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsV0FBQTtBQUNBLG1CQUFBLEVBQUEsMkJBQUE7QUFDQSxrQkFBQSxFQUFBLGNBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLHNCQUFBLGVBQUEsRUFBQTtBQUNBLHVCQUFBLGVBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7YUFDQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EseUJBQUEsRUFBQSw2QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUNBLDBCQUFBLEVBQ0EsMEJBQUEsRUFDQSwwQkFBQSxFQUNBLDBCQUFBLEVBQ0Esd0JBQUEsQ0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxrQkFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEtBQUEsT0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2pEQSxHQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBOztBQUVBLHdCQUFBLEVBQUEsNEJBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBOztBQUVBLHFCQUFBLEVBQUEseUJBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBOztBQUVBLG1CQUFBLEVBQUEscUJBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEsaUJBQUEsRUFBQSxtQkFBQSxLQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FB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QUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoREEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxlQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEseURBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0JvdHNBcHAnLCBbJ3VpLnJvdXRlcicsICdmc2FQcmVCdWlsdCcsICd1aS5hY2UnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZSdcbiAgICBdO1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdiYXR0bGUnLCB7XG4gICAgICAgIHVybDogJy9iYXR0bGUnLFxuICAgICAgICBjb250cm9sbGVyOiBcIkV2ZW50c0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ldmVudHMvYmF0dGxlLmh0bWwnXG4gICAgICAgIC8vICxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYWRtaW46IHRydWVcbiAgICAgICAgLy8gfVxuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdFdmVudHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBFdmVudHNGYWN0b3J5KSB7XG5cbiAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgcHJlZmVyZW5jZXM6IFwiXCIsXG4gICAgICAgIHNsb3RzOiAxLFxuICAgICAgICBjcmVhdGVFdmVudDogZmFsc2VcbiAgICB9O1xuXG4gICAgJHNjb3BlLndhaXRpbmcgPSBmYWxzZTtcblxuICAgIGlmICghJHNjb3BlLnBlbmRpbmdFdmVudHMpIEV2ZW50c0ZhY3RvcnkuZ2V0UGVuZGluZ0V2ZW50cygpLnRoZW4oZnVuY3Rpb24oZXZlbnRzKXtcbiAgICAgICAgJHNjb3BlLnBlbmRpbmdFdmVudHMgPSBldmVudHM7XG4gICAgfSk7XG5cbiAgICAvL1RPRE9cblx0Ly8gaWYgKCEkc2NvcGUubGl2ZUV2ZW50cykgRXZlbnRzRmFjdG9yeS5nZXRMaXZlRXZlbnRzKCkudGhlbihmdW5jdGlvbihldmVudHMpe1xuXHQvLyBcdCRzY29wZS5saXZlRXZlbnRzID0gZXZlbnRzO1xuXHQvLyB9KTtcbiAgICAkc2NvcGUubGl2ZUV2ZW50cyA9IFtdO1xuXG4gICAgLy9UT0RPXG4gICAgLy8gaWYgKCEkc2NvcGUuY2hhbGxlbmdlcykgRXZlbnRzRmFjdG9yeS5nZXRQZW5kaW5nQ2hhbGxlbmdlcygpLnRoZW4oZnVuY3Rpb24oY2hhbGxlbmdlcyl7XG4gICAgLy8gICAgICRzY29wZS5jaGFsbGVuZ2VzID0gY2hhbGxlbmdlcztcbiAgICAvLyB9KTtcbiAgICAkc2NvcGUuY2hhbGxlbmdlcyA9IFtdO1xuXG5cdFxuXHQvLyAvL1NDT1BFIE1FVEhPRFNcbiAgICAkc2NvcGUuY3JlYXRlTmV3RXZlbnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgbmV3RXZlbnQgPSB7IFxuICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICRzY29wZS5kYXRhLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgc2xvdHM6ICRzY29wZS5kYXRhLnNsb3RzXG4gICAgICAgIH1cblxuICAgICAgICBFdmVudHNGYWN0b3J5LmNyZWF0ZUV2ZW50KCBuZXdFdmVudCApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGV2ZW50IClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIEFEREVEIVwiKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5jcmVhdGVFdmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLnByZWZlcmVuY2VzID0gXCJcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5zbG90cyA9IDE7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgIEV2ZW50c0ZhY3RvcnkuZGVsZXRlRXZlbnQoICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XSApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBlbmRpbmdFdmVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5qb2luRXZlbnQgPSBmdW5jdGlvbiggaW5kZXggKSB7XG5cbiAgICAgICAgRXZlbnRzRmFjdG9yeS5qb2luRXZlbnQoICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XSApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAkc2NvcGUud2FpdGluZyA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuLy8gYXBwLmZpbHRlcigncmFua0ZpbHRlcicsIGZ1bmN0aW9uICgpIHtcblxuLy8gICByZXR1cm4gZnVuY3Rpb24gKCBldmVudHMsIG51bWJlciApIHtcbi8vICAgICB2YXIgZmlsdGVyZWQgPSBbXTtcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuLy8gICAgICAgaWYgKCBldmVudHNbaV0ucmFuazw9IG51bWJlciApIHtcbi8vICAgICAgICAgZmlsdGVyZWQucHVzaCggZXZlbnRzW2ldICk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiBmaWx0ZXJlZDtcbi8vICAgfTtcbi8vIH0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2V2ZW50cycsIHtcbiAgICAgICAgdXJsOiAnL2V2ZW50cycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiRXZlbnRzQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2V2ZW50cy9ldmVudHMuaHRtbCdcbiAgICAgICAgLy8gLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhZG1pbjogdHJ1ZVxuICAgICAgICAvLyB9XG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ21haW5FdmVudEN0cmwnLGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zKXtcblx0JHNjb3BlLmV2ZW50c09iaiA9IHt9O1xuXHRjb25zb2xlLmxvZyhcInJldmlzZWQgbWFpbkV2ZW50Q3RybFwiKTtcblx0JHNjb3BlLiRvbigncmVmcmVzaEV2ZW50T2JqJyxmdW5jdGlvbihldmVudCwgZGF0YSl7XG5cdFx0Y29uc29sZS5sb2coXCJtYWluRXZlbnRDdHJsIGRhdGE9XCIsZGF0YSk7XG5cdFx0JHNjb3BlLmV2ZW50c09iaiA9IGRhdGE7XG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdFdmVudHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBFdmVudHNGYWN0b3J5LCAkcm9vdFNjb3BlKSB7XG5cbiAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgcHJlZmVyZW5jZXM6IFwiXCIsXG4gICAgICAgIHNsb3RzOiAxLFxuICAgICAgICBjcmVhdGVFdmVudDogZmFsc2VcbiAgICB9O1xuICAgIFxuICAgICRzY29wZS5ldmVudExhdW5jaGVkID0gZmFsc2U7XG4gICAgJHNjb3BlLmRpcmVjdEV2ZW50SUQgPSBcIlwiO1xuICAgICRzY29wZS53YWl0aW5nID0gZmFsc2U7XG4gICAgaWYgKCEkc2NvcGUucGVuZGluZ0V2ZW50cykgRXZlbnRzRmFjdG9yeS5nZXRQZW5kaW5nRXZlbnRzKCkudGhlbihmdW5jdGlvbihldmVudHMpe1xuICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cyA9IGV2ZW50cztcbiAgICB9KTtcblxuICAgIC8vVE9ET1xuXHQvLyBpZiAoISRzY29wZS5saXZlRXZlbnRzKSBFdmVudHNGYWN0b3J5LmdldExpdmVFdmVudHMoKS50aGVuKGZ1bmN0aW9uKGV2ZW50cyl7XG5cdC8vIFx0JHNjb3BlLmxpdmVFdmVudHMgPSBldmVudHM7XG5cdC8vIH0pO1xuICAgICRzY29wZS5saXZlRXZlbnRzID0gW107XG5cbiAgICAvL1RPRE9cbiAgICAvLyBpZiAoISRzY29wZS5jaGFsbGVuZ2VzKSBFdmVudHNGYWN0b3J5LmdldFBlbmRpbmdDaGFsbGVuZ2VzKCkudGhlbihmdW5jdGlvbihjaGFsbGVuZ2VzKXtcbiAgICAvLyAgICAgJHNjb3BlLmNoYWxsZW5nZXMgPSBjaGFsbGVuZ2VzO1xuICAgIC8vIH0pO1xuICAgICRzY29wZS5jaGFsbGVuZ2VzID0gW107XG5cblx0XG5cdC8vIC8vU0NPUEUgTUVUSE9EU1xuICAgICRzY29wZS5jcmVhdGVOZXdFdmVudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBuZXdFdmVudCA9IHsgXG4gICAgICAgICAgICBwcmVmZXJlbmNlczogJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICBzbG90czogJHNjb3BlLmRhdGEuc2xvdHNcbiAgICAgICAgfVxuXG4gICAgICAgIEV2ZW50c0ZhY3RvcnkuY3JlYXRlRXZlbnQoIG5ld0V2ZW50IClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZXZlbnQgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVZFTlQgQURERUQhXCIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wZW5kaW5nRXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmNyZWF0ZUV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMgPSBcIlwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLnNsb3RzID0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5kZWxldGVFdmVudCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgRXZlbnRzRmFjdG9yeS5kZWxldGVFdmVudCggJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdIClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uIChldmVudClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmpvaW5FdmVudCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICBcdFxuICAgICAgICBpZigkc2NvcGUuZXZlbnRMYXVuY2hlZCkge1xuICAgICAgICBcdGNvbnNvbGUubG9nKFwidG9nZ2xlIGZyb21cIiwkc2NvcGUuZXZlbnRMYXVuY2hlZCk7XG4gICAgICAgIFx0JHNjb3BlLmV2ZW50TGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgXHQkc2NvcGUuZGlyZWN0RXZlbnRJRCA9ICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQ7XG4gICAgICAgIFx0JHNjb3BlLmV2ZW50TGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICBcdCRzY29wZS4kZW1pdCgncmVmcmVzaEV2ZW50T2JqJywgeyBcbiAgICAgICAgXHRcdGV2ZW50SUQ6ICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQsIGV2ZW50VHlwZTogJ3BlbmRpbmcnIFxuICAgIFx0XHRcdH0pO1xuICAgICAgICBcdCRzY29wZS4kZW1pdCgnbGF1bmNoRXZlbnQnLHsgXG4gICAgICAgIFx0XHRldmVudElEOiAkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0uX2lkLCBldmVudFR5cGU6ICdwZW5kaW5nJyBcbiAgICAgICAgXHR9KTtcbiAgICAgICAgXHRjb25zb2xlLmxvZyhcIkV2ZW50c0NvbnRyb2xsZXIgJ2xhdW5jaEV2ZW50JyAkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0uX2lkIGlkXCIsJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdLl9pZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4vLyAgICAgICAgRXZlbnRzRmFjdG9yeS5qb2luRXZlbnQoICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XSApXG4vLyAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGV2ZW50KSB7XG4vLyAgICAgICAgXHQkc2NvcGUud2FpdGluZyA9IHRydWU7XG4vLyAgICAgICAgICAgICRzY29wZS5ldmVudExhdW5jaGVkID0gdHJ1ZTtcbi8vICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpe1xuLy8gICAgICAgICAgICBcdGNvbnNvbGUubG9nKGVycik7XG4vLyAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQbGF5Q2FudmFzQ3RybCcsZnVuY3Rpb24oJHNjb3BlLCRzY2Upe1xuXHQgLy9wbGF5Q2FudmFzIFVSTCBjYW4gYmUgY2hhbmdlZCB0byBhbnl0aGluZyBpbmNsdWRpbmc6XG5cdCAvLyBGdWxsU3RhY2tCb3RzOiAvcGMvaW5kZXguaHRtbCAsXG5cdCAvLyBGU0I6IGh0dHA6Ly9wbGF5Y2Fudi5hcy9wL2JiTVFsTk10P3NlcnZlcj1mc2IsXG5cdCAvLyBUYW54OiBodHRwOi8vcGxheWNhbnYuYXMvcC9hUDBveGhVciAsXG5cdCAvLyBWb3lhZ2VyOiBodHRwOi8vcGxheWNhbnYuYXMvcC9NbVM3cngxaSAsXG5cdCAvLyBTd29vcDogaHR0cDovL3BsYXljYW52LmFzL3AvSnRMMmlxSUggLFxuXHQgLy8gSGFjazogaHR0cDovL3BsYXljYW52LmFzL3AvS1JFOFZuUm0gXG5cdFx0XG5cdC8vIHRydXN0QXNSZXNvdXJjZVVybCBjYW4gYmUgaGlnaGx5IGluc2VjdXJlIGlmIHlvdSBkbyBub3QgZmlsdGVyIGZvciBzZWN1cmUgVVJMc1xuXHQvLyBpdCBjb21wb3VuZHMgdGhlIHNlY3VyaXR5IHJpc2sgb2YgbWFsaWNpb3VzIGNvZGUgaW5qZWN0aW9uIGZyb20gdGhlIENvZGUgRWRpdG9yXG5cdFxuXHRjb25zb2xlLmxvZygnJHNjb3BlLiRwYXJlbnQuZGlyZWN0RXZlbnRJRCcsJHNjb3BlLiRwYXJlbnQuZGlyZWN0RXZlbnRJRCk7XG5cdCRzY29wZS5wbGF5Q2FudmFzVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoJy9wYy9pbmRleC5odG1sP3NlcnZlcj1mc2ImZXZlbnRJRD0nKyRzY29wZS4kcGFyZW50LmRpcmVjdEV2ZW50SUQpO1xuLy8vL1x0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYiZldmVudElEPScrJzU1NTlmNjAxMjNiMDI4YTUxNDNiNmU2MycpO1xuLy8vL1x0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYicpO1xuLy9cbi8vXHQkc2NvcGUuJG9uKCdsYXVuY2hFdmVudCcsZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuLy9cdFx0Y29uc29sZS5sb2coXCJQbGF5Q2FudmFzQ3RybCBkYXRhPVwiLGRhdGEpO1xuLy9cdFx0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYiZldmVudElEPScrZGF0YS5ldmVudElEKTtcbi8vXHR9KTtcblxufSk7XG5cbi8vIGFwcC5maWx0ZXIoJ3JhbmtGaWx0ZXInLCBmdW5jdGlvbiAoKSB7XG5cbi8vICAgcmV0dXJuIGZ1bmN0aW9uICggZXZlbnRzLCBudW1iZXIgKSB7XG4vLyAgICAgdmFyIGZpbHRlcmVkID0gW107XG4vLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAgIGlmICggZXZlbnRzW2ldLnJhbms8PSBudW1iZXIgKSB7XG4vLyAgICAgICAgIGZpbHRlcmVkLnB1c2goIGV2ZW50c1tpXSApO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gZmlsdGVyZWQ7XG4vLyAgIH07XG4vLyB9KTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnU29ja2V0JywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuXG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG5cbiAgICAgICAgdmFyIHNvY2tldDtcblxuICAgICAgICBpZiAoJGxvY2F0aW9uLiQkcG9ydCkge1xuICAgICAgICAgICAgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc29ja2V0ID0gaW8oJy8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzb2NrZXQ7XG5cbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCdcbiAgICB9KTtcbn0pO1xuXG5hcHAuZmFjdG9yeSgnYm90Q29kZUZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRCb3Q6IGZ1bmN0aW9uIChib3QpIHtcbiAgICAgICAgXHRcbiAgICAgICAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHtcbiAgICAgICAgICAgIFx0XHRib3Q6IGJvdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCFib3QpIHtcbiAgICAgICAgICAgIFx0Y29uc29sZS5sb2coXCJubyBib3RcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2Rpc3BhdGNoZXIvcmVhZEZpbGUvJywge1xuICAgICAgICAgICAgICAgIHBhcmFtczogcXVlcnlQYXJhbXNcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBcdC8vcmV0dXJuIHRvIGNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmVCb3Q6IGZ1bmN0aW9uIChib3QpIHtcbi8vICAgICAgICBcdGlmKCFib3QuX2lkKXtcbi8vICAgICAgICBcdFx0Ym90Ll9pZCA9ICc1NTU2NDYzYWFhZGZkYjMzNDMzYjYzYjUnO1xuLy8gICAgICAgIFx0fVxuICAgICAgICBcdFxuICAgICAgICBcdHZhciBkYXRhOyAvL2RhdGEgcGFja2V0IHRvIHNlbmRcbiAgICAgICAgXHRkYXRhID0geyBib3Q6IGJvdCB9O1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kaXNwYXRjaGVyL3NhdmVGaWxlLycsIGRhdGEpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4vLyAgICAgICAgICAgICAgICB1cGRhdGUuY3VycmVudE9yZGVyID0gcmVzLmRhdGE7XG4vLyAgICAgICAgICAgICAgICB1cGRhdGUuanVzdE9yZGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgXHRjb25zb2xlLmxvZygnc2F2ZUZpbGUgcmVzLmRhdGEnLHJlcy5kYXRhKTtcbiAgICAgICAgICAgIFx0cmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgICB9KTsgIFxuICAgICAgICB9XG5cbiAgICB9O1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0NvZGVFZGl0b3JDdHJsJyxmdW5jdGlvbigkc2NvcGUsIGJvdENvZGVGYWN0b3J5KXtcblxuXHQkc2NvcGUuYm90ID0ge307XG5cdFxuXHQvL0NvdWxkIGFsc28gYmUgYSBQYW5lbCBvZiBUYWJzLCBUT0RPIHVwb24gc2VsZWN0aW9uIG9yIGZvcmtpbmcgb2YgYSBib3Rcblx0Ym90Q29kZUZhY3RvcnkuZ2V0Qm90KCc1NTU2NDYzYWFhZGZkYjMzNDMzYjYzYjUnKS50aGVuKGZ1bmN0aW9uKGJvdCl7XG5cdFx0Y29uc29sZS5sb2coXCJjb250cm9sbGVyIGRhdGFcIixib3QpO1xuXHRcdCRzY29wZS5ib3QuYm90Q29kZSA9IGJvdC5ib3RDb2RlO1xuXHRcdCRzY29wZS5ib3QuX2lkID0gYm90Ll9pZDtcblxuXHR9KTtcblx0XG5cdCRzY29wZS5zYXZlQm90ID0gZnVuY3Rpb24oKXtcblx0XHRib3RDb2RlRmFjdG9yeS5zYXZlQm90KCRzY29wZS5ib3QpO1xuXHR9O1xuXHRcblx0Ly8gdWkuYWNlIHN0YXJ0XG5cdCRzY29wZS5hY2VMb2FkZWQgPSBmdW5jdGlvbihfZWRpdG9yKSB7XG5cdFx0Ly8gT3B0aW9uc1xuXHRcdF9lZGl0b3Iuc2V0UmVhZE9ubHkoZmFsc2UpO1xuXHR9O1xuXHQkc2NvcGUuYWNlQ2hhbmdlZCA9IGZ1bmN0aW9uKGUpIHtcblx0XHQvL1xuXHR9O1xuXHRcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQ29kZUNvbnNvbGVDdHJsJyxmdW5jdGlvbigkc2NvcGUpe1xuXHQvL0NvZGUgb3V0cHV0LCBjb25zb2xlIGxvZ3MsIGVycm9ycyBldGMuXG5cdFxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdCdXR0b25zQ3RybCcsZnVuY3Rpb24oJHNjb3BlKXtcblx0Ly9QcmFjdGljZSBhbmQvb3IgQ29tcGV0ZVxuXHRcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU2lkZU1lbnVDdHJsJyxmdW5jdGlvbigkc2NvcGUpe1xuXHQvL0NoYXQsIFJlcG8sIEZBUS4gZXRjXG5cdFxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdtc2dDdHJsJyxmdW5jdGlvbigkc2NvcGUpIHtcbiAgICBpZiAodHlwZW9mKEV2ZW50U291cmNlKSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIFx0XG4gICAgICAgIC8vIFllcyEgU2VydmVyLXNlbnQgZXZlbnRzIHN1cHBvcnQhXG4gICAgICAgIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9hcGkvZGlzcGF0Y2hlci8nKTtcbiAgICAgICAgc291cmNlLm9ub3BlbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJvcGVuXCIsZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBjcmVhdCBhbiBldmVudEhhbmRsZXIgZm9yIHdoZW4gYSBtZXNzYWdlIGlzIHJlY2VpdmVkXG4gICAgICAgIHNvdXJjZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBcdCAgY29uc29sZS5sb2coJ21lc3NhYWdlIGRhdGE6JyxldmVudC5kYXRhKTtcbiAgICAgICAgXHQgICRzY29wZS5tc2cgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuLy8gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5tc2cpO1xuICAgICAgICB9O1xuICAgICAgICBzb3VyY2Uub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJlcnJvclwiLGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuXHQgICAgLy8gU29ycnkhIE5vIHNlcnZlci1zZW50IGV2ZW50cyBzdXBwb3J0Li5cblx0ICAgIGNvbnNvbGUubG9nKCdTU0Ugbm90IHN1cHBvcnRlZCBieSBicm93c2VyLicpO1xuXHR9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZXZlbnRzJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndHV0b3JpYWwnLCB7XG4gICAgICAgIHVybDogJy90dXRvcmlhbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdUdXRvcmlhbEN0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICB0dXRvcmlhbEluZm86IGZ1bmN0aW9uIChUdXRvcmlhbEZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVHV0b3JpYWxGYWN0b3J5LmdldFR1dG9yaWFsVmlkZW9zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdUdXRvcmlhbEZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFR1dG9yaWFsVmlkZW9zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3R1dG9yaWFsL3ZpZGVvcycpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignVHV0b3JpYWxDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgdHV0b3JpYWxJbmZvKSB7XG5cbiAgICAkc2NvcGUuc2VjdGlvbnMgPSB0dXRvcmlhbEluZm8uc2VjdGlvbnM7XG4gICAgJHNjb3BlLnZpZGVvcyA9IF8uZ3JvdXBCeSh0dXRvcmlhbEluZm8udmlkZW9zLCAnc2VjdGlvbicpO1xuXG4gICAgJHNjb3BlLmN1cnJlbnRTZWN0aW9uID0geyBzZWN0aW9uOiBudWxsIH07XG5cbiAgICAkc2NvcGUuY29sb3JzID0gW1xuICAgICAgICAncmdiYSgzNCwgMTA3LCAyNTUsIDAuMTApJyxcbiAgICAgICAgJ3JnYmEoMjM4LCAyNTUsIDY4LCAwLjExKScsXG4gICAgICAgICdyZ2JhKDIzNCwgNTEsIDI1NSwgMC4xMSknLFxuICAgICAgICAncmdiYSgyNTUsIDE5MywgNzMsIDAuMTEpJyxcbiAgICAgICAgJ3JnYmEoMjIsIDI1NSwgMSwgMC4xMSknXG4gICAgXTtcblxuICAgICRzY29wZS5nZXRWaWRlb3NCeVNlY3Rpb24gPSBmdW5jdGlvbiAoc2VjdGlvbiwgdmlkZW9zKSB7XG4gICAgICAgIHJldHVybiB2aWRlb3MuZmlsdGVyKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZGVvLnNlY3Rpb24gPT09IHNlY3Rpb247XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdFdmVudHNGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldFBlbmRpbmdFdmVudHM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3BlbmRpbmcnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMaXZlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9saXZlJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9tZW1iZXJzLycsIGV2ZW50ICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgam9pbkV2ZW50OiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL21lbWJlcnMvJytldmVudC5faWQsIGV2ZW50ICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVsZXRlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvbWVtYmVycy8nK2V2ZW50Ll9pZCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJ1xuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbiIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxTZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBuYW1lOiAnQCcsXG4gICAgICAgICAgICB2aWRlb3M6ICc9JyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24vdHV0b3JpYWwtc2VjdGlvbi5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmNzcyh7IGJhY2tncm91bmQ6IHNjb3BlLmJhY2tncm91bmQgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxTZWN0aW9uTWVudScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwtc2VjdGlvbi1tZW51L3R1dG9yaWFsLXNlY3Rpb24tbWVudS5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHNlY3Rpb25zOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbEN0cmwpIHtcblxuICAgICAgICAgICAgc2NvcGUuY3VycmVudFNlY3Rpb24gPSBzY29wZS5zZWN0aW9uc1swXTtcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoc2NvcGUuY3VycmVudFNlY3Rpb24pO1xuXG4gICAgICAgICAgICBzY29wZS5zZXRTZWN0aW9uID0gZnVuY3Rpb24gKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBzY29wZS5jdXJyZW50U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShzZWN0aW9uKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCd0dXRvcmlhbFZpZGVvJywgZnVuY3Rpb24gKCRzY2UpIHtcblxuICAgIHZhciBmb3JtWW91dHViZVVSTCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZXR1cm4gJ2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLycgKyBpZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC12aWRlby90dXRvcmlhbC12aWRlby5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHZpZGVvOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS50cnVzdGVkWW91dHViZVVSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGZvcm1Zb3V0dWJlVVJMKHNjb3BlLnZpZGVvLnlvdXR1YmVJRCkpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2Fib3V0JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdUdXRvcmlhbCcsIHN0YXRlOiAndHV0b3JpYWwnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ01lbWJlcnMgT25seScsIHN0YXRlOiAnbWVtYmVyc09ubHknLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ3JhbmRvR3JlZXRpbmcnLCBmdW5jdGlvbiAoUmFuZG9tR3JlZXRpbmdzKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLmdyZWV0aW5nID0gUmFuZG9tR3JlZXRpbmdzLmdldFJhbmRvbUdyZWV0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=