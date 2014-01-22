var _ = require('underscore');
var util = require('util');

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx.name) {
            done(new Error('no story name'))
        } else {
            this.model('member').ican(ctx, ['teller edit story'], done, function () {
                this.model('teller-story').get(ctx._id, function(err, story){
                    if (story && story.creator == (ctx.$session('member') ? ctx.$session('member')._id : -1)){
                         done();
                    } else {
                        ctx.add_message('You do not have permission to create stories.', 'error');
                        ctx.$go('/stories', done);
                    }
                });
            });
        }
    },

    on_get_input: function (ctx, done) {

        this.models('teller-story').get(ctx._id, function (err, story) {
            if (err) {
                done(err);
            } else if (story) {
                ctx.story = story;
                done();
            } else {
                ctx.add_message('cannot find story ' + ctx._id, 'error');
                ctx.$go('/stories', done);
            }
        })
    },

    on_post_input: function (ctx, done) {
        this.models('teller-story').get(ctx._id, function (err, story) {
            if (err) {
                done(err);
            } else if (story) {
                ctx.story = story;
                done();
            } else {
                ctx.add_message('cannot find story ' + ctx._id, 'error');
                ctx.$go('/stories', done);
            }
        })
    },

    on_post_process: function (ctx, done) {

        _.extend(ctx.story, _.pick(ctx, 'title', 'summary'))
    },

    on_get_process: function (ctx, done) {
        ctx.$out.set('story', ctx.story);
        ctx.story.get_chapters(function (err, chapters) {
            if (err) {
                done(err)
            } else {
                chapters = _.values(chapters);
                console.log('chapters: %s', chapters.length);
                ctx.$out.set('chapters', chapters);
                done();
            }
        });

    }
}