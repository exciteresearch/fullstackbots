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
        	console.log("saveBot");
        	var data; //data packet to send
        	data = { bot: bot };

            return $http.post('/api/dispatcher/saveFile/', data).then(function(res) {
//                update.currentOrder = res.data;
//                update.justOrdered = true;
            	console.log('saveFile res.data',res.data);
            	return res.data;
              }, function(err) {
                  throw new Error(err);
              });  
        }

    };
});
