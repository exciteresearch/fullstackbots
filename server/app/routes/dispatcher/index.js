'use strict';
var path = require('path');
var router = require('express').Router();
module.exports = router;

var openConnections = [];

router.get('/', function (req, res) {
	console.log("openned ip:"+ req.socket.remoteAddress + ":" + req.socket.remotePort );
    req.socket.setTimeout(Infinity);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
 
    openConnections.push(res);

    req.on("close", function() {
        var toRemove;
        for (var j =0 ; j < openConnections.length ; j++) {
            if (openConnections[j] === res) {
                toRemove =j;
                break;
            }
        }
    	console.log("disconnected " + j + " ip:"+ req.socket.remoteAddress + ":" + req.socket.remotePort );
        openConnections.splice(j,1);
        console.log("openConnections ",openConnections.length);
    });
    
    var createMsg = function () {
        return { dt: new Date(), connection: false };
    };

    setInterval(function() {
        openConnections.forEach(function(resp,index) {
            var msg = createMsg() ; 
            msg.connection = index;
            resp.write('connection: ' + index + '\n');
            resp.write('msg: ' + JSON.stringify(msg) + '\n\n'); // Note the extra newline
            console.log("connection",index,"msg",msg);
        });
    }, 30000);
});

//an open connection can have multiple subscriptions
//every subscription is a registered emmitter
//a registered emmitter can be emmitted during an event
// emmit to allow appropriate subscribers to refresh an iframe