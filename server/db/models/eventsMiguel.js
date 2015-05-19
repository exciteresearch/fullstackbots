'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var schema = new mongoose.Schema({
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfCreation: { type: Date, required: true, default: Date.now() },
    dateOfEnding: { type: Date },
	specs: { type: String },
    slots: { type: Number },//open slots

    type: { 
    	type: String, 
    	enum: [ "Battle", "Simulation" ], 
    	default: "Battle" 
		},
    
    botsParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot'}],
    usersParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

mongoose.model('Event_Miguel', schema);