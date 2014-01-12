var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var jre = /\.json$/;

/**
 * This is a general utility for formatting and adding the .json suffix to a name.
 * @TODO: file string validation - no spaces, ':', etc.
 */

module.exports = {

    json: {
        /**
         * strips the .json suffix from the passed in string
         * @param name {string}
         * @returns {string}
         */
        remove_suffix: function(name){
            return name.replace(jre, '');
        },

        /**
         * ensures the passed-in string ends with .json
         * @param name {string}
         * @returns {string}
         */
        ensure_suffix: function(name){
            if (!jre.test(name)){
                name += '.json';
            }
            return name;
        },

        /**
         * returns only those elements with the suffix .json
         *
         * @param list {Array(string)}
         * @returns {Array(string)}
         */
        filter_file_list: function(list){
            if (!_.isArray(list)){
                throw new Error('non array passed to filter_file_list');
            }
            return _.filter(_.values(list), function(file){
                return jre.test(file);
            })
        }
    }
};