'use strict';
var app = angular.module('FullstackBotsApp', ['ui.router', 'fsaPreBuilt', 'ui.ace', 'uuid']);

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
    $stateProvider.state('editor', {
        url: '/editor',
        templateUrl: 'js/editor/editor.html'
    });
});

app.controller('mainEditorCtrl', function ($scope, $stateParams) {
    $scope.eventsObj = {};
    $scope.$on('refreshEventObj', function (event, data) {
        $scope.eventsObj = data;
    });
});

app.controller('PlayCanvasEditorCtrl', function ($scope, $sce, uuid4) {

    $scope.simLaunched = false;

    $scope.$on('simmulate', function (event, bot) {
        if (!bot._id) {
            $scope.simLaunched = false;
        } else {
            var eventID = uuid4.generate();
            $scope.$emit('refreshEventObj', {
                eventID: eventID,
                botOneID: bot._id
            });
            $scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb' + '&eventID=' + eventID + '&botOneID=' + bot._id);
            $scope.simLaunched = true;
        }
    });
});

app.controller('CodeEditorCtrl', function ($scope, BotCodeFactory) {

    $scope.bot = {};

    //Could also be a Panel of Tabs, TODO upon selection or forking of a bot
    BotCodeFactory.getBot('555ba4d6a5f6226b30937fc4').then(function (bot) {
        $scope.bot = bot;
        //		$scope.bot.botCode = bot.botCode;
        //		$scope.bot._id = bot._id;
    });

    $scope.saveBot = function () {
        BotCodeFactory.saveBot($scope.bot);
    };

    $scope.simBot = function () {
        BotCodeFactory.saveBot($scope.bot);
        $scope.$emit('simmulate', $scope.bot);
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
    $scope.directEventID = '';

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
    $scope.botOneID = '555ba4d6a5f6226b30937fc4';
    $scope.eventLaunched = false;
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
            $scope.eventLaunched = false;
        } else {
            $scope.directEventID = $scope.pendingEvents[index]._id;
            $scope.eventLaunched = true;
            $scope.$emit('refreshEventObj', {
                eventID: $scope.pendingEvents[index]._id, eventType: 'pending',
                botOneID: $scope.botOneID
            });
            //        	$scope.$emit('launchEvent',{
            //        		eventID: $scope.pendingEvents[index]._id, eventType: 'pending',
            //        		botOneID: $scope.botOneID
            //        	});
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
    console.log('$scope.$parent.botOneID', $scope.$parent.botOneID);
    $scope.playCanvasURL = $sce.trustAsResourceUrl('/pc/index.html?server=fsb' + '&eventID=' + $scope.$parent.directEventID + '&botOneID=' + $scope.$parent.botOneID);
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
app.factory('BotCodeFactory', function ($http) {
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
            var data; //data packet to send
            data = { bot: bot };

            return $http.post('/api/dispatcher/saveFile/', data).then(function (res) {
                //                update.currentOrder = res.data;
                //                update.justOrdered = true;
                return res.data;
            }, function (err) {
                throw new Error(err);
            });
        }

    };
});

app.factory('BotFightFactory', function ($scope) {
    return {
        simBot: function simBot(bot) {
            $scope.$emit('simmulate', $scope.bot);
        },

        competeBot: function competeBot(bot) {}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYmF0dGxlL2JhdHRsZS5qcyIsImVkaXRvci9lZGl0b3IuanMiLCJldmVudHMvZXZlbnRzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC5qcyIsImNvbW1vbi9mYWN0b3JpZXMvQm90Q29kZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0JvdEZpZ2h0RmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRXZlbnRzRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Tb2NrZXQuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uL3R1dG9yaWFsLXNlY3Rpb24uanMiLCJ0dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uLW1lbnUvdHV0b3JpYWwtc2VjdGlvbi1tZW51LmpzIiwidHV0b3JpYWwvdHV0b3JpYWwtdmlkZW8vdHV0b3JpYWwtdmlkZW8uanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxJQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsYUFBQSxFQUFBLFFBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUE7O0FBRUEscUJBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7O0FBR0EsUUFBQSw0QkFBQSxHQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7S0FDQSxDQUFBOzs7O0FBSUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLDRCQUFBLENBQUEsT0FBQSxDQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7O0FBRUEsWUFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7OztBQUdBLGFBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7OztBQUlBLGdCQUFBLElBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7YUFDQSxNQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7YUFDQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2xEQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTs7O0FBR0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUNBLHVEQUFBLEVBQ0EscUhBQUEsRUFDQSxpREFBQSxFQUNBLGlEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUN4QkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxTQUFBO0FBQ0Esa0JBQUEsRUFBQSxrQkFBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxhQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxhQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7Ozs7QUFNQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7Ozs7O0FBTUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7OztBQUlBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTs7QUFFQSxZQUFBLFFBQUEsR0FBQTtBQUNBLHVCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7U0FDQSxDQUFBOztBQUVBLHFCQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEscUJBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLGtCQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7O0FDM0VBLFlBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFNBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtTQUNBLE1BQ0E7QUFDQSxnQkFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsaUJBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsT0FBQTtBQUNBLHdCQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUE7YUFDQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGFBQUEsR0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSwyQkFBQSxHQUNBLFdBQUEsR0FBQSxPQUFBLEdBQ0EsWUFBQSxHQUFBLEdBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQTtBQUNBLGtCQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxFQUFBLENBQUE7OztBQUdBLGtCQUFBLENBQUEsTUFBQSxDQUFBLDBCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsQ0FBQTs7O0tBSUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLHNCQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxlQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUFBLEVBQUEsRUFFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUdBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUdBLENBQUEsQ0FBQTs7QUMvRUEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxTQUFBO0FBQ0Esa0JBQUEsRUFBQSxrQkFBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLHFCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGtCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsMEJBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxhQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxhQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7Ozs7QUFNQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7Ozs7O0FBTUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7OztBQUlBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTs7QUFFQSxZQUFBLFFBQUEsR0FBQTtBQUNBLHVCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7U0FDQSxDQUFBOztBQUVBLHFCQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxrQkFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFHQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFlBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtTQUNBLE1BQ0E7QUFDQSxrQkFBQSxDQUFBLGFBQUEsR0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGlCQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBO0FBQ0Esd0JBQUEsRUFBQSxNQUFBLENBQUEsUUFBQTthQUNBLENBQUEsQ0FBQTs7Ozs7U0FLQTs7Ozs7Ozs7O0tBZUEsQ0FBQTtBQWZBLENBZ0JBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBOzs7Ozs7Ozs7Ozs7QUFZQSxXQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEseUJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGFBQUEsR0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSwyQkFBQSxHQUNBLFdBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsR0FDQSxZQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQ0EsQ0FBQTs7Ozs7Ozs7Q0FTQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7O0FDMUlBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLE1BQUEsQ0FBQTs7QUFFQSxZQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxrQkFBQSxHQUFBLEVBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7U0FDQSxNQUFBO0FBQ0Esa0JBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxlQUFBLE1BQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOzs7Ozs7QUFNQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBOzs7OztBQUtBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7QUMzSUEsWUFBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFHQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLE9BQUEsV0FBQSxLQUFBLFdBQUEsRUFBQTs7O0FBR0EsWUFBQSxNQUFBLEdBQUEsSUFBQSxXQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsY0FBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLGdCQUFBLEVBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7OztTQUdBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTtLQUNBLE1BQUE7O0FBRUEsZUFBQSxDQUFBLEdBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7S0FDQTtDQUNBLENBQUEsQ0FBQTtBQ3BDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxnQkFBQSxFQUFBLG1FQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7O0FBR0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFFBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDL0JBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0Esa0JBQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxzQkFBQSxlQUFBLEVBQUE7QUFDQSx1QkFBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSwwQkFBQSxFQUNBLDBCQUFBLEVBQ0EsMEJBQUEsRUFDQSwwQkFBQSxFQUNBLHdCQUFBLENBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsa0JBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxLQUFBLE9BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNqREEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQSxHQUFBLEVBQUE7O0FBRUEsZ0JBQUEsV0FBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUE7YUFDQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFdBQUE7YUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBOztBQUVBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxlQUFBLEVBQUEsaUJBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBOzs7QUFHQSx1QkFBQSxHQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLHNCQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7O0tBRUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUNuQ0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQSxHQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0E7O0FBRUEsa0JBQUEsRUFBQSxvQkFBQSxHQUFBLEVBQUEsRUFDQTs7S0FFQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ1ZBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUE7O0FBRUEsd0JBQUEsRUFBQSw0QkFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEscUJBQUEsRUFBQSx5QkFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEsaUJBQUEsRUFBQSxtQkFBQSxLQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxVQUFBLENBQUEsZUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDM0NBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBOztBQUVBLFFBQUEsa0JBQUEsR0FBQSxTQUFBLGtCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsU0FBQSxHQUFBLENBQ0EsZUFBQSxFQUNBLHVCQUFBLEVBQ0Esc0JBQUEsRUFDQSx1QkFBQSxFQUNBLHlEQUFBLEVBQ0EsMENBQUEsQ0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFNBQUE7QUFDQSx5QkFBQSxFQUFBLDZCQUFBO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3ZCQSxZQUFBLENBQUE7O0FDQUEsWUFBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsR0FBQTtBQUNBLHNCQUFBLEVBQUEsR0FBQTtTQUNBO0FBQ0EsbUJBQUEsRUFBQSxvREFBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ2ZBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxTQUFBLENBQUEscUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBO0FBQ0EsbUJBQUEsRUFBQSw4REFBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQTtTQUNBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLGNBQUEsR0FBQSxPQUFBLENBQUE7QUFDQSwyQkFBQSxDQUFBLGFBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBLENBQUE7U0FFQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNyQkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7O0FBRUEsUUFBQSxjQUFBLEdBQUEsU0FBQSxjQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxnQ0FBQSxHQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsZ0RBQUE7QUFDQSxhQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7U0FDQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsaUJBQUEsR0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDbEJBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNOQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHlDQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBOztBQUVBLGlCQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxLQUFBLEVBQUEsVUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsY0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSwyQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxPQUFBLEdBQUEsU0FBQSxPQUFBLEdBQUE7QUFDQSwyQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtpQkFDQSxDQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLGdCQUFBLFVBQUEsR0FBQSxTQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsbUJBQUEsRUFBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtTQUVBOztLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoREEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxlQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEseURBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0JvdHNBcHAnLCBbJ3VpLnJvdXRlcicsICdmc2FQcmVCdWlsdCcsICd1aS5hY2UnLCAndXVpZCddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAvLyBSZWdpc3RlciBvdXIgKmFib3V0KiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWJvdXQnLCB7XG4gICAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBYm91dENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Fib3V0L2Fib3V0Lmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWJvdXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSkge1xuXG4gICAgLy8gSW1hZ2VzIG9mIGJlYXV0aWZ1bCBGdWxsc3RhY2sgcGVvcGxlLlxuICAgICRzY29wZS5pbWFnZXMgPSBbXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjdnQlh1bENBQUFYUWNFLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNzktWDdvQ01BQWt3N3kuanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJ1xuICAgIF07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2JhdHRsZScsIHtcbiAgICAgICAgdXJsOiAnL2JhdHRsZScsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiRXZlbnRzQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2V2ZW50cy9iYXR0bGUuaHRtbCdcbiAgICAgICAgLy8gLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhZG1pbjogdHJ1ZVxuICAgICAgICAvLyB9XG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0V2ZW50c0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIEV2ZW50c0ZhY3RvcnkpIHtcblxuICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBwcmVmZXJlbmNlczogXCJcIixcbiAgICAgICAgc2xvdHM6IDEsXG4gICAgICAgIGNyZWF0ZUV2ZW50OiBmYWxzZVxuICAgIH07XG5cbiAgICAkc2NvcGUud2FpdGluZyA9IGZhbHNlO1xuXG4gICAgaWYgKCEkc2NvcGUucGVuZGluZ0V2ZW50cykgRXZlbnRzRmFjdG9yeS5nZXRQZW5kaW5nRXZlbnRzKCkudGhlbihmdW5jdGlvbihldmVudHMpe1xuICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cyA9IGV2ZW50cztcbiAgICB9KTtcblxuICAgIC8vVE9ET1xuXHQvLyBpZiAoISRzY29wZS5saXZlRXZlbnRzKSBFdmVudHNGYWN0b3J5LmdldExpdmVFdmVudHMoKS50aGVuKGZ1bmN0aW9uKGV2ZW50cyl7XG5cdC8vIFx0JHNjb3BlLmxpdmVFdmVudHMgPSBldmVudHM7XG5cdC8vIH0pO1xuICAgICRzY29wZS5saXZlRXZlbnRzID0gW107XG5cbiAgICAvL1RPRE9cbiAgICAvLyBpZiAoISRzY29wZS5jaGFsbGVuZ2VzKSBFdmVudHNGYWN0b3J5LmdldFBlbmRpbmdDaGFsbGVuZ2VzKCkudGhlbihmdW5jdGlvbihjaGFsbGVuZ2VzKXtcbiAgICAvLyAgICAgJHNjb3BlLmNoYWxsZW5nZXMgPSBjaGFsbGVuZ2VzO1xuICAgIC8vIH0pO1xuICAgICRzY29wZS5jaGFsbGVuZ2VzID0gW107XG5cblx0XG5cdC8vIC8vU0NPUEUgTUVUSE9EU1xuICAgICRzY29wZS5jcmVhdGVOZXdFdmVudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBuZXdFdmVudCA9IHsgXG4gICAgICAgICAgICBwcmVmZXJlbmNlczogJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICBzbG90czogJHNjb3BlLmRhdGEuc2xvdHNcbiAgICAgICAgfVxuXG4gICAgICAgIEV2ZW50c0ZhY3RvcnkuY3JlYXRlRXZlbnQoIG5ld0V2ZW50IClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZXZlbnQgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVZFTlQgQURERUQhXCIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wZW5kaW5nRXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmNyZWF0ZUV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMgPSBcIlwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLnNsb3RzID0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5kZWxldGVFdmVudCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgRXZlbnRzRmFjdG9yeS5kZWxldGVFdmVudCggJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdIClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uIChldmVudClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmpvaW5FdmVudCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcblxuICAgICAgICBFdmVudHNGYWN0b3J5LmpvaW5FdmVudCggJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdIClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uIChldmVudClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICRzY29wZS53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4vLyBhcHAuZmlsdGVyKCdyYW5rRmlsdGVyJywgZnVuY3Rpb24gKCkge1xuXG4vLyAgIHJldHVybiBmdW5jdGlvbiAoIGV2ZW50cywgbnVtYmVyICkge1xuLy8gICAgIHZhciBmaWx0ZXJlZCA9IFtdO1xuLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4vLyAgICAgICBpZiAoIGV2ZW50c1tpXS5yYW5rPD0gbnVtYmVyICkge1xuLy8gICAgICAgICBmaWx0ZXJlZC5wdXNoKCBldmVudHNbaV0gKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgcmV0dXJuIGZpbHRlcmVkO1xuLy8gICB9O1xuLy8gfSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdlZGl0b3InLCB7XG4gICAgICAgIHVybDogJy9lZGl0b3InLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2VkaXRvci9lZGl0b3IuaHRtbCdcbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbWFpbkVkaXRvckN0cmwnLGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zKXtcblx0JHNjb3BlLmV2ZW50c09iaiA9IHt9O1xuXHQkc2NvcGUuJG9uKCdyZWZyZXNoRXZlbnRPYmonLGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcblx0XHQkc2NvcGUuZXZlbnRzT2JqID0gZGF0YTtcblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1BsYXlDYW52YXNFZGl0b3JDdHJsJyxmdW5jdGlvbigkc2NvcGUsJHNjZSx1dWlkNCl7XG5cblx0JHNjb3BlLnNpbUxhdW5jaGVkID0gZmFsc2U7XG5cdFxuICAgICRzY29wZS4kb24oJ3NpbW11bGF0ZScsZnVuY3Rpb24oZXZlbnQsIGJvdCkge1xuICAgIFx0aWYoIWJvdC5faWQpIHtcbiAgICAgICAgXHQkc2NvcGUuc2ltTGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgXHR2YXIgZXZlbnRJRCA9IHV1aWQ0LmdlbmVyYXRlKCk7XG4gICAgICAgIFx0JHNjb3BlLiRlbWl0KCdyZWZyZXNoRXZlbnRPYmonLCB7IFxuICAgICAgICBcdFx0ZXZlbnRJRDogZXZlbnRJRCxcbiAgICAgICAgXHRcdGJvdE9uZUlEOiBib3QuX2lkXG5cdFx0XHR9KTtcbiAgICAgICAgXHQkc2NvcGUucGxheUNhbnZhc1VSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKCcvcGMvaW5kZXguaHRtbD9zZXJ2ZXI9ZnNiJ1xuXHRcdFx0XHQrJyZldmVudElEPScrZXZlbnRJRFxuXHRcdFx0XHQrXCImYm90T25lSUQ9XCIrYm90Ll9pZFxuXHRcdFx0KTtcbiAgICAgICAgXHQkc2NvcGUuc2ltTGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0NvZGVFZGl0b3JDdHJsJyxmdW5jdGlvbigkc2NvcGUsIEJvdENvZGVGYWN0b3J5KXtcblxuXHQkc2NvcGUuYm90ID0ge307XG5cdFxuXHQvL0NvdWxkIGFsc28gYmUgYSBQYW5lbCBvZiBUYWJzLCBUT0RPIHVwb24gc2VsZWN0aW9uIG9yIGZvcmtpbmcgb2YgYSBib3Rcblx0Qm90Q29kZUZhY3RvcnkuZ2V0Qm90KCc1NTViYTRkNmE1ZjYyMjZiMzA5MzdmYzQnKS50aGVuKGZ1bmN0aW9uKGJvdCl7XG5cdFx0JHNjb3BlLmJvdCA9IGJvdDtcbi8vXHRcdCRzY29wZS5ib3QuYm90Q29kZSA9IGJvdC5ib3RDb2RlO1xuLy9cdFx0JHNjb3BlLmJvdC5faWQgPSBib3QuX2lkO1xuXG5cdH0pO1xuXHRcblx0JHNjb3BlLnNhdmVCb3QgPSBmdW5jdGlvbigpe1xuXHRcdEJvdENvZGVGYWN0b3J5LnNhdmVCb3QoJHNjb3BlLmJvdCk7XG5cdH07XG5cdFxuXHQkc2NvcGUuc2ltQm90ID0gZnVuY3Rpb24oKXtcblx0XHRCb3RDb2RlRmFjdG9yeS5zYXZlQm90KCRzY29wZS5ib3QpO1xuXHRcdCRzY29wZS4kZW1pdCgnc2ltbXVsYXRlJywgJHNjb3BlLmJvdCk7XG5cdH07XG5cdFxuXHQvLyB1aS5hY2Ugc3RhcnRcblx0JHNjb3BlLmFjZUxvYWRlZCA9IGZ1bmN0aW9uKF9lZGl0b3IpIHtcblx0XHQvLyBPcHRpb25zXG5cdFx0X2VkaXRvci5zZXRSZWFkT25seShmYWxzZSk7XG5cdH07XG5cdCRzY29wZS5hY2VDaGFuZ2VkID0gZnVuY3Rpb24oZSkge1xuXHRcdC8vXG5cdH07XG5cdFxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdDb2RlQ29uc29sZUN0cmwnLGZ1bmN0aW9uKCRzY29wZSl7XG5cdC8vQ29kZSBvdXRwdXQsIGNvbnNvbGUgbG9ncywgZXJyb3JzIGV0Yy5cblx0XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0J1dHRvbnNDdHJsJyxmdW5jdGlvbigkc2NvcGUpe1xuXHQvL1ByYWN0aWNlIGFuZC9vciBDb21wZXRlXG5cdFxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdldmVudHMnLCB7XG4gICAgICAgIHVybDogJy9ldmVudHMnLFxuICAgICAgICBjb250cm9sbGVyOiBcIkV2ZW50c0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ldmVudHMvZXZlbnRzLmh0bWwnXG4gICAgICAgIC8vICxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYWRtaW46IHRydWVcbiAgICAgICAgLy8gfVxuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdtYWluRXZlbnRDdHJsJyxmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcyl7XG4gICAgJHNjb3BlLmRpcmVjdEV2ZW50SUQgPSBcIlwiO1xuICAgIFxuXHQkc2NvcGUuZXZlbnRzT2JqID0ge307XG5cdGNvbnNvbGUubG9nKFwicmV2aXNlZCBtYWluRXZlbnRDdHJsXCIpO1xuXHQkc2NvcGUuJG9uKCdyZWZyZXNoRXZlbnRPYmonLGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcblx0XHRjb25zb2xlLmxvZyhcIm1haW5FdmVudEN0cmwgZGF0YT1cIixkYXRhKTtcblx0XHQkc2NvcGUuZXZlbnRzT2JqID0gZGF0YTtcblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0V2ZW50c0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIEV2ZW50c0ZhY3RvcnksICRyb290U2NvcGUpIHtcblxuICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBwcmVmZXJlbmNlczogXCJcIixcbiAgICAgICAgc2xvdHM6IDEsXG4gICAgICAgIGNyZWF0ZUV2ZW50OiBmYWxzZVxuICAgIH07XG4gICAgJHNjb3BlLmJvdE9uZUlEID0gXCI1NTViYTRkNmE1ZjYyMjZiMzA5MzdmYzRcIjtcbiAgICAkc2NvcGUuZXZlbnRMYXVuY2hlZCA9IGZhbHNlO1xuICAgICRzY29wZS53YWl0aW5nID0gZmFsc2U7XG4gICAgaWYgKCEkc2NvcGUucGVuZGluZ0V2ZW50cykgRXZlbnRzRmFjdG9yeS5nZXRQZW5kaW5nRXZlbnRzKCkudGhlbihmdW5jdGlvbihldmVudHMpe1xuICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cyA9IGV2ZW50cztcbiAgICB9KTtcblxuICAgIC8vVE9ET1xuXHQvLyBpZiAoISRzY29wZS5saXZlRXZlbnRzKSBFdmVudHNGYWN0b3J5LmdldExpdmVFdmVudHMoKS50aGVuKGZ1bmN0aW9uKGV2ZW50cyl7XG5cdC8vIFx0JHNjb3BlLmxpdmVFdmVudHMgPSBldmVudHM7XG5cdC8vIH0pO1xuICAgICRzY29wZS5saXZlRXZlbnRzID0gW107XG5cbiAgICAvL1RPRE9cbiAgICAvLyBpZiAoISRzY29wZS5jaGFsbGVuZ2VzKSBFdmVudHNGYWN0b3J5LmdldFBlbmRpbmdDaGFsbGVuZ2VzKCkudGhlbihmdW5jdGlvbihjaGFsbGVuZ2VzKXtcbiAgICAvLyAgICAgJHNjb3BlLmNoYWxsZW5nZXMgPSBjaGFsbGVuZ2VzO1xuICAgIC8vIH0pO1xuICAgICRzY29wZS5jaGFsbGVuZ2VzID0gW107XG5cblx0XG5cdC8vIC8vU0NPUEUgTUVUSE9EU1xuICAgICRzY29wZS5jcmVhdGVOZXdFdmVudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBuZXdFdmVudCA9IHsgXG4gICAgICAgICAgICBwcmVmZXJlbmNlczogJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICBzbG90czogJHNjb3BlLmRhdGEuc2xvdHNcbiAgICAgICAgfVxuXG4gICAgICAgIEV2ZW50c0ZhY3RvcnkuY3JlYXRlRXZlbnQoIG5ld0V2ZW50IClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZXZlbnQgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICRzY29wZS5wZW5kaW5nRXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmNyZWF0ZUV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMgPSBcIlwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLnNsb3RzID0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5kZWxldGVFdmVudCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgRXZlbnRzRmFjdG9yeS5kZWxldGVFdmVudCggJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdIClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uIChldmVudClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAkc2NvcGUuam9pbkV2ZW50ID0gZnVuY3Rpb24oIGluZGV4ICkge1xuICAgIFx0XG4gICAgICAgIGlmKCRzY29wZS5ldmVudExhdW5jaGVkKSB7XG4gICAgICAgIFx0JHNjb3BlLmV2ZW50TGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgXHQkc2NvcGUuZGlyZWN0RXZlbnRJRCA9ICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQ7XG4gICAgICAgIFx0JHNjb3BlLmV2ZW50TGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICBcdCRzY29wZS4kZW1pdCgncmVmcmVzaEV2ZW50T2JqJywgeyBcbiAgICAgICAgXHRcdGV2ZW50SUQ6ICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQsIGV2ZW50VHlwZTogJ3BlbmRpbmcnLFxuICAgICAgICBcdFx0Ym90T25lSUQ6ICRzY29wZS5ib3RPbmVJRFxuICAgIFx0XHRcdH0pO1xuLy8gICAgICAgIFx0JHNjb3BlLiRlbWl0KCdsYXVuY2hFdmVudCcseyBcbi8vICAgICAgICBcdFx0ZXZlbnRJRDogJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdLl9pZCwgZXZlbnRUeXBlOiAncGVuZGluZycsXG4vLyAgICAgICAgXHRcdGJvdE9uZUlEOiAkc2NvcGUuYm90T25lSURcbi8vICAgICAgICBcdH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuLy8gICAgICAgIEV2ZW50c0ZhY3Rvcnkuam9pbkV2ZW50KCAkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0gKVxuLy8gICAgICAgIC50aGVuKGZ1bmN0aW9uIChldmVudCkge1xuLy8gICAgICAgIFx0JHNjb3BlLndhaXRpbmcgPSB0cnVlO1xuLy8gICAgICAgICAgICAkc2NvcGUuZXZlbnRMYXVuY2hlZCA9IHRydWU7XG4vLyAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbi8vICAgICAgICAgICAgXHRjb25zb2xlLmxvZyhlcnIpO1xuLy8gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbn0pO1xuXG5hcHAuY29udHJvbGxlcignUGxheUNhbnZhc0N0cmwnLGZ1bmN0aW9uKCRzY29wZSwkc2NlKXtcblx0IC8vcGxheUNhbnZhcyBVUkwgY2FuIGJlIGNoYW5nZWQgdG8gYW55dGhpbmcgaW5jbHVkaW5nOlxuXHQgLy8gRnVsbFN0YWNrQm90czogL3BjL2luZGV4Lmh0bWwgLFxuXHQgLy8gRlNCOiBodHRwOi8vcGxheWNhbnYuYXMvcC9iYk1RbE5NdD9zZXJ2ZXI9ZnNiLFxuXHQgLy8gVGFueDogaHR0cDovL3BsYXljYW52LmFzL3AvYVAwb3hoVXIgLFxuXHQgLy8gVm95YWdlcjogaHR0cDovL3BsYXljYW52LmFzL3AvTW1TN3J4MWkgLFxuXHQgLy8gU3dvb3A6IGh0dHA6Ly9wbGF5Y2Fudi5hcy9wL0p0TDJpcUlIICxcblx0IC8vIEhhY2s6IGh0dHA6Ly9wbGF5Y2Fudi5hcy9wL0tSRThWblJtIFxuXHRcdFxuXHQvLyB0cnVzdEFzUmVzb3VyY2VVcmwgY2FuIGJlIGhpZ2hseSBpbnNlY3VyZSBpZiB5b3UgZG8gbm90IGZpbHRlciBmb3Igc2VjdXJlIFVSTHNcblx0Ly8gaXQgY29tcG91bmRzIHRoZSBzZWN1cml0eSByaXNrIG9mIG1hbGljaW91cyBjb2RlIGluamVjdGlvbiBmcm9tIHRoZSBDb2RlIEVkaXRvclxuXHRcblx0Y29uc29sZS5sb2coJyRzY29wZS4kcGFyZW50LmRpcmVjdEV2ZW50SUQnLCRzY29wZS4kcGFyZW50LmRpcmVjdEV2ZW50SUQpO1xuXHRjb25zb2xlLmxvZygnJHNjb3BlLiRwYXJlbnQuYm90T25lSUQnLCRzY29wZS4kcGFyZW50LmJvdE9uZUlEKTtcblx0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYidcblx0XHRcdCsnJmV2ZW50SUQ9Jyskc2NvcGUuJHBhcmVudC5kaXJlY3RFdmVudElEXG5cdFx0XHQrXCImYm90T25lSUQ9XCIrJHNjb3BlLiRwYXJlbnQuYm90T25lSURcblx0XHRcdCk7XG4vLy8vXHQkc2NvcGUucGxheUNhbnZhc1VSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKCcvcGMvaW5kZXguaHRtbD9zZXJ2ZXI9ZnNiJmV2ZW50SUQ9JysnNTU1OWY2MDEyM2IwMjhhNTE0M2I2ZTYzJyk7XG4vLy8vXHQkc2NvcGUucGxheUNhbnZhc1VSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKCcvcGMvaW5kZXguaHRtbD9zZXJ2ZXI9ZnNiJyk7XG4vL1xuLy9cdCRzY29wZS4kb24oJ2xhdW5jaEV2ZW50JyxmdW5jdGlvbihldmVudCwgZGF0YSl7XG4vL1x0XHRjb25zb2xlLmxvZyhcIlBsYXlDYW52YXNDdHJsIGRhdGE9XCIsZGF0YSk7XG4vL1x0XHQkc2NvcGUucGxheUNhbnZhc1VSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKCcvcGMvaW5kZXguaHRtbD9zZXJ2ZXI9ZnNiJmV2ZW50SUQ9JytkYXRhLmV2ZW50SUQpO1xuLy9cdH0pO1xuXG59KTtcblxuLy8gYXBwLmZpbHRlcigncmFua0ZpbHRlcicsIGZ1bmN0aW9uICgpIHtcblxuLy8gICByZXR1cm4gZnVuY3Rpb24gKCBldmVudHMsIG51bWJlciApIHtcbi8vICAgICB2YXIgZmlsdGVyZWQgPSBbXTtcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuLy8gICAgICAgaWYgKCBldmVudHNbaV0ucmFuazw9IG51bWJlciApIHtcbi8vICAgICAgICAgZmlsdGVyZWQucHVzaCggZXZlbnRzW2ldICk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiBmaWx0ZXJlZDtcbi8vICAgfTtcbi8vIH0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcblxuICAgICAgICB2YXIgc29ja2V0O1xuXG4gICAgICAgIGlmICgkbG9jYXRpb24uJCRwb3J0KSB7XG4gICAgICAgICAgICBzb2NrZXQgPSBpbygnaHR0cDovL2xvY2FsaG9zdDoxMzM3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb2NrZXQgPSBpbygnLycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNvY2tldDtcblxuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAoc2Vzc2lvbklkLCB1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSkoKTsiLCIndXNlIHN0cmljdCc7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTaWRlTWVudUN0cmwnLGZ1bmN0aW9uKCRzY29wZSl7XG5cdC8vQ2hhdCwgUmVwbywgRkFRLiBldGNcblx0XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ21zZ0N0cmwnLGZ1bmN0aW9uKCRzY29wZSkge1xuICAgIGlmICh0eXBlb2YoRXZlbnRTb3VyY2UpICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgXHRcbiAgICAgICAgLy8gWWVzISBTZXJ2ZXItc2VudCBldmVudHMgc3VwcG9ydCFcbiAgICAgICAgdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL2FwaS9kaXNwYXRjaGVyLycpO1xuICAgICAgICBzb3VyY2Uub25vcGVuID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgXHRjb25zb2xlLmxvZyhcIm9wZW5cIixldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGNyZWF0IGFuIGV2ZW50SGFuZGxlciBmb3Igd2hlbiBhIG1lc3NhZ2UgaXMgcmVjZWl2ZWRcbiAgICAgICAgc291cmNlLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIFx0ICBjb25zb2xlLmxvZygnbWVzc2FhZ2UgZGF0YTonLGV2ZW50LmRhdGEpO1xuICAgICAgICBcdCAgJHNjb3BlLm1zZyA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4vLyAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm1zZyk7XG4gICAgICAgIH07XG4gICAgICAgIHNvdXJjZS5vbmVycm9yID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgXHRjb25zb2xlLmxvZyhcImVycm9yXCIsZXZlbnQpO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG5cdCAgICAvLyBTb3JyeSEgTm8gc2VydmVyLXNlbnQgZXZlbnRzIHN1cHBvcnQuLlxuXHQgICAgY29uc29sZS5sb2coJ1NTRSBub3Qgc3VwcG9ydGVkIGJ5IGJyb3dzZXIuJyk7XG5cdH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5zZW5kTG9naW4gPSBmdW5jdGlvbiAobG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdldmVudHMnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lbWJlcnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0dXRvcmlhbCcsIHtcbiAgICAgICAgdXJsOiAnL3R1dG9yaWFsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1R1dG9yaWFsQ3RybCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIHR1dG9yaWFsSW5mbzogZnVuY3Rpb24gKFR1dG9yaWFsRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUdXRvcmlhbEZhY3RvcnkuZ2V0VHV0b3JpYWxWaWRlb3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1R1dG9yaWFsRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0VHV0b3JpYWxWaWRlb3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHV0b3JpYWwvdmlkZW9zJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdUdXRvcmlhbEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCB0dXRvcmlhbEluZm8pIHtcblxuICAgICRzY29wZS5zZWN0aW9ucyA9IHR1dG9yaWFsSW5mby5zZWN0aW9ucztcbiAgICAkc2NvcGUudmlkZW9zID0gXy5ncm91cEJ5KHR1dG9yaWFsSW5mby52aWRlb3MsICdzZWN0aW9uJyk7XG5cbiAgICAkc2NvcGUuY3VycmVudFNlY3Rpb24gPSB7IHNlY3Rpb246IG51bGwgfTtcblxuICAgICRzY29wZS5jb2xvcnMgPSBbXG4gICAgICAgICdyZ2JhKDM0LCAxMDcsIDI1NSwgMC4xMCknLFxuICAgICAgICAncmdiYSgyMzgsIDI1NSwgNjgsIDAuMTEpJyxcbiAgICAgICAgJ3JnYmEoMjM0LCA1MSwgMjU1LCAwLjExKScsXG4gICAgICAgICdyZ2JhKDI1NSwgMTkzLCA3MywgMC4xMSknLFxuICAgICAgICAncmdiYSgyMiwgMjU1LCAxLCAwLjExKSdcbiAgICBdO1xuXG4gICAgJHNjb3BlLmdldFZpZGVvc0J5U2VjdGlvbiA9IGZ1bmN0aW9uIChzZWN0aW9uLCB2aWRlb3MpIHtcbiAgICAgICAgcmV0dXJuIHZpZGVvcy5maWx0ZXIoZnVuY3Rpb24gKHZpZGVvKSB7XG4gICAgICAgICAgICByZXR1cm4gdmlkZW8uc2VjdGlvbiA9PT0gc2VjdGlvbjtcbiAgICAgICAgfSk7XG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0JvdENvZGVGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0Qm90OiBmdW5jdGlvbiAoYm90KSB7XG4gICAgICAgIFx0XG4gICAgICAgICAgICB2YXIgcXVlcnlQYXJhbXMgPSB7XG4gICAgICAgICAgICBcdFx0Ym90OiBib3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghYm90KSB7XG4gICAgICAgICAgICBcdGNvbnNvbGUubG9nKFwibm8gYm90XCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9kaXNwYXRjaGVyL3JlYWRGaWxlLycsIHtcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5UGFyYW1zXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgXHQvL3JldHVybiB0byBjb250cm9sbGVyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzYXZlQm90OiBmdW5jdGlvbiAoYm90KSB7XG4gICAgICAgIFx0dmFyIGRhdGE7IC8vZGF0YSBwYWNrZXQgdG8gc2VuZFxuICAgICAgICBcdGRhdGEgPSB7IGJvdDogYm90IH07XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2Rpc3BhdGNoZXIvc2F2ZUZpbGUvJywgZGF0YSkudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vICAgICAgICAgICAgICAgIHVwZGF0ZS5jdXJyZW50T3JkZXIgPSByZXMuZGF0YTtcbi8vICAgICAgICAgICAgICAgIHVwZGF0ZS5qdXN0T3JkZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBcdHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfVxuXG4gICAgfTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ0JvdEZpZ2h0RmFjdG9yeScsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaW1Cb3Q6IGZ1bmN0aW9uIChib3QpIHtcbiAgICBcdFx0JHNjb3BlLiRlbWl0KCdzaW1tdWxhdGUnLCAkc2NvcGUuYm90KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb21wZXRlQm90OiBmdW5jdGlvbiAoYm90KSB7XG4gICAgICAgIH1cblxuICAgIH07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdFdmVudHNGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldFBlbmRpbmdFdmVudHM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3BlbmRpbmcnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMaXZlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9saXZlJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9tZW1iZXJzLycsIGV2ZW50ICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgam9pbkV2ZW50OiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL21lbWJlcnMvJytldmVudC5faWQsIGV2ZW50ICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVsZXRlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvbWVtYmVycy8nK2V2ZW50Ll9pZCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJ1xuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbiIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxTZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBuYW1lOiAnQCcsXG4gICAgICAgICAgICB2aWRlb3M6ICc9JyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24vdHV0b3JpYWwtc2VjdGlvbi5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmNzcyh7IGJhY2tncm91bmQ6IHNjb3BlLmJhY2tncm91bmQgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxTZWN0aW9uTWVudScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwtc2VjdGlvbi1tZW51L3R1dG9yaWFsLXNlY3Rpb24tbWVudS5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHNlY3Rpb25zOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbEN0cmwpIHtcblxuICAgICAgICAgICAgc2NvcGUuY3VycmVudFNlY3Rpb24gPSBzY29wZS5zZWN0aW9uc1swXTtcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoc2NvcGUuY3VycmVudFNlY3Rpb24pO1xuXG4gICAgICAgICAgICBzY29wZS5zZXRTZWN0aW9uID0gZnVuY3Rpb24gKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBzY29wZS5jdXJyZW50U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShzZWN0aW9uKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCd0dXRvcmlhbFZpZGVvJywgZnVuY3Rpb24gKCRzY2UpIHtcblxuICAgIHZhciBmb3JtWW91dHViZVVSTCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZXR1cm4gJ2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLycgKyBpZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC12aWRlby90dXRvcmlhbC12aWRlby5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHZpZGVvOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS50cnVzdGVkWW91dHViZVVSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGZvcm1Zb3V0dWJlVVJMKHNjb3BlLnZpZGVvLnlvdXR1YmVJRCkpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2Fib3V0JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdUdXRvcmlhbCcsIHN0YXRlOiAndHV0b3JpYWwnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ01lbWJlcnMgT25seScsIHN0YXRlOiAnbWVtYmVyc09ubHknLCBhdXRoOiB0cnVlIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ3JhbmRvR3JlZXRpbmcnLCBmdW5jdGlvbiAoUmFuZG9tR3JlZXRpbmdzKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLmdyZWV0aW5nID0gUmFuZG9tR3JlZXRpbmdzLmdldFJhbmRvbUdyZWV0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=