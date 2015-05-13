'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	codedBy: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
	},
    forked: {
    	type: Number
    },
    forkedFrom: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Bot'
	},
	botname: {
        type: String, required: true
    },
    botFile: {
    	type: String, default: ''
    },
    created: {
        type: Date, required: true, default: Date.now()
    },
    points: {
        type: Number
    },
    shots: {
        type: Number
    },
    kills: {
        type: Number
    },
    pickables: {
    	coins: Number, repairs: Number, shields: Number, damages: Number
    },
    battles: {
        type: Number
    },
    wins: {
        type: Number
    },
    fubarbundy: {
        type: Number
    }
});

mongoose.model('Bot', schema);