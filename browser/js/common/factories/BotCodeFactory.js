app.factory('BotCodeFactory', function ($http) {
    return {
        getBot: function (bot) {
        	
            var queryParams = {
            		bot: bot
            };
            
            if (!bot) {
            	console.log("no bot");
                return;
            }
            
            return $http.get('/api/dispatcher/readFile/', {
                params: queryParams
            }).then(function (response) {
            	//return to controller
                return response.data;
            });
        },

        saveBot: function (bot) {
        	var data; //data packet to send
        	data = { bot: bot };

            return $http.post('/api/dispatcher/saveFile/', data).then(function(res) {
//                update.currentOrder = res.data;
//                update.justOrdered = true;
            	return res.data;
              }, function(err) {
                  throw new Error(err);
              });  
        },

        createBlankBot: function ( user_ID ) {
            
            return $http.post('/api/dispatcher/createBlankBot/:user_ID').then(function(res) {
                return res.data;
              }, function(err) {
                  throw new Error(err);
              });  
        }, 

        createForkedBot: function (user_ID, bot_ID) {
          
            return $http.post('/api/dispatcher/createForkedBot/:user_ID', { botID : bot_ID} )
            .then(function(res) {
                return res.data;
              }, function(err) {
                  throw new Error(err);
              });  
        }

    };
});
