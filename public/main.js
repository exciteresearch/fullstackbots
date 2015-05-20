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
    console.log('revised mainEventCtrl');
    $scope.$on('refreshEventObj', function (event, data) {
        console.log('mainEventCtrl data=', data);
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
        console.log('controller data', bot);
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
                eventID: $scope.pendingEvents[index]._id, eventType: 'pending',
                botOneID: $scope.botOneID
            });
            //        	$scope.$emit('launchEvent',{
            //        		eventID: $scope.pendingEvents[index]._id, eventType: 'pending',
            //        		botOneID: $scope.botOneID
            //        	});
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
            console.log('saveBot', bot);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYmF0dGxlL2JhdHRsZS5qcyIsImVkaXRvci9lZGl0b3IuanMiLCJldmVudHMvZXZlbnRzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC5qcyIsImNvbW1vbi9mYWN0b3JpZXMvQm90Q29kZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0JvdEZpZ2h0RmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRXZlbnRzRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Tb2NrZXQuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uL3R1dG9yaWFsLXNlY3Rpb24uanMiLCJ0dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uLW1lbnUvdHV0b3JpYWwtc2VjdGlvbi1tZW51LmpzIiwidHV0b3JpYWwvdHV0b3JpYWwtdmlkZW8vdHV0b3JpYWwtdmlkZW8uanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxJQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsYUFBQSxFQUFBLFFBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUE7O0FBRUEscUJBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7O0FBR0EsUUFBQSw0QkFBQSxHQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7S0FDQSxDQUFBOzs7O0FBSUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLDRCQUFBLENBQUEsT0FBQSxDQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7O0FBRUEsWUFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBLG1CQUFBO1NBQ0E7OztBQUdBLGFBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7OztBQUlBLGdCQUFBLElBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7YUFDQSxNQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7YUFDQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2xEQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsaUJBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTs7O0FBR0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUNBLHVEQUFBLEVBQ0EscUhBQUEsRUFDQSxpREFBQSxFQUNBLGlEQUFBLEVBQ0EsdURBQUEsRUFDQSx1REFBQSxDQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUN4QkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxTQUFBO0FBQ0Esa0JBQUEsRUFBQSxrQkFBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7Ozs7O0FBQUEsS0FLQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLElBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxhQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxhQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7Ozs7QUFNQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7Ozs7O0FBTUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7OztBQUlBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTs7QUFFQSxZQUFBLFFBQUEsR0FBQTtBQUNBLHVCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7U0FDQSxDQUFBOztBQUVBLHFCQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEscUJBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLGtCQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7O0FDM0VBLFlBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFNBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEscUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsTUFDQTtBQUNBLGdCQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxpQkFBQSxFQUFBO0FBQ0EsdUJBQUEsRUFBQSxPQUFBO0FBQ0Esd0JBQUEsRUFBQSxHQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQSxrQkFBQSxDQUFBLDJCQUFBLEdBQ0EsV0FBQSxHQUFBLE9BQUEsR0FDQSxZQUFBLEdBQUEsR0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGNBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQTs7O0FBR0Esa0JBQUEsQ0FBQSxNQUFBLENBQUEsMEJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsaUJBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxDQUFBOzs7S0FJQSxDQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBOzs7QUFHQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOztBQUVBLGVBQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUEsRUFBQSxFQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEVBR0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEVBR0EsQ0FBQSxDQUFBOztBQ2xGQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFNBQUE7QUFDQSxrQkFBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQTs7Ozs7QUFBQSxLQUtBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEscUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsa0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxhQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxhQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOzs7Ozs7QUFNQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7Ozs7O0FBTUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7OztBQUlBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTs7QUFFQSxZQUFBLFFBQUEsR0FBQTtBQUNBLHVCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7U0FDQSxDQUFBOztBQUVBLHFCQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFDQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUdBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsWUFBQSxNQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtTQUNBLE1BQ0E7QUFDQSxrQkFBQSxDQUFBLGFBQUEsR0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGlCQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBO0FBQ0Esd0JBQUEsRUFBQSxNQUFBLENBQUEsUUFBQTthQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxxRUFBQSxFQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FDQTs7Ozs7Ozs7O0tBZUEsQ0FBQTtBQWZBLENBZ0JBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBOzs7Ozs7Ozs7Ozs7QUFZQSxXQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEseUJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGFBQUEsR0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSwyQkFBQSxHQUNBLFdBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsR0FDQSxZQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQ0EsQ0FBQTs7Ozs7Ozs7Q0FTQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7O0FDN0lBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLE1BQUEsQ0FBQTs7QUFFQSxZQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxrQkFBQSxHQUFBLEVBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7U0FDQSxNQUFBO0FBQ0Esa0JBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxlQUFBLE1BQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOzs7Ozs7QUFNQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBOzs7OztBQUtBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxZQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7QUMzSUEsWUFBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFHQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLE9BQUEsV0FBQSxLQUFBLFdBQUEsRUFBQTs7O0FBR0EsWUFBQSxNQUFBLEdBQUEsSUFBQSxXQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsY0FBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLGdCQUFBLEVBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7OztTQUdBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTtLQUNBLE1BQUE7O0FBRUEsZUFBQSxDQUFBLEdBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7S0FDQTtDQUNBLENBQUEsQ0FBQTtBQ3BDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQTs7QUFFQSxjQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDM0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGVBQUE7QUFDQSxnQkFBQSxFQUFBLG1FQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7O0FBR0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFFBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDL0JBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0Esa0JBQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxzQkFBQSxlQUFBLEVBQUE7QUFDQSx1QkFBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSwwQkFBQSxFQUNBLDBCQUFBLEVBQ0EsMEJBQUEsRUFDQSwwQkFBQSxFQUNBLHdCQUFBLENBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsa0JBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxLQUFBLE9BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNqREEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQSxHQUFBLEVBQUE7O0FBRUEsZ0JBQUEsV0FBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUE7YUFDQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFdBQUE7YUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBOztBQUVBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxlQUFBLEVBQUEsaUJBQUEsR0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBOzs7QUFHQSx1QkFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esc0JBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7S0FFQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ3JDQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBLEdBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FDQTs7QUFFQSxrQkFBQSxFQUFBLG9CQUFBLEdBQUEsRUFBQSxFQUNBOztLQUVBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDVkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTs7QUFFQSx3QkFBQSxFQUFBLDRCQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTs7QUFFQSxxQkFBQSxFQUFBLHlCQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTs7QUFFQSxtQkFBQSxFQUFBLHFCQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBOztBQUVBLGlCQUFBLEVBQUEsbUJBQUEsS0FBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBOztBQUVBLG1CQUFBLEVBQUEscUJBQUEsS0FBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsVUFBQSxDQUFBLGVBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQzVDQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLGVBQUEsRUFDQSx1QkFBQSxFQUNBLHNCQUFBLEVBQ0EsdUJBQUEsRUFDQSx5REFBQSxFQUNBLDBDQUFBLENBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsaUJBQUEsRUFBQSxTQUFBO0FBQ0EseUJBQUEsRUFBQSw2QkFBQTtBQUNBLG1CQUFBLGtCQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUN2QkEsWUFBQSxDQUFBOztBQ0FBLFlBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxrQkFBQSxFQUFBLEdBQUE7QUFDQSxzQkFBQSxFQUFBLEdBQUE7U0FDQTtBQUNBLG1CQUFBLEVBQUEsb0RBQUE7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNmQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsU0FBQSxDQUFBLHFCQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsU0FBQTtBQUNBLG1CQUFBLEVBQUEsOERBQUE7QUFDQSxhQUFBLEVBQUE7QUFDQSxvQkFBQSxFQUFBLEdBQUE7U0FDQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxpQkFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxjQUFBLEdBQUEsT0FBQSxDQUFBO0FBQ0EsMkJBQUEsQ0FBQSxhQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7YUFDQSxDQUFBO1NBRUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDckJBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFFBQUEsY0FBQSxHQUFBLFNBQUEsY0FBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsZ0NBQUEsR0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLGdEQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO1NBQ0E7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLGlCQUFBLEdBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2xCQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEseURBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDTkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSx5Q0FBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTs7QUFFQSxpQkFBQSxDQUFBLEtBQUEsR0FBQSxDQUNBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEVBQ0EsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsRUFDQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLFVBQUEsRUFBQSxFQUNBLEVBQUEsS0FBQSxFQUFBLGNBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FDQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsdUJBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsMkJBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLDBCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUE7O0FBRUEsZ0JBQUEsT0FBQSxHQUFBLFNBQUEsT0FBQSxHQUFBO0FBQ0EsMkJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSx5QkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxnQkFBQSxVQUFBLEdBQUEsU0FBQSxVQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBOztBQUVBLG1CQUFBLEVBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7U0FFQTs7S0FFQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDaERBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsZUFBQSxFQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLHlEQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tCb3RzQXBwJywgWyd1aS5yb3V0ZXInLCAnZnNhUHJlQnVpbHQnLCAndWkuYWNlJywgJ3V1aWQnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZSdcbiAgICBdO1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdiYXR0bGUnLCB7XG4gICAgICAgIHVybDogJy9iYXR0bGUnLFxuICAgICAgICBjb250cm9sbGVyOiBcIkV2ZW50c0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ldmVudHMvYmF0dGxlLmh0bWwnXG4gICAgICAgIC8vICxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYWRtaW46IHRydWVcbiAgICAgICAgLy8gfVxuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdFdmVudHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBFdmVudHNGYWN0b3J5KSB7XG5cbiAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgcHJlZmVyZW5jZXM6IFwiXCIsXG4gICAgICAgIHNsb3RzOiAxLFxuICAgICAgICBjcmVhdGVFdmVudDogZmFsc2VcbiAgICB9O1xuXG4gICAgJHNjb3BlLndhaXRpbmcgPSBmYWxzZTtcblxuICAgIGlmICghJHNjb3BlLnBlbmRpbmdFdmVudHMpIEV2ZW50c0ZhY3RvcnkuZ2V0UGVuZGluZ0V2ZW50cygpLnRoZW4oZnVuY3Rpb24oZXZlbnRzKXtcbiAgICAgICAgJHNjb3BlLnBlbmRpbmdFdmVudHMgPSBldmVudHM7XG4gICAgfSk7XG5cbiAgICAvL1RPRE9cblx0Ly8gaWYgKCEkc2NvcGUubGl2ZUV2ZW50cykgRXZlbnRzRmFjdG9yeS5nZXRMaXZlRXZlbnRzKCkudGhlbihmdW5jdGlvbihldmVudHMpe1xuXHQvLyBcdCRzY29wZS5saXZlRXZlbnRzID0gZXZlbnRzO1xuXHQvLyB9KTtcbiAgICAkc2NvcGUubGl2ZUV2ZW50cyA9IFtdO1xuXG4gICAgLy9UT0RPXG4gICAgLy8gaWYgKCEkc2NvcGUuY2hhbGxlbmdlcykgRXZlbnRzRmFjdG9yeS5nZXRQZW5kaW5nQ2hhbGxlbmdlcygpLnRoZW4oZnVuY3Rpb24oY2hhbGxlbmdlcyl7XG4gICAgLy8gICAgICRzY29wZS5jaGFsbGVuZ2VzID0gY2hhbGxlbmdlcztcbiAgICAvLyB9KTtcbiAgICAkc2NvcGUuY2hhbGxlbmdlcyA9IFtdO1xuXG5cdFxuXHQvLyAvL1NDT1BFIE1FVEhPRFNcbiAgICAkc2NvcGUuY3JlYXRlTmV3RXZlbnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgbmV3RXZlbnQgPSB7IFxuICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICRzY29wZS5kYXRhLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgc2xvdHM6ICRzY29wZS5kYXRhLnNsb3RzXG4gICAgICAgIH1cblxuICAgICAgICBFdmVudHNGYWN0b3J5LmNyZWF0ZUV2ZW50KCBuZXdFdmVudCApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGV2ZW50IClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIEFEREVEIVwiKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5jcmVhdGVFdmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLnByZWZlcmVuY2VzID0gXCJcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5zbG90cyA9IDE7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgIEV2ZW50c0ZhY3RvcnkuZGVsZXRlRXZlbnQoICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XSApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBlbmRpbmdFdmVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5qb2luRXZlbnQgPSBmdW5jdGlvbiggaW5kZXggKSB7XG5cbiAgICAgICAgRXZlbnRzRmFjdG9yeS5qb2luRXZlbnQoICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XSApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAkc2NvcGUud2FpdGluZyA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuLy8gYXBwLmZpbHRlcigncmFua0ZpbHRlcicsIGZ1bmN0aW9uICgpIHtcblxuLy8gICByZXR1cm4gZnVuY3Rpb24gKCBldmVudHMsIG51bWJlciApIHtcbi8vICAgICB2YXIgZmlsdGVyZWQgPSBbXTtcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuLy8gICAgICAgaWYgKCBldmVudHNbaV0ucmFuazw9IG51bWJlciApIHtcbi8vICAgICAgICAgZmlsdGVyZWQucHVzaCggZXZlbnRzW2ldICk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiBmaWx0ZXJlZDtcbi8vICAgfTtcbi8vIH0pOyIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZWRpdG9yJywge1xuICAgICAgICB1cmw6ICcvZWRpdG9yJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9lZGl0b3IvZWRpdG9yLmh0bWwnXG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ21haW5FZGl0b3JDdHJsJyxmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcyl7XG5cdCRzY29wZS5ldmVudHNPYmogPSB7fTtcblx0Y29uc29sZS5sb2coXCJyZXZpc2VkIG1haW5FdmVudEN0cmxcIik7XG5cdCRzY29wZS4kb24oJ3JlZnJlc2hFdmVudE9iaicsZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuXHRcdGNvbnNvbGUubG9nKFwibWFpbkV2ZW50Q3RybCBkYXRhPVwiLGRhdGEpO1xuXHRcdCRzY29wZS5ldmVudHNPYmogPSBkYXRhO1xuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignUGxheUNhbnZhc0VkaXRvckN0cmwnLGZ1bmN0aW9uKCRzY29wZSwkc2NlLHV1aWQ0KXtcblxuXHQkc2NvcGUuc2ltTGF1bmNoZWQgPSBmYWxzZTtcblx0XG4gICAgJHNjb3BlLiRvbignc2ltbXVsYXRlJyxmdW5jdGlvbihldmVudCwgYm90KSB7XG4gICAgXHRpZighYm90Ll9pZCkge1xuICAgICAgICBcdCRzY29wZS5zaW1MYXVuY2hlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICBcdHZhciBldmVudElEID0gdXVpZDQuZ2VuZXJhdGUoKTtcbiAgICAgICAgXHQkc2NvcGUuJGVtaXQoJ3JlZnJlc2hFdmVudE9iaicsIHsgXG4gICAgICAgIFx0XHRldmVudElEOiBldmVudElELFxuICAgICAgICBcdFx0Ym90T25lSUQ6IGJvdC5faWRcblx0XHRcdH0pO1xuICAgICAgICBcdCRzY29wZS5wbGF5Q2FudmFzVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoJy9wYy9pbmRleC5odG1sP3NlcnZlcj1mc2InXG5cdFx0XHRcdCsnJmV2ZW50SUQ9JytldmVudElEXG5cdFx0XHRcdCtcIiZib3RPbmVJRD1cIitib3QuX2lkXG5cdFx0XHQpO1xuICAgICAgICBcdCRzY29wZS5zaW1MYXVuY2hlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQ29kZUVkaXRvckN0cmwnLGZ1bmN0aW9uKCRzY29wZSwgQm90Q29kZUZhY3Rvcnkpe1xuXG5cdCRzY29wZS5ib3QgPSB7fTtcblx0XG5cdC8vQ291bGQgYWxzbyBiZSBhIFBhbmVsIG9mIFRhYnMsIFRPRE8gdXBvbiBzZWxlY3Rpb24gb3IgZm9ya2luZyBvZiBhIGJvdFxuXHRCb3RDb2RlRmFjdG9yeS5nZXRCb3QoJzU1NWJhNGQ2YTVmNjIyNmIzMDkzN2ZjNCcpLnRoZW4oZnVuY3Rpb24oYm90KXtcblx0XHRjb25zb2xlLmxvZyhcImNvbnRyb2xsZXIgZGF0YVwiLGJvdCk7XG5cdFx0JHNjb3BlLmJvdCA9IGJvdDtcbi8vXHRcdCRzY29wZS5ib3QuYm90Q29kZSA9IGJvdC5ib3RDb2RlO1xuLy9cdFx0JHNjb3BlLmJvdC5faWQgPSBib3QuX2lkO1xuXG5cdH0pO1xuXHRcblx0JHNjb3BlLnNhdmVCb3QgPSBmdW5jdGlvbigpe1xuXHRcdEJvdENvZGVGYWN0b3J5LnNhdmVCb3QoJHNjb3BlLmJvdCk7XG5cdH07XG5cdFxuXHQkc2NvcGUuc2ltQm90ID0gZnVuY3Rpb24oKXtcblx0XHRCb3RDb2RlRmFjdG9yeS5zYXZlQm90KCRzY29wZS5ib3QpO1xuXHRcdCRzY29wZS4kZW1pdCgnc2ltbXVsYXRlJywgJHNjb3BlLmJvdCk7XG5cdH07XG5cdFxuXHQvLyB1aS5hY2Ugc3RhcnRcblx0JHNjb3BlLmFjZUxvYWRlZCA9IGZ1bmN0aW9uKF9lZGl0b3IpIHtcblx0XHQvLyBPcHRpb25zXG5cdFx0X2VkaXRvci5zZXRSZWFkT25seShmYWxzZSk7XG5cdH07XG5cdCRzY29wZS5hY2VDaGFuZ2VkID0gZnVuY3Rpb24oZSkge1xuXHRcdC8vXG5cdH07XG5cdFxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdDb2RlQ29uc29sZUN0cmwnLGZ1bmN0aW9uKCRzY29wZSl7XG5cdC8vQ29kZSBvdXRwdXQsIGNvbnNvbGUgbG9ncywgZXJyb3JzIGV0Yy5cblx0XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0J1dHRvbnNDdHJsJyxmdW5jdGlvbigkc2NvcGUpe1xuXHQvL1ByYWN0aWNlIGFuZC9vciBDb21wZXRlXG5cdFxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdldmVudHMnLCB7XG4gICAgICAgIHVybDogJy9ldmVudHMnLFxuICAgICAgICBjb250cm9sbGVyOiBcIkV2ZW50c0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ldmVudHMvZXZlbnRzLmh0bWwnXG4gICAgICAgIC8vICxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYWRtaW46IHRydWVcbiAgICAgICAgLy8gfVxuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdtYWluRXZlbnRDdHJsJyxmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcyl7XG4gICAgJHNjb3BlLmRpcmVjdEV2ZW50SUQgPSBcIlwiO1xuICAgIFxuXHQkc2NvcGUuZXZlbnRzT2JqID0ge307XG5cdGNvbnNvbGUubG9nKFwicmV2aXNlZCBtYWluRXZlbnRDdHJsXCIpO1xuXHQkc2NvcGUuJG9uKCdyZWZyZXNoRXZlbnRPYmonLGZ1bmN0aW9uKGV2ZW50LCBkYXRhKXtcblx0XHRjb25zb2xlLmxvZyhcIm1haW5FdmVudEN0cmwgZGF0YT1cIixkYXRhKTtcblx0XHQkc2NvcGUuZXZlbnRzT2JqID0gZGF0YTtcblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0V2ZW50c0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsIEV2ZW50c0ZhY3RvcnksICRyb290U2NvcGUpIHtcblxuICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBwcmVmZXJlbmNlczogXCJcIixcbiAgICAgICAgc2xvdHM6IDEsXG4gICAgICAgIGNyZWF0ZUV2ZW50OiBmYWxzZVxuICAgIH07XG4gICAgXG4gICAgJHNjb3BlLmV2ZW50TGF1bmNoZWQgPSBmYWxzZTtcbiAgICAkc2NvcGUud2FpdGluZyA9IGZhbHNlO1xuICAgIGlmICghJHNjb3BlLnBlbmRpbmdFdmVudHMpIEV2ZW50c0ZhY3RvcnkuZ2V0UGVuZGluZ0V2ZW50cygpLnRoZW4oZnVuY3Rpb24oZXZlbnRzKXtcbiAgICAgICAgJHNjb3BlLnBlbmRpbmdFdmVudHMgPSBldmVudHM7XG4gICAgfSk7XG5cbiAgICAvL1RPRE9cblx0Ly8gaWYgKCEkc2NvcGUubGl2ZUV2ZW50cykgRXZlbnRzRmFjdG9yeS5nZXRMaXZlRXZlbnRzKCkudGhlbihmdW5jdGlvbihldmVudHMpe1xuXHQvLyBcdCRzY29wZS5saXZlRXZlbnRzID0gZXZlbnRzO1xuXHQvLyB9KTtcbiAgICAkc2NvcGUubGl2ZUV2ZW50cyA9IFtdO1xuXG4gICAgLy9UT0RPXG4gICAgLy8gaWYgKCEkc2NvcGUuY2hhbGxlbmdlcykgRXZlbnRzRmFjdG9yeS5nZXRQZW5kaW5nQ2hhbGxlbmdlcygpLnRoZW4oZnVuY3Rpb24oY2hhbGxlbmdlcyl7XG4gICAgLy8gICAgICRzY29wZS5jaGFsbGVuZ2VzID0gY2hhbGxlbmdlcztcbiAgICAvLyB9KTtcbiAgICAkc2NvcGUuY2hhbGxlbmdlcyA9IFtdO1xuXG5cdFxuXHQvLyAvL1NDT1BFIE1FVEhPRFNcbiAgICAkc2NvcGUuY3JlYXRlTmV3RXZlbnQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgbmV3RXZlbnQgPSB7IFxuICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICRzY29wZS5kYXRhLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgc2xvdHM6ICRzY29wZS5kYXRhLnNsb3RzXG4gICAgICAgIH1cblxuICAgICAgICBFdmVudHNGYWN0b3J5LmNyZWF0ZUV2ZW50KCBuZXdFdmVudCApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGV2ZW50IClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIEFEREVEIVwiKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5jcmVhdGVFdmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLnByZWZlcmVuY2VzID0gXCJcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5zbG90cyA9IDE7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgIEV2ZW50c0ZhY3RvcnkuZGVsZXRlRXZlbnQoICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XSApXG4gICAgICAgIC50aGVuKCBmdW5jdGlvbiAoZXZlbnQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBlbmRpbmdFdmVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgJHNjb3BlLmpvaW5FdmVudCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICBcdFxuICAgICAgICBpZigkc2NvcGUuZXZlbnRMYXVuY2hlZCkge1xuICAgICAgICBcdGNvbnNvbGUubG9nKFwidG9nZ2xlIGZyb21cIiwkc2NvcGUuZXZlbnRMYXVuY2hlZCk7XG4gICAgICAgIFx0JHNjb3BlLmV2ZW50TGF1bmNoZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgXHQkc2NvcGUuZGlyZWN0RXZlbnRJRCA9ICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQ7XG4gICAgICAgIFx0JHNjb3BlLmV2ZW50TGF1bmNoZWQgPSB0cnVlO1xuICAgICAgICBcdCRzY29wZS4kZW1pdCgncmVmcmVzaEV2ZW50T2JqJywgeyBcbiAgICAgICAgXHRcdGV2ZW50SUQ6ICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQsIGV2ZW50VHlwZTogJ3BlbmRpbmcnLFxuICAgICAgICBcdFx0Ym90T25lSUQ6ICRzY29wZS5ib3RPbmVJRFxuICAgIFx0XHRcdH0pO1xuLy8gICAgICAgIFx0JHNjb3BlLiRlbWl0KCdsYXVuY2hFdmVudCcseyBcbi8vICAgICAgICBcdFx0ZXZlbnRJRDogJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdLl9pZCwgZXZlbnRUeXBlOiAncGVuZGluZycsXG4vLyAgICAgICAgXHRcdGJvdE9uZUlEOiAkc2NvcGUuYm90T25lSURcbi8vICAgICAgICBcdH0pO1xuICAgICAgICBcdGNvbnNvbGUubG9nKFwiRXZlbnRzQ29udHJvbGxlciAnbGF1bmNoRXZlbnQnICRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQgaWRcIiwkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0uX2lkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbi8vICAgICAgICBFdmVudHNGYWN0b3J5LmpvaW5FdmVudCggJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdIClcbi8vICAgICAgICAudGhlbihmdW5jdGlvbiAoZXZlbnQpIHtcbi8vICAgICAgICBcdCRzY29wZS53YWl0aW5nID0gdHJ1ZTtcbi8vICAgICAgICAgICAgJHNjb3BlLmV2ZW50TGF1bmNoZWQgPSB0cnVlO1xuLy8gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4vLyAgICAgICAgICAgIFx0Y29uc29sZS5sb2coZXJyKTtcbi8vICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1BsYXlDYW52YXNDdHJsJyxmdW5jdGlvbigkc2NvcGUsJHNjZSl7XG5cdCAvL3BsYXlDYW52YXMgVVJMIGNhbiBiZSBjaGFuZ2VkIHRvIGFueXRoaW5nIGluY2x1ZGluZzpcblx0IC8vIEZ1bGxTdGFja0JvdHM6IC9wYy9pbmRleC5odG1sICxcblx0IC8vIEZTQjogaHR0cDovL3BsYXljYW52LmFzL3AvYmJNUWxOTXQ/c2VydmVyPWZzYixcblx0IC8vIFRhbng6IGh0dHA6Ly9wbGF5Y2Fudi5hcy9wL2FQMG94aFVyICxcblx0IC8vIFZveWFnZXI6IGh0dHA6Ly9wbGF5Y2Fudi5hcy9wL01tUzdyeDFpICxcblx0IC8vIFN3b29wOiBodHRwOi8vcGxheWNhbnYuYXMvcC9KdEwyaXFJSCAsXG5cdCAvLyBIYWNrOiBodHRwOi8vcGxheWNhbnYuYXMvcC9LUkU4Vm5SbSBcblx0XHRcblx0Ly8gdHJ1c3RBc1Jlc291cmNlVXJsIGNhbiBiZSBoaWdobHkgaW5zZWN1cmUgaWYgeW91IGRvIG5vdCBmaWx0ZXIgZm9yIHNlY3VyZSBVUkxzXG5cdC8vIGl0IGNvbXBvdW5kcyB0aGUgc2VjdXJpdHkgcmlzayBvZiBtYWxpY2lvdXMgY29kZSBpbmplY3Rpb24gZnJvbSB0aGUgQ29kZSBFZGl0b3Jcblx0XG5cdGNvbnNvbGUubG9nKCckc2NvcGUuJHBhcmVudC5kaXJlY3RFdmVudElEJywkc2NvcGUuJHBhcmVudC5kaXJlY3RFdmVudElEKTtcblx0Y29uc29sZS5sb2coJyRzY29wZS4kcGFyZW50LmJvdE9uZUlEJywkc2NvcGUuJHBhcmVudC5ib3RPbmVJRCk7XG5cdCRzY29wZS5wbGF5Q2FudmFzVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoJy9wYy9pbmRleC5odG1sP3NlcnZlcj1mc2InXG5cdFx0XHQrJyZldmVudElEPScrJHNjb3BlLiRwYXJlbnQuZGlyZWN0RXZlbnRJRFxuXHRcdFx0K1wiJmJvdE9uZUlEPVwiKyRzY29wZS4kcGFyZW50LmJvdE9uZUlEXG5cdFx0XHQpO1xuLy8vL1x0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYiZldmVudElEPScrJzU1NTlmNjAxMjNiMDI4YTUxNDNiNmU2MycpO1xuLy8vL1x0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYicpO1xuLy9cbi8vXHQkc2NvcGUuJG9uKCdsYXVuY2hFdmVudCcsZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuLy9cdFx0Y29uc29sZS5sb2coXCJQbGF5Q2FudmFzQ3RybCBkYXRhPVwiLGRhdGEpO1xuLy9cdFx0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYiZldmVudElEPScrZGF0YS5ldmVudElEKTtcbi8vXHR9KTtcblxufSk7XG5cbi8vIGFwcC5maWx0ZXIoJ3JhbmtGaWx0ZXInLCBmdW5jdGlvbiAoKSB7XG5cbi8vICAgcmV0dXJuIGZ1bmN0aW9uICggZXZlbnRzLCBudW1iZXIgKSB7XG4vLyAgICAgdmFyIGZpbHRlcmVkID0gW107XG4vLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAgIGlmICggZXZlbnRzW2ldLnJhbms8PSBudW1iZXIgKSB7XG4vLyAgICAgICAgIGZpbHRlcmVkLnB1c2goIGV2ZW50c1tpXSApO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gZmlsdGVyZWQ7XG4vLyAgIH07XG4vLyB9KTsiLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnU29ja2V0JywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuXG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG5cbiAgICAgICAgdmFyIHNvY2tldDtcblxuICAgICAgICBpZiAoJGxvY2F0aW9uLiQkcG9ydCkge1xuICAgICAgICAgICAgc29ja2V0ID0gaW8oJ2h0dHA6Ly9sb2NhbGhvc3Q6MTMzNycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc29ja2V0ID0gaW8oJy8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzb2NrZXQ7XG5cbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL2hvbWUuaHRtbCdcbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU2lkZU1lbnVDdHJsJyxmdW5jdGlvbigkc2NvcGUpe1xuXHQvL0NoYXQsIFJlcG8sIEZBUS4gZXRjXG5cdFxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdtc2dDdHJsJyxmdW5jdGlvbigkc2NvcGUpIHtcbiAgICBpZiAodHlwZW9mKEV2ZW50U291cmNlKSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIFx0XG4gICAgICAgIC8vIFllcyEgU2VydmVyLXNlbnQgZXZlbnRzIHN1cHBvcnQhXG4gICAgICAgIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9hcGkvZGlzcGF0Y2hlci8nKTtcbiAgICAgICAgc291cmNlLm9ub3BlbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJvcGVuXCIsZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBjcmVhdCBhbiBldmVudEhhbmRsZXIgZm9yIHdoZW4gYSBtZXNzYWdlIGlzIHJlY2VpdmVkXG4gICAgICAgIHNvdXJjZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBcdCAgY29uc29sZS5sb2coJ21lc3NhYWdlIGRhdGE6JyxldmVudC5kYXRhKTtcbiAgICAgICAgXHQgICRzY29wZS5tc2cgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuLy8gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5tc2cpO1xuICAgICAgICB9O1xuICAgICAgICBzb3VyY2Uub25lcnJvciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJlcnJvclwiLGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuXHQgICAgLy8gU29ycnkhIE5vIHNlcnZlci1zZW50IGV2ZW50cyBzdXBwb3J0Li5cblx0ICAgIGNvbnNvbGUubG9nKCdTU0Ugbm90IHN1cHBvcnRlZCBieSBicm93c2VyLicpO1xuXHR9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZXZlbnRzJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndHV0b3JpYWwnLCB7XG4gICAgICAgIHVybDogJy90dXRvcmlhbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdUdXRvcmlhbEN0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICB0dXRvcmlhbEluZm86IGZ1bmN0aW9uIChUdXRvcmlhbEZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVHV0b3JpYWxGYWN0b3J5LmdldFR1dG9yaWFsVmlkZW9zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdUdXRvcmlhbEZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFR1dG9yaWFsVmlkZW9zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3R1dG9yaWFsL3ZpZGVvcycpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignVHV0b3JpYWxDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgdHV0b3JpYWxJbmZvKSB7XG5cbiAgICAkc2NvcGUuc2VjdGlvbnMgPSB0dXRvcmlhbEluZm8uc2VjdGlvbnM7XG4gICAgJHNjb3BlLnZpZGVvcyA9IF8uZ3JvdXBCeSh0dXRvcmlhbEluZm8udmlkZW9zLCAnc2VjdGlvbicpO1xuXG4gICAgJHNjb3BlLmN1cnJlbnRTZWN0aW9uID0geyBzZWN0aW9uOiBudWxsIH07XG5cbiAgICAkc2NvcGUuY29sb3JzID0gW1xuICAgICAgICAncmdiYSgzNCwgMTA3LCAyNTUsIDAuMTApJyxcbiAgICAgICAgJ3JnYmEoMjM4LCAyNTUsIDY4LCAwLjExKScsXG4gICAgICAgICdyZ2JhKDIzNCwgNTEsIDI1NSwgMC4xMSknLFxuICAgICAgICAncmdiYSgyNTUsIDE5MywgNzMsIDAuMTEpJyxcbiAgICAgICAgJ3JnYmEoMjIsIDI1NSwgMSwgMC4xMSknXG4gICAgXTtcblxuICAgICRzY29wZS5nZXRWaWRlb3NCeVNlY3Rpb24gPSBmdW5jdGlvbiAoc2VjdGlvbiwgdmlkZW9zKSB7XG4gICAgICAgIHJldHVybiB2aWRlb3MuZmlsdGVyKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZGVvLnNlY3Rpb24gPT09IHNlY3Rpb247XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdCb3RDb2RlRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGdldEJvdDogZnVuY3Rpb24gKGJvdCkge1xuICAgICAgICBcdFxuICAgICAgICAgICAgdmFyIHF1ZXJ5UGFyYW1zID0ge1xuICAgICAgICAgICAgXHRcdGJvdDogYm90XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWJvdCkge1xuICAgICAgICAgICAgXHRjb25zb2xlLmxvZyhcIm5vIGJvdFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGlzcGF0Y2hlci9yZWFkRmlsZS8nLCB7XG4gICAgICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVBhcmFtc1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIFx0Ly9yZXR1cm4gdG8gY29udHJvbGxlclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2F2ZUJvdDogZnVuY3Rpb24gKGJvdCkge1xuICAgICAgICBcdGNvbnNvbGUubG9nKFwic2F2ZUJvdFwiLGJvdCk7XG4gICAgICAgIFx0dmFyIGRhdGE7IC8vZGF0YSBwYWNrZXQgdG8gc2VuZFxuICAgICAgICBcdGRhdGEgPSB7IGJvdDogYm90IH07XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2Rpc3BhdGNoZXIvc2F2ZUZpbGUvJywgZGF0YSkudGhlbihmdW5jdGlvbihyZXMpIHtcbi8vICAgICAgICAgICAgICAgIHVwZGF0ZS5jdXJyZW50T3JkZXIgPSByZXMuZGF0YTtcbi8vICAgICAgICAgICAgICAgIHVwZGF0ZS5qdXN0T3JkZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBcdGNvbnNvbGUubG9nKCdzYXZlRmlsZSByZXMuZGF0YScscmVzLmRhdGEpO1xuICAgICAgICAgICAgXHRyZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIH1cblxuICAgIH07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdCb3RGaWdodEZhY3RvcnknLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2ltQm90OiBmdW5jdGlvbiAoYm90KSB7XG4gICAgXHRcdCRzY29wZS4kZW1pdCgnc2ltbXVsYXRlJywgJHNjb3BlLmJvdCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29tcGV0ZUJvdDogZnVuY3Rpb24gKGJvdCkge1xuICAgICAgICB9XG5cbiAgICB9O1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnRXZlbnRzRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBnZXRQZW5kaW5nRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9wZW5kaW5nJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0TGl2ZUV2ZW50czogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvbGl2ZScpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZUV2ZW50OiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbWVtYmVycy8nLCBldmVudCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGpvaW5FdmVudDogZnVuY3Rpb24gKCBldmVudCApIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9tZW1iZXJzLycrZXZlbnQuX2lkLCBldmVudCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGRlbGV0ZUV2ZW50OiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL21lbWJlcnMvJytldmVudC5faWQgKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLidcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG4iLCIndXNlIHN0cmljdCc7XG5cbmFwcC5kaXJlY3RpdmUoJ3R1dG9yaWFsU2VjdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbmFtZTogJ0AnLFxuICAgICAgICAgICAgdmlkZW9zOiAnPScsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uL3R1dG9yaWFsLXNlY3Rpb24uaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5jc3MoeyBiYWNrZ3JvdW5kOiBzY29wZS5iYWNrZ3JvdW5kIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ3R1dG9yaWFsU2VjdGlvbk1lbnUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24tbWVudS90dXRvcmlhbC1zZWN0aW9uLW1lbnUuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBzZWN0aW9uczogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWxDdHJsKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRTZWN0aW9uID0gc2NvcGUuc2VjdGlvbnNbMF07XG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHNjb3BlLmN1cnJlbnRTZWN0aW9uKTtcblxuICAgICAgICAgICAgc2NvcGUuc2V0U2VjdGlvbiA9IGZ1bmN0aW9uIChzZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuY3VycmVudFNlY3Rpb24gPSBzZWN0aW9uO1xuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoc2VjdGlvbik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxWaWRlbycsIGZ1bmN0aW9uICgkc2NlKSB7XG5cbiAgICB2YXIgZm9ybVlvdXR1YmVVUkwgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuICdodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nICsgaWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwtdmlkZW8vdHV0b3JpYWwtdmlkZW8uaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB2aWRlbzogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUudHJ1c3RlZFlvdXR1YmVVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChmb3JtWW91dHViZVVSTChzY29wZS52aWRlby55b3V0dWJlSUQpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ2Z1bGxzdGFja0xvZ28nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5odG1sJ1xuICAgIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0Fib3V0Jywgc3RhdGU6ICdhYm91dCcgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnVHV0b3JpYWwnLCBzdGF0ZTogJ3R1dG9yaWFsJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdNZW1iZXJzIE9ubHknLCBzdGF0ZTogJ21lbWJlcnNPbmx5JywgYXV0aDogdHJ1ZSB9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9