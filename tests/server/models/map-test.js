var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');

require('../../../server/db/models/user');
require('../../../server/db/models/map');

var User = mongoose.model('User');
var User = mongoose.model('Map');

describe('Event model', function(){
    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

	var user1;
    beforeEach('Create temporary user1', function (done) {
		user1 = new User({
			email: 'jake@email.com',
			username: 'jake'
		});
		User.create(user1,function(err,saved) {
			if(err) return done(err);
			user1 = saved;
			done();
		});
    });

	var bot, forkedBot;
    beforeEach('Create temporary forkedBot', function (done) {
    	forkedBot = new Bot({
			codedBy: user1._id,
			viewable: true, // include in tests
			forked: 1,
			botname: "bruiser",
			botFile: "// Empty BotFile",
			created: Date.now(),
			points: 0,
			shots: 30,
			kills: 0,
			pickables: { coins: 0, damages: 0, repairs: 0, shields: 0},
			battles: 0,
			wins: 0,
			losses: 1,
			fubarbundy: 1,			
		});
		Bot.create(forkedBot,function(err,saved) {
			if(err) return done(err);
			forkedBot = saved;
			console.log("forkedBot._id",forkedBot._id);
			done();
		});
    });
    beforeEach('Create temporary bot', function (done) {
		bot = new Bot({
			codedBy: user2._id,
			forked: 0,
			forkedFrom: forkedBot._id,
			botname: "hasher",
			botFile: "// Empty BotFile",
			created: Date.now(),
			points: 300,
			shots: 3,
			kills: 3,
			pickables: { coins: 0, damages: 1, repairs: 2, shields: 3},
			battles: 1,
			wins: 1,
			losses: 0,
			fubarbundy: 0,			
		});
		Bot.create(bot,function(err,saved) {
			if(err) return done(err);
			bot = saved;
			console.log("bot",bot);
			done();
		});
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

    it('should exist', function () {
        expect(Bot).to.be.a('function');
    });

    xit('has codedBy which is equal to the id of the user who is coding it',function(done){			
		Bot.findById(bot._id,function(err,found){
			expect(found.codedBy.toString()).to.equal(user2._id.toString());
			done();
		});
    });

    xit('has forked, botname, botFile, created, points, shots, kills, pickables, battles, wins, and fubarbundy',function(done){			
		Bot.findById(bot._id,function(err,found){
			expect(found.forked).to.equal(0);
			expect(found.botname).to.equal('hasher');
			expect(found.botFile).to.equal("// Empty BotFile");
			expect(found.created.toString()).to.equal(bot.created.toString());
			expect(found.points).to.equal(300);
			expect(found.shots).to.equal(3);
			expect(found.kills).to.equal(3);
			expect(found.battles).to.equal(1);
			expect(found.wins).to.equal(1);
			expect(found.losses).to.equal(0);
			expect(found.fubarbundy).to.equal(0);
			done();
		});
    });
   
    xit('has forkedFrom which is equal to the id of the map it was forked from',function(done){			
		Bot.findById(bot._id,function(err,found){
			expect((found.forkedFrom).toString()).to.equal((bot.forkedFrom).toString());
			done();
		});
    });

})