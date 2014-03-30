var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

module.exports = {

    on_validate: function (ctx, done) {
        this.model('member').ican(ctx, ['teller edit story'], done, {
            message: 'You do not have permission to edit stories!!',
            go: '/stories',
            done: done
        });
    },

    on_get_input: function (ctx, done) {
        this.model('teller_story').get_story_in_action(ctx, done);
    },

    on_post_input: function (ctx, done) {
        ctx.map = _.pick(ctx, 'title', 'name', 'summary', 'story', 'map_type', 'size', 'template');
        this.model('teller_story').get_story_in_action(ctx, done);
    },

    on_post_process: function (ctx, done) {
        console.log('putting %s', util.inspect(ctx.map));
        this.model('teller_map').put(ctx.map, function (err, map) {
            if (err) {
                console.log('error from put: %s', util.inspect(err));
                done(err);
            } else if (map) {
                ctx.$send(map.toJSON(), done);
            } else {
                done('Cannot make map');
            }
        });
    }

};