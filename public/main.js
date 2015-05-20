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
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('leaderBoard', {
        url: '/leaderBoard',
        controller: 'LeaderBoardController',
        templateUrl: 'js/leaderBoard/leaderBoard.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('LeaderBoardController', function ($scope, $stateParams, $LeaderBoardFactory, $ChallengeFactory) {

    if (!$scope.userRank) LeaderBoardFactory.getUserRank().then(function (users) {
        $scope.userRank = users;
    });

    if (!$scope.botRank) LeaderBoardFactory.getBotRank().then(function (bots) {
        $scope.botRank = bots;
    });

    // //SCOPE METHODS
    $scope.acceptChallenge = function (index) {
        ChallengeFactory.challengeUser($scope.userRank[index]);
    };

    $scope.forkBot = function (index) {};
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
app.config(function ($stateProvider) {

    $stateProvider.state('register', {
        url: '/register',
        templateUrl: 'js/register/register.html',
        controller: 'RegisterCtrl'
    });
});

app.controller('RegisterCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    //SCOPE METHODS
    $scope.registerUser = function (registerInfo) {

        $scope.error = null;

        AuthService.signUp(registerInfo).then(function () {
            $state.go('home');
        })['catch'](function () {
            $scope.error = 'Invalid signUp credentials.';
        });
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
'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('userProfile', {
        url: '/userProfile',
        controller: 'UserProfileController',
        templateUrl: 'js/userProfile/userProfile.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('UserProfileController', function ($scope, $stateParams, $UserProfileFactory, $ChallengeFactory) {

    if (!$scope.userChallenges) ChallengeFactory.getUserChallenges().then(function (challenges) {
        $scope.userChallenges = challenges;
    });

    if (!$scope.botList) UserProfileFactory.getBotList().then(function (bots) {
        $scope.botList = bots;
    });

    // //SCOPE METHODS
    $scope.acceptChallenge = function (index) {
        ChallengeFactory.acceptChallenge($scope.challenges[index]);
    };

    $scope.deleteBot = function (index) {
        UserProfileFactory.deleteBot($scope.botList[index]).then(function (bot) {
            $scope.botList.splice(index, 1);
        });;
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

app.factory('ChallengeFactory', function ($http) {

    return {

        challengeUser: function challengeUser(user_challenged) {

            return $http.post('/api/members/challenge', user_challenged).then(function (response) {
                return response.data;
            });
        },

        acceptChallenge: function acceptChallenge(challenge) {

            return $http.put('/api/members/challenge/' + challenge._id, event).then(function (response) {
                return response.data;
            });
        }
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
app.factory('LeaderBoardFactory', function ($http) {

    return {

        getUserRank: function getUserRank() {

            return $http.get('/api/leaderBoard/getUserRank').then(function (response) {
                return response.data;
            });
        },

        getBotRank: function getBotRank() {

            return $http.get('/api/leaderBoard/getBotRank').then(function (response) {
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

app.factory('UserProfileFactory', function ($http) {

    return {

        getBotList: function getBotList() {

            return $http.get('/api/members/getBotList').then(function (response) {
                return response.data;
            });
        },

        deleteBot: function deleteBot(bot) {

            return $http['delete']('/api/members/deleteBot/' + bot._id).then(function (response) {
                return response.data;
            });
        }
    };
});

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

//ChallengeFactory.acceptChallenge( $scope.challenges[index] );
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYmF0dGxlL2JhdHRsZS5qcyIsImVkaXRvci9lZGl0b3IuanMiLCJldmVudHMvZXZlbnRzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsZWFkZXJCb2FyZC9sZWFkZXJCb2FyZC5qcyIsImxvZ2luL2xvZ2luLmpzIiwibWVtYmVycy1vbmx5L21lbWJlcnMtb25seS5qcyIsInJlZ2lzdGVyL3JlZ2lzdGVyLmpzIiwidHV0b3JpYWwvdHV0b3JpYWwuanMiLCJ1c2VyUHJvZmlsZS91c2VyUHJvZmlsZS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvQm90Q29kZUZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0JvdEZpZ2h0RmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvQ2hhbGxlbmdlRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRXZlbnRzRmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvTGVhZGVyQm9hcmRGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZmFjdG9yaWVzL1NvY2tldC5qcyIsImNvbW1vbi9mYWN0b3JpZXMvVXNlclByb2ZpbGVGYWN0b3J5LmpzIiwidHV0b3JpYWwvdHV0b3JpYWwtc2VjdGlvbi90dXRvcmlhbC1zZWN0aW9uLmpzIiwidHV0b3JpYWwvdHV0b3JpYWwtc2VjdGlvbi1tZW51L3R1dG9yaWFsLXNlY3Rpb24tbWVudS5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXZpZGVvL3R1dG9yaWFsLXZpZGVvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvcmFuZG8tZ3JlZXRpbmcvcmFuZG8tZ3JlZXRpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsSUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUEsV0FBQSxFQUFBLGFBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7OztBQUdBLFFBQUEsNEJBQUEsR0FBQSxTQUFBLDRCQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0tBQ0EsQ0FBQTs7OztBQUlBLGNBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOztBQUVBLFlBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxFQUFBOzs7QUFHQSxtQkFBQTtTQUNBOzs7QUFHQSxhQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNsREEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLGlCQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7OztBQUdBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSx1REFBQSxFQUNBLHFIQUFBLEVBQ0EsaURBQUEsRUFDQSxpREFBQSxFQUNBLHVEQUFBLEVBQ0EsdURBQUEsQ0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDeEJBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLGtCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBOzs7OztBQUFBLEtBS0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsa0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsYUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsYUFBQSxHQUFBLE1BQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7O0FBTUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7Ozs7OztBQU1BLFVBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFJQSxVQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7O0FBRUEsWUFBQSxRQUFBLEdBQUE7QUFDQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO1NBQ0EsQ0FBQTs7QUFFQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxrQkFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxrQkFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7OztBQzNFQSxZQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxTQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7U0FDQSxNQUNBO0FBQ0EsZ0JBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGlCQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLE9BQUE7QUFDQSx3QkFBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBO2FBQ0EsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsMkJBQUEsR0FDQSxXQUFBLEdBQUEsT0FBQSxHQUNBLFlBQUEsR0FBQSxHQUFBLENBQUEsR0FBQSxDQUNBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFHQSxrQkFBQSxDQUFBLE1BQUEsQ0FBQSwwQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLENBQUE7OztLQUlBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxzQkFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLHNCQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7OztBQUdBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7O0FBRUEsZUFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsQ0FBQSxFQUFBLEVBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFHQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFHQSxDQUFBLENBQUE7O0FDL0VBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLGtCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBOzs7OztBQUFBLEtBS0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxxQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsVUFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxJQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLGFBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGFBQUEsR0FBQSxNQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7Ozs7OztBQU1BLFVBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOzs7Ozs7QUFNQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7O0FBSUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxZQUFBOztBQUVBLFlBQUEsUUFBQSxHQUFBO0FBQ0EsdUJBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtTQUNBLENBQUE7O0FBRUEscUJBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUNBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUNBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBR0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxZQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsTUFDQTtBQUNBLGtCQUFBLENBQUEsYUFBQSxHQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsaUJBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUE7QUFDQSx3QkFBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBO2FBQ0EsQ0FBQSxDQUFBOzs7OztBQUtBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHFFQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBOzs7Ozs7Ozs7S0FlQSxDQUFBO0FBZkEsQ0FnQkEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUE7Ozs7Ozs7Ozs7OztBQVlBLFdBQUEsQ0FBQSxHQUFBLENBQUEsOEJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSx5QkFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQSxrQkFBQSxDQUFBLDJCQUFBLEdBQ0EsV0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxHQUNBLFlBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FDQSxDQUFBOzs7Ozs7OztDQVNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7QUM3SUEsQ0FBQSxZQUFBOztBQUVBLGdCQUFBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBOztBQUVBLFlBQUEsTUFBQSxDQUFBOztBQUVBLFlBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGtCQUFBLEdBQUEsRUFBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxrQkFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGVBQUEsTUFBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOzs7OztBQUtBLE9BQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxvQkFBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0FBQ0Esc0JBQUEsRUFBQSxzQkFBQTtBQUNBLHdCQUFBLEVBQUEsd0JBQUE7QUFDQSxxQkFBQSxFQUFBLHFCQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQSxDQUFBLGdCQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxhQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7QUFDQSx5QkFBQSxFQUFBLHVCQUFBLFFBQUEsRUFBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxXQUFBLEVBQ0EsVUFBQSxTQUFBLEVBQUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtTQUNBLENBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQTs7OztBQUlBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7Ozs7OztBQU1BLGdCQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsNEJBQUEsRUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0EsMEJBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxpQkFBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0E7S0FFQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFlBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEVBQUEsQ0FBQTtBQzNJQSxZQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxtQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUdBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxXQUFBLEtBQUEsV0FBQSxFQUFBOzs7QUFHQSxZQUFBLE1BQUEsR0FBQSxJQUFBLFdBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxjQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7O1NBR0EsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBO0tBQ0EsTUFBQTs7QUFFQSxlQUFBLENBQUEsR0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FBQTtLQUNBO0NBQ0EsQ0FBQSxDQUFBO0FDcENBLFlBQUEsQ0FBQTtBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsY0FBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxtQkFBQSxFQUFBLGlDQUFBOzs7OztBQUFBLEtBS0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsdUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsbUJBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxFQUFBLGtCQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsa0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7O0FBSUEsVUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHdCQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxFQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDakNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFFBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxXQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMzQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsZUFBQTtBQUNBLGdCQUFBLEVBQUEsbUVBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLElBQUEs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Q0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsMEJBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDbkNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUEsR0FBQSxFQUFBOztBQUVBLGdCQUFBLFdBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsR0FBQTthQUNBLENBQUE7O0FBRUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBO2FBQ0E7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxXQUFBO2FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTs7QUFFQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7O0FBRUEsZUFBQSxFQUFBLGlCQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwyQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTs7O0FBR0EsdUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTthQUNBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxzQkFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOztLQUVBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDbkNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUEsR0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBOztBQUVBLGtCQUFBLEVBQUEsb0JBQUEsR0FBQSxFQUFBLEVBQ0E7O0tBRUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUNWQSxHQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTs7QUFFQSxxQkFBQSxFQUFBLHVCQUFBLGVBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHdCQUFBLEVBQUEsZUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBOztBQUVBLHVCQUFBLEVBQUEseUJBQUEsU0FBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEseUJBQUEsR0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDckJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUE7O0FBRUEsd0JBQUEsRUFBQSw0QkFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEscUJBQUEsRUFBQSx5QkFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEsaUJBQUEsRUFBQSxtQkFBQSxLQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7O0FBRUEsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxVQUFBLENBQUEsZUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBRUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDM0NBLEdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBOztBQUVBLG1CQUFBLEVBQUEsdUJBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBOztBQUVBLGtCQUFBLEVBQUEsc0JBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUNwQkEsWUFBQSxDQUFBO0FBQ0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7O0FBRUEsUUFBQSxrQkFBQSxHQUFBLFNBQUEsa0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxTQUFBLEdBQUEsQ0FDQSxlQUFBLEVBQ0EsdUJBQUEsRUFDQSxzQkFBQSxFQUNBLHVCQUFBLEVBQ0EseURBQUEsRUFDQSwwQ0FBQSxDQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsU0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxrQkFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDdkJBLFlBQUEsQ0FBQTs7QUNBQSxHQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTs7QUFFQSxrQkFBQSxFQUFBLHNCQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQTs7QUFFQSxpQkFBQSxFQUFBLG1CQUFBLEdBQUEsRUFBQTs7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O1NBRUE7O0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hEQSxZQUFBLENBQUE7QUFDQSxHQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLGVBQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsUUFBQSxHQUFBLGVBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrQm90c0FwcCcsIFsndWkucm91dGVyJywgJ2ZzYVByZUJ1aWx0JywgJ3VpLmFjZScsICd1dWlkJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnXG4gICAgXTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYmF0dGxlJywge1xuICAgICAgICB1cmw6ICcvYmF0dGxlJyxcbiAgICAgICAgY29udHJvbGxlcjogXCJFdmVudHNDb250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZXZlbnRzL2JhdHRsZS5odG1sJ1xuICAgICAgICAvLyAsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGFkbWluOiB0cnVlXG4gICAgICAgIC8vIH1cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignRXZlbnRzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZVBhcmFtcywgRXZlbnRzRmFjdG9yeSkge1xuXG4gICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIHByZWZlcmVuY2VzOiBcIlwiLFxuICAgICAgICBzbG90czogMSxcbiAgICAgICAgY3JlYXRlRXZlbnQ6IGZhbHNlXG4gICAgfTtcblxuICAgICRzY29wZS53YWl0aW5nID0gZmFsc2U7XG5cbiAgICBpZiAoISRzY29wZS5wZW5kaW5nRXZlbnRzKSBFdmVudHNGYWN0b3J5LmdldFBlbmRpbmdFdmVudHMoKS50aGVuKGZ1bmN0aW9uKGV2ZW50cyl7XG4gICAgICAgICRzY29wZS5wZW5kaW5nRXZlbnRzID0gZXZlbnRzO1xuICAgIH0pO1xuXG4gICAgLy9UT0RPXG5cdC8vIGlmICghJHNjb3BlLmxpdmVFdmVudHMpIEV2ZW50c0ZhY3RvcnkuZ2V0TGl2ZUV2ZW50cygpLnRoZW4oZnVuY3Rpb24oZXZlbnRzKXtcblx0Ly8gXHQkc2NvcGUubGl2ZUV2ZW50cyA9IGV2ZW50cztcblx0Ly8gfSk7XG4gICAgJHNjb3BlLmxpdmVFdmVudHMgPSBbXTtcblxuICAgIC8vVE9ET1xuICAgIC8vIGlmICghJHNjb3BlLmNoYWxsZW5nZXMpIEV2ZW50c0ZhY3RvcnkuZ2V0UGVuZGluZ0NoYWxsZW5nZXMoKS50aGVuKGZ1bmN0aW9uKGNoYWxsZW5nZXMpe1xuICAgIC8vICAgICAkc2NvcGUuY2hhbGxlbmdlcyA9IGNoYWxsZW5nZXM7XG4gICAgLy8gfSk7XG4gICAgJHNjb3BlLmNoYWxsZW5nZXMgPSBbXTtcblxuXHRcblx0Ly8gLy9TQ09QRSBNRVRIT0RTXG4gICAgJHNjb3BlLmNyZWF0ZU5ld0V2ZW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIG5ld0V2ZW50ID0geyBcbiAgICAgICAgICAgIHByZWZlcmVuY2VzOiAkc2NvcGUuZGF0YS5wcmVmZXJlbmNlcyxcbiAgICAgICAgICAgIHNsb3RzOiAkc2NvcGUuZGF0YS5zbG90c1xuICAgICAgICB9XG5cbiAgICAgICAgRXZlbnRzRmFjdG9yeS5jcmVhdGVFdmVudCggbmV3RXZlbnQgKVxuICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBldmVudCApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFVkVOVCBBRERFRCFcIik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBlbmRpbmdFdmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEuY3JlYXRlRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5wcmVmZXJlbmNlcyA9IFwiXCI7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEuc2xvdHMgPSAxO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmRlbGV0ZUV2ZW50ID0gZnVuY3Rpb24oIGluZGV4ICkge1xuICAgICAgICBFdmVudHNGYWN0b3J5LmRlbGV0ZUV2ZW50KCAkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0gKVxuICAgICAgICAudGhlbiggZnVuY3Rpb24gKGV2ZW50KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICRzY29wZS5wZW5kaW5nRXZlbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuam9pbkV2ZW50ID0gZnVuY3Rpb24oIGluZGV4ICkge1xuXG4gICAgICAgIEV2ZW50c0ZhY3Rvcnkuam9pbkV2ZW50KCAkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0gKVxuICAgICAgICAudGhlbiggZnVuY3Rpb24gKGV2ZW50KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgJHNjb3BlLndhaXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbi8vIGFwcC5maWx0ZXIoJ3JhbmtGaWx0ZXInLCBmdW5jdGlvbiAoKSB7XG5cbi8vICAgcmV0dXJuIGZ1bmN0aW9uICggZXZlbnRzLCBudW1iZXIgKSB7XG4vLyAgICAgdmFyIGZpbHRlcmVkID0gW107XG4vLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAgIGlmICggZXZlbnRzW2ldLnJhbms8PSBudW1iZXIgKSB7XG4vLyAgICAgICAgIGZpbHRlcmVkLnB1c2goIGV2ZW50c1tpXSApO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgICByZXR1cm4gZmlsdGVyZWQ7XG4vLyAgIH07XG4vLyB9KTsiLCIndXNlIHN0cmljdCc7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2VkaXRvcicsIHtcbiAgICAgICAgdXJsOiAnL2VkaXRvcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZWRpdG9yL2VkaXRvci5odG1sJ1xuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdtYWluRWRpdG9yQ3RybCcsZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMpe1xuXHQkc2NvcGUuZXZlbnRzT2JqID0ge307XG5cdCRzY29wZS4kb24oJ3JlZnJlc2hFdmVudE9iaicsZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuXHRcdCRzY29wZS5ldmVudHNPYmogPSBkYXRhO1xuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignUGxheUNhbnZhc0VkaXRvckN0cmwnLGZ1bmN0aW9uKCRzY29wZSwkc2NlLHV1aWQ0KXtcblxuXHQkc2NvcGUuc2ltTGF1bmNoZWQgPSBmYWxzZTtcblx0XG4gICAgJHNjb3BlLiRvbignc2ltbXVsYXRlJyxmdW5jdGlvbihldmVudCwgYm90KSB7XG4gICAgXHRpZighYm90Ll9pZCkge1xuICAgICAgICBcdCRzY29wZS5zaW1MYXVuY2hlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICBcdHZhciBldmVudElEID0gdXVpZDQuZ2VuZXJhdGUoKTtcbiAgICAgICAgXHQkc2NvcGUuJGVtaXQoJ3JlZnJlc2hFdmVudE9iaicsIHsgXG4gICAgICAgIFx0XHRldmVudElEOiBldmVudElELFxuICAgICAgICBcdFx0Ym90T25lSUQ6IGJvdC5faWRcblx0XHRcdH0pO1xuICAgICAgICBcdCRzY29wZS5wbGF5Q2FudmFzVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoJy9wYy9pbmRleC5odG1sP3NlcnZlcj1mc2InXG5cdFx0XHRcdCsnJmV2ZW50SUQ9JytldmVudElEXG5cdFx0XHRcdCtcIiZib3RPbmVJRD1cIitib3QuX2lkXG5cdFx0XHQpO1xuICAgICAgICBcdCRzY29wZS5zaW1MYXVuY2hlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQ29kZUVkaXRvckN0cmwnLGZ1bmN0aW9uKCRzY29wZSwgQm90Q29kZUZhY3Rvcnkpe1xuXG5cdCRzY29wZS5ib3QgPSB7fTtcblx0XG5cdC8vQ291bGQgYWxzbyBiZSBhIFBhbmVsIG9mIFRhYnMsIFRPRE8gdXBvbiBzZWxlY3Rpb24gb3IgZm9ya2luZyBvZiBhIGJvdFxuXHRCb3RDb2RlRmFjdG9yeS5nZXRCb3QoJzU1NWJhNGQ2YTVmNjIyNmIzMDkzN2ZjNCcpLnRoZW4oZnVuY3Rpb24oYm90KXtcblx0XHQkc2NvcGUuYm90ID0gYm90O1xuLy9cdFx0JHNjb3BlLmJvdC5ib3RDb2RlID0gYm90LmJvdENvZGU7XG4vL1x0XHQkc2NvcGUuYm90Ll9pZCA9IGJvdC5faWQ7XG5cblx0fSk7XG5cdFxuXHQkc2NvcGUuc2F2ZUJvdCA9IGZ1bmN0aW9uKCl7XG5cdFx0Qm90Q29kZUZhY3Rvcnkuc2F2ZUJvdCgkc2NvcGUuYm90KTtcblx0fTtcblx0XG5cdCRzY29wZS5zaW1Cb3QgPSBmdW5jdGlvbigpe1xuXHRcdEJvdENvZGVGYWN0b3J5LnNhdmVCb3QoJHNjb3BlLmJvdCk7XG5cdFx0JHNjb3BlLiRlbWl0KCdzaW1tdWxhdGUnLCAkc2NvcGUuYm90KTtcblx0fTtcblx0XG5cdC8vIHVpLmFjZSBzdGFydFxuXHQkc2NvcGUuYWNlTG9hZGVkID0gZnVuY3Rpb24oX2VkaXRvcikge1xuXHRcdC8vIE9wdGlvbnNcblx0XHRfZWRpdG9yLnNldFJlYWRPbmx5KGZhbHNlKTtcblx0fTtcblx0JHNjb3BlLmFjZUNoYW5nZWQgPSBmdW5jdGlvbihlKSB7XG5cdFx0Ly9cblx0fTtcblx0XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0NvZGVDb25zb2xlQ3RybCcsZnVuY3Rpb24oJHNjb3BlKXtcblx0Ly9Db2RlIG91dHB1dCwgY29uc29sZSBsb2dzLCBlcnJvcnMgZXRjLlxuXHRcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQnV0dG9uc0N0cmwnLGZ1bmN0aW9uKCRzY29wZSl7XG5cdC8vUHJhY3RpY2UgYW5kL29yIENvbXBldGVcblx0XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2V2ZW50cycsIHtcbiAgICAgICAgdXJsOiAnL2V2ZW50cycsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiRXZlbnRzQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2V2ZW50cy9ldmVudHMuaHRtbCdcbiAgICAgICAgLy8gLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhZG1pbjogdHJ1ZVxuICAgICAgICAvLyB9XG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ21haW5FdmVudEN0cmwnLGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zKXtcbiAgICAkc2NvcGUuZGlyZWN0RXZlbnRJRCA9IFwiXCI7XG4gICAgXG5cdCRzY29wZS5ldmVudHNPYmogPSB7fTtcblx0Y29uc29sZS5sb2coXCJyZXZpc2VkIG1haW5FdmVudEN0cmxcIik7XG5cdCRzY29wZS4kb24oJ3JlZnJlc2hFdmVudE9iaicsZnVuY3Rpb24oZXZlbnQsIGRhdGEpe1xuXHRcdGNvbnNvbGUubG9nKFwibWFpbkV2ZW50Q3RybCBkYXRhPVwiLGRhdGEpO1xuXHRcdCRzY29wZS5ldmVudHNPYmogPSBkYXRhO1xuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignRXZlbnRzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZVBhcmFtcywgRXZlbnRzRmFjdG9yeSwgJHJvb3RTY29wZSkge1xuXG4gICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIHByZWZlcmVuY2VzOiBcIlwiLFxuICAgICAgICBzbG90czogMSxcbiAgICAgICAgY3JlYXRlRXZlbnQ6IGZhbHNlXG4gICAgfTtcbiAgICBcbiAgICAkc2NvcGUuZXZlbnRMYXVuY2hlZCA9IGZhbHNlO1xuICAgICRzY29wZS53YWl0aW5nID0gZmFsc2U7XG4gICAgaWYgKCEkc2NvcGUucGVuZGluZ0V2ZW50cykgRXZlbnRzRmFjdG9yeS5nZXRQZW5kaW5nRXZlbnRzKCkudGhlbihmdW5jdGlvbihldmVudHMpe1xuICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cyA9IGV2ZW50cztcbiAgICB9KTtcblxuICAgIC8vVE9ET1xuXHQvLyBpZiAoISRzY29wZS5saXZlRXZlbnRzKSBFdmVudHNGYWN0b3J5LmdldExpdmVFdmVudHMoKS50aGVuKGZ1bmN0aW9uKGV2ZW50cyl7XG5cdC8vIFx0JHNjb3BlLmxpdmVFdmVudHMgPSBldmVudHM7XG5cdC8vIH0pO1xuICAgICRzY29wZS5saXZlRXZlbnRzID0gW107XG5cbiAgICAvL1RPRE9cbiAgICAvLyBpZiAoISRzY29wZS5jaGFsbGVuZ2VzKSBFdmVudHNGYWN0b3J5LmdldFBlbmRpbmdDaGFsbGVuZ2VzKCkudGhlbihmdW5jdGlvbihjaGFsbGVuZ2VzKXtcbiAgICAvLyAgICAgJHNjb3BlLmNoYWxsZW5nZXMgPSBjaGFsbGVuZ2VzO1xuICAgIC8vIH0pO1xuICAgICRzY29wZS5jaGFsbGVuZ2VzID0gW107XG5cblx0XG5cdC8vIC8vU0NPUEUgTUVUSE9EU1xuICAgICRzY29wZS5jcmVhdGVOZXdFdmVudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBuZXdFdmVudCA9IHsgXG4gICAgICAgICAgICBwcmVmZXJlbmNlczogJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICBzbG90czogJHNjb3BlLmRhdGEuc2xvdHNcbiAgICAgICAgfVxuXG4gICAgICAgIEV2ZW50c0ZhY3RvcnkuY3JlYXRlRXZlbnQoIG5ld0V2ZW50IClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZXZlbnQgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVZFTlQgQURERUQhXCIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wZW5kaW5nRXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmNyZWF0ZUV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEucHJlZmVyZW5jZXMgPSBcIlwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLnNsb3RzID0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5kZWxldGVFdmVudCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgRXZlbnRzRmFjdG9yeS5kZWxldGVFdmVudCggJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdIClcbiAgICAgICAgLnRoZW4oIGZ1bmN0aW9uIChldmVudClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGVuZGluZ0V2ZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAkc2NvcGUuam9pbkV2ZW50ID0gZnVuY3Rpb24oIGluZGV4ICkge1xuICAgIFx0XG4gICAgICAgIGlmKCRzY29wZS5ldmVudExhdW5jaGVkKSB7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJ0b2dnbGUgZnJvbVwiLCRzY29wZS5ldmVudExhdW5jaGVkKTtcbiAgICAgICAgXHQkc2NvcGUuZXZlbnRMYXVuY2hlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICBcdCRzY29wZS5kaXJlY3RFdmVudElEID0gJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdLl9pZDtcbiAgICAgICAgXHQkc2NvcGUuZXZlbnRMYXVuY2hlZCA9IHRydWU7XG4gICAgICAgIFx0JHNjb3BlLiRlbWl0KCdyZWZyZXNoRXZlbnRPYmonLCB7IFxuICAgICAgICBcdFx0ZXZlbnRJRDogJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdLl9pZCwgZXZlbnRUeXBlOiAncGVuZGluZycsXG4gICAgICAgIFx0XHRib3RPbmVJRDogJHNjb3BlLmJvdE9uZUlEXG4gICAgXHRcdFx0fSk7XG4vLyAgICAgICAgXHQkc2NvcGUuJGVtaXQoJ2xhdW5jaEV2ZW50Jyx7IFxuLy8gICAgICAgIFx0XHRldmVudElEOiAkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0uX2lkLCBldmVudFR5cGU6ICdwZW5kaW5nJyxcbi8vICAgICAgICBcdFx0Ym90T25lSUQ6ICRzY29wZS5ib3RPbmVJRFxuLy8gICAgICAgIFx0fSk7XG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJFdmVudHNDb250cm9sbGVyICdsYXVuY2hFdmVudCcgJHNjb3BlLnBlbmRpbmdFdmVudHNbaW5kZXhdLl9pZCBpZFwiLCRzY29wZS5wZW5kaW5nRXZlbnRzW2luZGV4XS5faWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuLy8gICAgICAgIEV2ZW50c0ZhY3Rvcnkuam9pbkV2ZW50KCAkc2NvcGUucGVuZGluZ0V2ZW50c1tpbmRleF0gKVxuLy8gICAgICAgIC50aGVuKGZ1bmN0aW9uIChldmVudCkge1xuLy8gICAgICAgIFx0JHNjb3BlLndhaXRpbmcgPSB0cnVlO1xuLy8gICAgICAgICAgICAkc2NvcGUuZXZlbnRMYXVuY2hlZCA9IHRydWU7XG4vLyAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbi8vICAgICAgICAgICAgXHRjb25zb2xlLmxvZyhlcnIpO1xuLy8gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbn0pO1xuXG5hcHAuY29udHJvbGxlcignUGxheUNhbnZhc0N0cmwnLGZ1bmN0aW9uKCRzY29wZSwkc2NlKXtcblx0IC8vcGxheUNhbnZhcyBVUkwgY2FuIGJlIGNoYW5nZWQgdG8gYW55dGhpbmcgaW5jbHVkaW5nOlxuXHQgLy8gRnVsbFN0YWNrQm90czogL3BjL2luZGV4Lmh0bWwgLFxuXHQgLy8gRlNCOiBodHRwOi8vcGxheWNhbnYuYXMvcC9iYk1RbE5NdD9zZXJ2ZXI9ZnNiLFxuXHQgLy8gVGFueDogaHR0cDovL3BsYXljYW52LmFzL3AvYVAwb3hoVXIgLFxuXHQgLy8gVm95YWdlcjogaHR0cDovL3BsYXljYW52LmFzL3AvTW1TN3J4MWkgLFxuXHQgLy8gU3dvb3A6IGh0dHA6Ly9wbGF5Y2Fudi5hcy9wL0p0TDJpcUlIICxcblx0IC8vIEhhY2s6IGh0dHA6Ly9wbGF5Y2Fudi5hcy9wL0tSRThWblJtIFxuXHRcdFxuXHQvLyB0cnVzdEFzUmVzb3VyY2VVcmwgY2FuIGJlIGhpZ2hseSBpbnNlY3VyZSBpZiB5b3UgZG8gbm90IGZpbHRlciBmb3Igc2VjdXJlIFVSTHNcblx0Ly8gaXQgY29tcG91bmRzIHRoZSBzZWN1cml0eSByaXNrIG9mIG1hbGljaW91cyBjb2RlIGluamVjdGlvbiBmcm9tIHRoZSBDb2RlIEVkaXRvclxuXHRcblx0Y29uc29sZS5sb2coJyRzY29wZS4kcGFyZW50LmRpcmVjdEV2ZW50SUQnLCRzY29wZS4kcGFyZW50LmRpcmVjdEV2ZW50SUQpO1xuXHRjb25zb2xlLmxvZygnJHNjb3BlLiRwYXJlbnQuYm90T25lSUQnLCRzY29wZS4kcGFyZW50LmJvdE9uZUlEKTtcblx0JHNjb3BlLnBsYXlDYW52YXNVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCgnL3BjL2luZGV4Lmh0bWw/c2VydmVyPWZzYidcblx0XHRcdCsnJmV2ZW50SUQ9Jyskc2NvcGUuJHBhcmVudC5kaXJlY3RFdmVudElEXG5cdFx0XHQrXCImYm90T25lSUQ9XCIrJHNjb3BlLiRwYXJlbnQuYm90T25lSURcblx0XHRcdCk7XG4vLy8vXHQkc2NvcGUucGxheUNhbnZhc1VSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKCcvcGMvaW5kZXguaHRtbD9zZXJ2ZXI9ZnNiJmV2ZW50SUQ9JysnNTU1OWY2MDEyM2IwMjhhNTE0M2I2ZTYzJyk7XG4vLy8vXHQkc2NvcGUucGxheUNhbnZhc1VSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKCcvcGMvaW5kZXguaHRtbD9zZXJ2ZXI9ZnNiJyk7XG4vL1xuLy9cdCRzY29wZS4kb24oJ2xhdW5jaEV2ZW50JyxmdW5jdGlvbihldmVudCwgZGF0YSl7XG4vL1x0XHRjb25zb2xlLmxvZyhcIlBsYXlDYW52YXNDdHJsIGRhdGE9XCIsZGF0YSk7XG4vL1x0XHQkc2NvcGUucGxheUNhbnZhc1VSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKCcvcGMvaW5kZXguaHRtbD9zZXJ2ZXI9ZnNiJmV2ZW50SUQ9JytkYXRhLmV2ZW50SUQpO1xuLy9cdH0pO1xuXG59KTtcblxuLy8gYXBwLmZpbHRlcigncmFua0ZpbHRlcicsIGZ1bmN0aW9uICgpIHtcblxuLy8gICByZXR1cm4gZnVuY3Rpb24gKCBldmVudHMsIG51bWJlciApIHtcbi8vICAgICB2YXIgZmlsdGVyZWQgPSBbXTtcbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuLy8gICAgICAgaWYgKCBldmVudHNbaV0ucmFuazw9IG51bWJlciApIHtcbi8vICAgICAgICAgZmlsdGVyZWQucHVzaCggZXZlbnRzW2ldICk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiBmaWx0ZXJlZDtcbi8vICAgfTtcbi8vIH0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcblxuICAgICAgICB2YXIgc29ja2V0O1xuXG4gICAgICAgIGlmICgkbG9jYXRpb24uJCRwb3J0KSB7XG4gICAgICAgICAgICBzb2NrZXQgPSBpbygnaHR0cDovL2xvY2FsaG9zdDoxMzM3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb2NrZXQgPSBpbygnLycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNvY2tldDtcblxuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAoc2Vzc2lvbklkLCB1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSkoKTsiLCIndXNlIHN0cmljdCc7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTaWRlTWVudUN0cmwnLGZ1bmN0aW9uKCRzY29wZSl7XG5cdC8vQ2hhdCwgUmVwbywgRkFRLiBldGNcblx0XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ21zZ0N0cmwnLGZ1bmN0aW9uKCRzY29wZSkge1xuICAgIGlmICh0eXBlb2YoRXZlbnRTb3VyY2UpICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgXHRcbiAgICAgICAgLy8gWWVzISBTZXJ2ZXItc2VudCBldmVudHMgc3VwcG9ydCFcbiAgICAgICAgdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL2FwaS9kaXNwYXRjaGVyLycpO1xuICAgICAgICBzb3VyY2Uub25vcGVuID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgXHRjb25zb2xlLmxvZyhcIm9wZW5cIixldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGNyZWF0IGFuIGV2ZW50SGFuZGxlciBmb3Igd2hlbiBhIG1lc3NhZ2UgaXMgcmVjZWl2ZWRcbiAgICAgICAgc291cmNlLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIFx0ICBjb25zb2xlLmxvZygnbWVzc2FhZ2UgZGF0YTonLGV2ZW50LmRhdGEpO1xuICAgICAgICBcdCAgJHNjb3BlLm1zZyA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4vLyAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm1zZyk7XG4gICAgICAgIH07XG4gICAgICAgIHNvdXJjZS5vbmVycm9yID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgXHRjb25zb2xlLmxvZyhcImVycm9yXCIsZXZlbnQpO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG5cdCAgICAvLyBTb3JyeSEgTm8gc2VydmVyLXNlbnQgZXZlbnRzIHN1cHBvcnQuLlxuXHQgICAgY29uc29sZS5sb2coJ1NTRSBub3Qgc3VwcG9ydGVkIGJ5IGJyb3dzZXIuJyk7XG5cdH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xlYWRlckJvYXJkJywge1xuICAgICAgICB1cmw6ICcvbGVhZGVyQm9hcmQnLFxuICAgICAgICBjb250cm9sbGVyOiBcIkxlYWRlckJvYXJkQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xlYWRlckJvYXJkL2xlYWRlckJvYXJkLmh0bWwnXG4gICAgICAgIC8vICxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYWRtaW46IHRydWVcbiAgICAgICAgLy8gfVxuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMZWFkZXJCb2FyZENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGVQYXJhbXMsICRMZWFkZXJCb2FyZEZhY3RvcnksICRDaGFsbGVuZ2VGYWN0b3J5KSB7XG4gICAgXG4gICAgaWYgKCEkc2NvcGUudXNlclJhbmspIExlYWRlckJvYXJkRmFjdG9yeS5nZXRVc2VyUmFuaygpLnRoZW4oZnVuY3Rpb24odXNlcnMpe1xuICAgICAgICAkc2NvcGUudXNlclJhbmsgPSB1c2VycztcbiAgICB9KTtcblxuICAgIGlmICghJHNjb3BlLmJvdFJhbmspIExlYWRlckJvYXJkRmFjdG9yeS5nZXRCb3RSYW5rKCkudGhlbihmdW5jdGlvbihib3RzKXtcbiAgICAgICAgJHNjb3BlLmJvdFJhbmsgPSBib3RzO1xuICAgIH0pO1xuXG5cblx0Ly8gLy9TQ09QRSBNRVRIT0RTXG4gICAgJHNjb3BlLmFjY2VwdENoYWxsZW5nZSA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgQ2hhbGxlbmdlRmFjdG9yeS5jaGFsbGVuZ2VVc2VyKCAkc2NvcGUudXNlclJhbmtbaW5kZXhdICk7XG4gICAgfVxuICAgICBcbiAgICRzY29wZS5mb3JrQm90ID0gZnVuY3Rpb24oIGluZGV4ICkge1xuICAgICAgICAvL0NoYWxsZW5nZUZhY3RvcnkuYWNjZXB0Q2hhbGxlbmdlKCAkc2NvcGUuY2hhbGxlbmdlc1tpbmRleF0gKTtcbiAgICB9XG4gIFxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZXZlbnRzJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncmVnaXN0ZXInLCB7XG4gICAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvcmVnaXN0ZXIvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgIC8vU0NPUEUgTUVUSE9EU1xuICAgICRzY29wZS5yZWdpc3RlclVzZXIgPSBmdW5jdGlvbiAocmVnaXN0ZXJJbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICAgICBBdXRoU2VydmljZS5zaWduVXAocmVnaXN0ZXJJbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBzaWduVXAgY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG5cblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0dXRvcmlhbCcsIHtcbiAgICAgICAgdXJsOiAnL3R1dG9yaWFsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1R1dG9yaWFsQ3RybCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIHR1dG9yaWFsSW5mbzogZnVuY3Rpb24gKFR1dG9yaWFsRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUdXRvcmlhbEZhY3RvcnkuZ2V0VHV0b3JpYWxWaWRlb3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1R1dG9yaWFsRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0VHV0b3JpYWxWaWRlb3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHV0b3JpYWwvdmlkZW9zJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdUdXRvcmlhbEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCB0dXRvcmlhbEluZm8pIHtcblxuICAgICRzY29wZS5zZWN0aW9ucyA9IHR1dG9yaWFsSW5mby5zZWN0aW9ucztcbiAgICAkc2NvcGUudmlkZW9zID0gXy5ncm91cEJ5KHR1dG9yaWFsSW5mby52aWRlb3MsICdzZWN0aW9uJyk7XG5cbiAgICAkc2NvcGUuY3VycmVudFNlY3Rpb24gPSB7IHNlY3Rpb246IG51bGwgfTtcblxuICAgICRzY29wZS5jb2xvcnMgPSBbXG4gICAgICAgICdyZ2JhKDM0LCAxMDcsIDI1NSwgMC4xMCknLFxuICAgICAgICAncmdiYSgyMzgsIDI1NSwgNjgsIDAuMTEpJyxcbiAgICAgICAgJ3JnYmEoMjM0LCA1MSwgMjU1LCAwLjExKScsXG4gICAgICAgICdyZ2JhKDI1NSwgMTkzLCA3MywgMC4xMSknLFxuICAgICAgICAncmdiYSgyMiwgMjU1LCAxLCAwLjExKSdcbiAgICBdO1xuXG4gICAgJHNjb3BlLmdldFZpZGVvc0J5U2VjdGlvbiA9IGZ1bmN0aW9uIChzZWN0aW9uLCB2aWRlb3MpIHtcbiAgICAgICAgcmV0dXJuIHZpZGVvcy5maWx0ZXIoZnVuY3Rpb24gKHZpZGVvKSB7XG4gICAgICAgICAgICByZXR1cm4gdmlkZW8uc2VjdGlvbiA9PT0gc2VjdGlvbjtcbiAgICAgICAgfSk7XG4gICAgfTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndXNlclByb2ZpbGUnLCB7XG4gICAgICAgIHVybDogJy91c2VyUHJvZmlsZScsXG4gICAgICAgIGNvbnRyb2xsZXI6IFwiVXNlclByb2ZpbGVDb250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdXNlclByb2ZpbGUvdXNlclByb2ZpbGUuaHRtbCdcbiAgICAgICAgLy8gLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhZG1pbjogdHJ1ZVxuICAgICAgICAvLyB9XG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1VzZXJQcm9maWxlQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZVBhcmFtcywgJFVzZXJQcm9maWxlRmFjdG9yeSwgJENoYWxsZW5nZUZhY3RvcnkpIHtcbiAgICBcbiAgICBpZiAoISRzY29wZS51c2VyQ2hhbGxlbmdlcykgQ2hhbGxlbmdlRmFjdG9yeS5nZXRVc2VyQ2hhbGxlbmdlcygpLnRoZW4oZnVuY3Rpb24oY2hhbGxlbmdlcyl7XG4gICAgICAgICRzY29wZS51c2VyQ2hhbGxlbmdlcyA9IGNoYWxsZW5nZXM7XG4gICAgfSk7XG5cbiAgICBpZiAoISRzY29wZS5ib3RMaXN0KSBVc2VyUHJvZmlsZUZhY3RvcnkuZ2V0Qm90TGlzdCgpLnRoZW4oZnVuY3Rpb24oYm90cyl7XG4gICAgICAgICRzY29wZS5ib3RMaXN0ID0gYm90cztcbiAgICB9KTtcblxuXG5cdC8vIC8vU0NPUEUgTUVUSE9EU1xuICAgICRzY29wZS5hY2NlcHRDaGFsbGVuZ2UgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgIENoYWxsZW5nZUZhY3RvcnkuYWNjZXB0Q2hhbGxlbmdlKCAkc2NvcGUuY2hhbGxlbmdlc1tpbmRleF0gKTtcbiAgICB9XG4gICAgIFxuICAgICRzY29wZS5kZWxldGVCb3QgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgIFVzZXJQcm9maWxlRmFjdG9yeS5kZWxldGVCb3QoICRzY29wZS5ib3RMaXN0W2luZGV4XSApLnRoZW4oZnVuY3Rpb24oIGJvdCApe1xuICAgICAgICAkc2NvcGUuYm90TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0pOztcbiAgICB9ICAgXG4gIFxufSk7XG4iLCJhcHAuZmFjdG9yeSgnQm90Q29kZUZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRCb3Q6IGZ1bmN0aW9uIChib3QpIHtcbiAgICAgICAgXHRcbiAgICAgICAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHtcbiAgICAgICAgICAgIFx0XHRib3Q6IGJvdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCFib3QpIHtcbiAgICAgICAgICAgIFx0Y29uc29sZS5sb2coXCJubyBib3RcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2Rpc3BhdGNoZXIvcmVhZEZpbGUvJywge1xuICAgICAgICAgICAgICAgIHBhcmFtczogcXVlcnlQYXJhbXNcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBcdC8vcmV0dXJuIHRvIGNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmVCb3Q6IGZ1bmN0aW9uIChib3QpIHtcbiAgICAgICAgXHR2YXIgZGF0YTsgLy9kYXRhIHBhY2tldCB0byBzZW5kXG4gICAgICAgIFx0ZGF0YSA9IHsgYm90OiBib3QgfTtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGlzcGF0Y2hlci9zYXZlRmlsZS8nLCBkYXRhKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuLy8gICAgICAgICAgICAgICAgdXBkYXRlLmN1cnJlbnRPcmRlciA9IHJlcy5kYXRhO1xuLy8gICAgICAgICAgICAgICAgdXBkYXRlLmp1c3RPcmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIFx0cmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgICB9KTsgIFxuICAgICAgICB9XG5cbiAgICB9O1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnQm90RmlnaHRGYWN0b3J5JywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNpbUJvdDogZnVuY3Rpb24gKGJvdCkge1xuICAgIFx0XHQkc2NvcGUuJGVtaXQoJ3NpbW11bGF0ZScsICRzY29wZS5ib3QpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbXBldGVCb3Q6IGZ1bmN0aW9uIChib3QpIHtcbiAgICAgICAgfVxuXG4gICAgfTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ0NoYWxsZW5nZUZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgY2hhbGxlbmdlVXNlcjogZnVuY3Rpb24gKCB1c2VyX2NoYWxsZW5nZWQgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL21lbWJlcnMvY2hhbGxlbmdlJywgdXNlcl9jaGFsbGVuZ2VkICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cbiAgICAgICAgYWNjZXB0Q2hhbGxlbmdlOiBmdW5jdGlvbiAoIGNoYWxsZW5nZSApIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9tZW1iZXJzL2NoYWxsZW5nZS8nK2NoYWxsZW5nZS5faWQsIGV2ZW50IClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdFdmVudHNGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldFBlbmRpbmdFdmVudHM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3BlbmRpbmcnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRMaXZlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9saXZlJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9tZW1iZXJzLycsIGV2ZW50ICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgam9pbkV2ZW50OiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL21lbWJlcnMvJytldmVudC5faWQsIGV2ZW50ICkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVsZXRlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvbWVtYmVycy8nK2V2ZW50Ll9pZCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdMZWFkZXJCb2FyZEZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgZ2V0VXNlclJhbms6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9sZWFkZXJCb2FyZC9nZXRVc2VyUmFuaycpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuXG4gICAgICAgIGdldEJvdFJhbms6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9sZWFkZXJCb2FyZC9nZXRCb3RSYW5rJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5hcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLidcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG4iLCJhcHAuZmFjdG9yeSgnVXNlclByb2ZpbGVGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldEJvdExpc3Q6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL2dldEJvdExpc3QnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcblxuICAgICAgICBkZWxldGVCb3Q6IGZ1bmN0aW9uICggYm90ICkge1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL21lbWJlcnMvZGVsZXRlQm90LycrYm90Ll9pZCApLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hcHAuZGlyZWN0aXZlKCd0dXRvcmlhbFNlY3Rpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG5hbWU6ICdAJyxcbiAgICAgICAgICAgIHZpZGVvczogJz0nLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwtc2VjdGlvbi90dXRvcmlhbC1zZWN0aW9uLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY3NzKHsgYmFja2dyb3VuZDogc2NvcGUuYmFja2dyb3VuZCB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCd0dXRvcmlhbFNlY3Rpb25NZW51JywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uLW1lbnUvdHV0b3JpYWwtc2VjdGlvbi1tZW51Lmh0bWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgc2VjdGlvbnM6ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsQ3RybCkge1xuXG4gICAgICAgICAgICBzY29wZS5jdXJyZW50U2VjdGlvbiA9IHNjb3BlLnNlY3Rpb25zWzBdO1xuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShzY29wZS5jdXJyZW50U2VjdGlvbik7XG5cbiAgICAgICAgICAgIHNjb3BlLnNldFNlY3Rpb24gPSBmdW5jdGlvbiAoc2VjdGlvbikge1xuICAgICAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRTZWN0aW9uID0gc2VjdGlvbjtcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHNlY3Rpb24pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcbmFwcC5kaXJlY3RpdmUoJ3R1dG9yaWFsVmlkZW8nLCBmdW5jdGlvbiAoJHNjZSkge1xuXG4gICAgdmFyIGZvcm1Zb3V0dWJlVVJMID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJyArIGlkO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLXZpZGVvL3R1dG9yaWFsLXZpZGVvLmh0bWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdmlkZW86ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLnRydXN0ZWRZb3V0dWJlVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoZm9ybVlvdXR1YmVVUkwoc2NvcGUudmlkZW8ueW91dHViZUlEKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBYm91dCcsIHN0YXRlOiAnYWJvdXQnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ1R1dG9yaWFsJywgc3RhdGU6ICd0dXRvcmlhbCcgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTWVtYmVycyBPbmx5Jywgc3RhdGU6ICdtZW1iZXJzT25seScsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuYXBwLmRpcmVjdGl2ZSgncmFuZG9HcmVldGluZycsIGZ1bmN0aW9uIChSYW5kb21HcmVldGluZ3MpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcmFuZG8tZ3JlZXRpbmcvcmFuZG8tZ3JlZXRpbmcuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUuZ3JlZXRpbmcgPSBSYW5kb21HcmVldGluZ3MuZ2V0UmFuZG9tR3JlZXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==