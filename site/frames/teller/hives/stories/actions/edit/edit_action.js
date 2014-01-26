var _ = require('underscore');
var util = require('util');

module.exports = {

    on_validate: function (ctx, done) {
        var story_model =  this.model('teller_story');
        if (!ctx._id) {
            done(new Error('no story id'))
        } else {
            this.model('member').ican(ctx, ['teller edit story'], done, function () {
               story_model.get(ctx._id, function(err, story){
                    if (story && story.creator == (ctx.$session('member') ? ctx.$session('member')._id : -1)){
                         done();
                    } else {
                        ctx.add_message('You do not have permission to create stories.', 'danger');
                        ctx.$go('/stories', done);
                    }
                });
            });
        }
    },


    on_post_input: function (ctx, done) {
        this.model('teller_story').get(ctx._id, function (err, story) {
            if (err) {
                done(err);
            } else if (story) {
                ctx.story = story;
                done();
            } else {
                ctx.add_message('cannot find story ' + ctx._id, 'danger');
                ctx.$go('/stories', done);
            }
        })
    },

    on_post_process: function (ctx, done) {

        _.extend(ctx.story, _.pick(ctx, 'title', 'summary'))
    },

    on_get_input: function (ctx, done) {
        var chapters_model = this.model('teller_chapter');
        this.model('teller_story').get(ctx._id, function (err, story) {
            if (err) {
                done(err);
            } else if (story) {
                ctx.story = story;
                chapters_model.find({story: ctx._id}, function(err, chapters){
                    if (err){
                        done(err);
                    } else {
                        ctx.chapters = chapters || [];
                        done();
                    }
                })
            } else {
                ctx.add_message('cannot find story ' + ctx._id, 'danger');
                ctx.$go('/stories', done);
            }
        })
    },

    on_get_output: function(ctx, done){

        ctx.$out.set('story', ctx.story);
        ctx.$out.set('chapters', ctx.chapters);
        done();
    }
}