'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    botname: {
        type: String
    },
    created: {
        type: Date
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