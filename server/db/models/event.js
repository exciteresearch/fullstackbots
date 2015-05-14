'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	codedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	viewable: { type: Boolean, default: true},
    forked: { type: Number, default: 0  },
    forkedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    created: { type: Date, required: true, default: Date.now() },
	title: { type: String, required: true },
	description: { type: String },
    type: { 
    	type: String, 
    	enum: [ "Battle", "Simulation" ], 
    	default: "Simulation" 
		},
    eventDt: { type: Date, required: true },
	durationSec: { type: Number, default: 180, required: true },
    map: { type: String, default: '' },
    botsParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot'}],
    usersParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

mongoose.model('Event', schema);