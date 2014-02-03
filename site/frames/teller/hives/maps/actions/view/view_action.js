var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

module.exports = {

    on_validate: function (ctx, done) {
        this.model('member').ican(ctx, ['teller edit story'], done, {
            message: 'You do not have permission to edit stories.',
            go: '/stories',
            done: done
        });
    },

    on_get_input: function (ctx, done) {

        var map_model = this.model('teller_map');

        this.model('teller_story').get_story_in_action(ctx, done,
            function (story) {
                map_model.get_map_in_action(ctx, done, function(map){
                    console.log('got map from promise', map);
                    done();
                })
            });
    }

};