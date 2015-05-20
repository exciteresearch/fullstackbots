'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var Event = require('mongoose').model("User");
var User = require('mongoose').model("Event");
var Challenge = require('mongoose').model("Challenge");
module.exports = router;
var _ = require('lodash');

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

router.get('/secret-stash', ensureAuthenticated, function (req, res) {

    var theStash = [
        'http://ep.yimg.com/ay/candy-crate/bulk-candy-store-2.gif',
        'http://www.dailybunny.com/.a/6a00d8341bfd0953ef0148c793026c970c-pi',
        'http://images.boomsbeat.com/data/images/full/44019/puppy-wink_1-jpg.jpg',
        'http://p-fst1.pixstatic.com/51071384dbd0cb50dc00616b._w.540_h.610_s.fit_.jpg',
        'http://childcarecenter.us/static/images/providers/2/89732/logo-sunshine.png',
        'http://www.allgraphics123.com/ag/01/10683/10683.jpg',
        'http://img.pandawhale.com/post-23576-aflac-dancing-duck-pigeons-vic-RU0j.gif',
        'http://www.eveningnews24.co.uk/polopoly_fs/1.1960527.1362056030!/image/1301571176.jpg_gen/derivatives/landscape_630/1301571176.jpg',
        'http://media.giphy.com/media/vCKC987OpQAco/giphy.gif',
        'https://my.vetmatrixbase.com/clients/12679/images/cats-animals-grass-kittens--800x960.jpg',
        'http://www.dailymobile.net/wp-content/uploads/2014/10/lollipops.jpg'
    ];

    res.send(_.shuffle(theStash));

});

//GET pending events
router.get('/pending', function (req, res, next) {
  
  var obj = {};
  obj.slots = {$gt: 0};
 
  Event.find(obj, function(err, events) {
    if (err) return next(err);
    res.send(events);
  });
});

//GET live events
router.get('/live', ensureAuthenticated, function (req, res, next) {
  
  var obj = {};
  obj.slots = {$eq: 0};
  obj.dateOfEnding = null;
 
  Event.find(obj, function(err, events) {
    if (err) return next(err);
    res.send(events);
  });
});

//Create an Event
router.post('/', function (req, res, next) {
  
console.log("index.js route.post.('/',...");
var event = req.body;
event.createdBy = mongoose.Types.ObjectId("5558f55d28db30a4394d4234");

console.log(event);

  Event.create(event, function (err, event) {
    if (err) return next(err);
    res.send(event);
  });
});

//Join to an Event
router.put('/:id', function (req, res, next) {

    var event_to_join = req.body;
    event_to_join.slots = event_to_join.slots - 1;
    //event_to_join.usersParticipants.push (req.user.id);

  Event.findByIdAndUpdate(req.params.id, event_to_join, function(err, event){
     if (err) return next(err);

     //if open slots are 0 we should launch the game

     res.send(event);
   });
});


//Delete event
router.delete('/:id', function (req, res, next) {
  Event.findByIdAndRemove(req.params.id, function (err, event) {
    if (err) {  console.log(err); return next(err); }
    res.send(event);
  });
});

//**************** CHALLENGES

//GET challenges
router.get('/challenge', function (req, res, next) {
   
  Challenge.find({}).populate("User").exec(function(err, challenges) {
    if (err) return next(err);
    res.send(challenges);
  });
});

//Create an Challenge
router.post('/challenge', function (req, res, next) {

var challenged = req.body;
console.log("Post Challenge", req.user.id, challenged);

var obj = {
  challenged: challenged._id,
  challenger: req.user.id
};

  Challenge.create(obj, function (err, event) {
    if (err) return next(err);
    res.send(event);
  });
});

//Accept
router.put('/challenges/:id', function (req, res, next) {

var obj = { accepted : true };

  Challenge.findByIdAndUpdate(req.params.id, obj, function(err, challenge){
     if (err) return next(err);
     res.send(challenge);
   });
});

