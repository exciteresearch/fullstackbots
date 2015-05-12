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
    games: {
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