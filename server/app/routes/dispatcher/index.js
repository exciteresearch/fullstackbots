'use strict';
var fs = require('fs');
var path = require('path');
// remove the next two lines and you will get an error 'Router.use() requires middleware function but got a Obj'
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
    
});
    
	var createMsg = function (type,connection) {
	    return { 
	    	type: type,
	    	dt: new Date(), 
	    	connection: connection || false
	    };
	};
	
	setInterval(function() {
	    openConnections.forEach(function(response,index) {
	        var msg = createMsg('heartbeat',index) ; 
	        response.write('data: ' + JSON.stringify(msg) + '\n\n'); // Note the extra newline
	        console.log("connection",index,"msg",msg);
	    });
	}, 15000);


// an open connection can have multiple subscriptions
// every subscription is a registered emmitter
// a registered emmitter can be emmitted during an event
// emmit to allow appropriate subscribers to refresh an iframe

//create an sse server on a specific port, require sse library is very old.

//var SSE = require("sse")
//, express = require('express')
////, sseApp = express.createServer(); // express.createServer() depricated
//, sseApp = express();
//
////sseApp.use(express.static(__dirname + '/public'));
//sseApp.use(express.static(__dirname + '/app/routes/dispatcher'));
//
//var sse = new SSE(sseApp);
//sse.on('connection', function(client) {
//	var id = setInterval(function() {
//		client.send(JSON.stringify(process.memoryUsage()));
//	}, 100);
//	console.log('started client interval');
//	client.on('close', function() {
//		console.log('stopping client interval');
//		clearInterval(id);
//	})
//});
//
//sseApp.listen(1337);

//was saveBotCode BUT res does not match!!! need to start working with sessions

router.post('/saveFile', function (req, res) {
//	fs.writeFile(path.join(__dirname,"../../../../public/",req.body.filePath,req.body.fileName), 
//		req.body.botCode, 
//		function (err) {	
//			if (err) return console.log(err);			
//	        var msg = createMsg('iFrame',openConnections.indexOf(res));
//	        console.log('saveFile msg',msg);
//	        res.write('data: ' + JSON.stringify(msg) + '\n\n'); // Note the extra newline
//	});
});