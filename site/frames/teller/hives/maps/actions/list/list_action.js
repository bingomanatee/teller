var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

module.exports = {

    on_validate: function (ctx, done) {
        var members_model = this.models('member');
        this.models('teller-story').get(ctx.story, function (err, story) {
            if (story) {
                ctx.$out.set('story', story);
                var member = ctx.$session('member');
                if (story && member && story.creator == member._id) {
                    done();
                } else {
                    members_model.ican(ctx, ['edit_story'], done, function () {
                        ctx.add_message('you do not have permissions to edit stories', 'error');
                        ctx.$go('/stories', done);
                    })
                }
            } else {
                ctx.add_message('cannot find story ' + ctx.story, 'error');
                ctx.$go('/stories', done);
            }
        });
    },

    on_input: function (ctx, done) {
        this.models('teller-map').find({story: ctx.story}, function (err, maps) {
            ctx.$out.set('maps', maps || []);
            done();
        })
    }

};