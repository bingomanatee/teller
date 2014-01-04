var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var jre = /\.json$/;

module.exports = {

    json: {
        remove_suffix: function(name){
            return name.replace(jre, '');
        },

        ensure_suffix: function(name){
            if (!jre.test(name)){
                name += '.json';
            }
            return name;
        }
    }
};