var _ = require('underscore');
var Gate = require('gate');
var util = require('util');

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx._id) {
            done(new Error('no story'))
        } else {
            this.model('member').ican(ctx,['teller edit story'] , function(){
                ctx.$out.set('edit_story', true);
                done();
            }, function(){
                ctx.$out.set('edit_story', false);
                done();
            });
        }

    },

    on_input: function (ctx, done) {
        var story_model = this.model('teller-story');


        story_model.get(ctx._id, function (err, story) {
            if (err) {
                done(err);
            } else if (story) {
                ctx.$out.set('story', story);
                ctx.story = story;
                done()
            } else {
                ctx.add_message('cannot find story ' + ctx._id, 'error');
                ctx.$go('/stories', done);
            }
        })
    },

    on_process: function (ctx, done) {
        var member_id = -1;
        var member = ctx.$session('member');
        if (member){
            member_id = member._id;
        }

        if (ctx.story.creator == member_id){
            ctx.$out.set('edit_story', true);
        }

        if (false) {
        } else {
            ctx.$out.set('continue_links', []);
            ctx.$out.set('chapter', false);
            ctx.$out.set('chapters', []);
            done();
        }
    }

};