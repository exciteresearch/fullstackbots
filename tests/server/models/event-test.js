var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');

require('../../../server/db/models/user');
require('../../../server/db/models/bot');
require('../../../server/db/models/map');
require('../../../server/db/models/event');

var Bot = mongoose.model('Bot');
var User = mongoose.model('User');
var User = mongoose.model('Map');
var User = mongoose.model('Event');

describe('Event model', function(){
    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

	var user1,user2;
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
    beforeEach('Create temporary user2', function (done) {
		user2 = new User({
			email: 'drake@email.com',
			username: 'drake'
		});
		User.create(user2,function(err,saved) {
			if(err) return done(err);
			user2 = saved;
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

    it('has codedBy which is equal to the id of the user who is coding it',function(done){			
		Bot.findById(bot._id,function(err,found){
			expect(found.codedBy.toString()).to.equal(user2._id.toString());
			done();
		});
    });

    it('has forked, botname, botFile, created, points, shots, kills, pickables, battles, wins, and fubarbundy',function(done){			
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
   
    it('has forkedFrom which is equal to the id of the bot it was forked from',function(done){			
		Bot.findById(bot._id,function(err,found){
			expect((found.forkedFrom).toString()).to.equal((bot.forkedFrom).toString());
			done();
		});
    });

    xit('should have qty which is a Number',function(done){
    	var product = new Product({
			name: "Jimmy's Brew",
			price:'29.99',
            categories: ['Organic','Red'],
            createdBy: user._id,
    		qty: 15,
			description:"It's organic"
    	});
        product.save(function(err){
			expect(product.qty).to.equal(15);
            done();
        });
    });

    xit('should have categories which is an Array ',function(done){
        var product = new Product({
			name: "Jimmy's Brew",
			price:'29.99',
            createdBy: user._id,
            categories: ['Organic','Red'],
			description:"It's organic"
        });
       product.save(function(err){
			expect(product).to.have.deep.property('categories[0]', 'Organic');
			expect(product).to.have.deep.property('categories[1]', 'Red');
            done();
        });
     });

    xit('should have createdBy which is an Object reference to a user',function(done){
        var product = new Product({
			name: "Jimmy's Brew",
			price:'29.99',
            categories: ['Organic','Red'],
            createdBy: user._id,
			description:"It's organic"
        });
		product.save(function(err){
            expect(product.createdBy).to.equal(user._id);
            done();
        });
    });

   xit('should have validation to require description',function(done){
        var product = new Product({
			name: "Jimmy's Brew",
            image:'/images/jimmysbrew.png',
            price:'29.99',
            qty: 15,
            categories: ['Organic','Red'],
            createdBy: user._id
        });
       product.save(function(err){
            expect(err.message).to.equal("Validation failed");
            done();
        });
    });

    xit('should require price',function(done){
        var product = new Product({
            name: "Jimmy's Brew",
            image:'/images/jimmysbrew.png',
            description:"It's organic",
            qty: 15,
            categories: ['Organic','Red'],
            createdBy: user._id
       });
       product.save(function(err){
            expect(err.message).to.equal("Validation failed");
			done();
        });
    });

    xit('should require category',function(done){
        var product = new Product({
            name: "Jimmy's Brew",
            image:'/images/jimmysbrew.png',
            description:"It's organic",
            price:'29.99',
            qty: 15,
            createdBy: user._id
        });
       product.save(function(err){
            expect(err.message).to.equal("Validation failed");
			done();
        });
    });

    xit('should require createdBy',function(done){
        var product = new Product({
            name: "Jimmy's Brew",
            image:'/images/jimmysbrew.png',
            description:"It's organic",
            price:'29.99',
            qty: 15,
            categories: ['Organic','Red']
        });
       product.save(function(err){
            expect(err.message).to.equal("Validation failed");
            done();
        });
    });

})