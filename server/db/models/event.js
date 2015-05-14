'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	codedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	viewable: { type: Boolean, default: true, required: true },
    forked: { type: Number },
    forkedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
	title: { type: String, required: true },
	description: { type: String },
    type: { 
    	type: String, 
    	enum: [ "Battle", "Simulation" ], 
    	required: true, 
    	default: "Simulation" 
		},
    eventDt: { type: Date },
	durationSec: { type: Number, default: 180, required: true },
    map: { type: String, default: '' },
    participants: { type: Date, required: true, default: Date.now() },
    viewers: { type: Number, default: 0 },
});

mongoose.model('Event', schema);