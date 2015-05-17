app.factory('EventsFactory', function ($http) {

    return {

        getPendingEvents: function () {

            return $http.get('/api/events/pending').then(function (response) {
                return response.data;
            });
            
        },

        getLiveEvents: function () {

            return $http.get('/api/events/live').then(function (response) {
                return response.data;
            });
            
        },

        createEvent: function ( event ) {
            console.log(event);
            return $http.post('/api/events', event ).then(function (response) {
                return response.data;
            });

        },

        joinEvent: function ( event ) {

            return $http.put('/api/events/'+event._id, event ).then(function (response) {
                return response.data;
            });

        },

        deleteEvent: function ( event ) {

            return $http.delete('/api/events/'+event._id ).then(function (response) {
                return response.data;
            });

        }
    };
});