var _ = require('underscore');
var util = require('util');

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx.name) {
            done(new Error('no story name'))
        } else {
            done();
        }

    },

    on_get_input: function (ctx, done) {
        var name = ctx.name;
        var library = this.model('teller_library');

        library.models.stories.get_story(name, function (err, story) {
            if (err) {
                done(err);
            } else {
                ctx.story = story;
                done();
            }
        })
    },

    on_post_input: function (ctx, done) {
        var name = ctx.name;
        var library = this.model('teller_library');

        library.models.stories.get_story(name, function (err, story) {
            if (err) {
                done(err);
            } else {
                ctx.story = story;
                done();
            }
        })
    },

    on_post_process: function (ctx, done) {
        var story = ctx.story;
        delete ctx.story;

        story.update(ctx, function (err, story) {
            ctx.$go('/stories/' + story.name, done);
        })
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