var _ = require('underscore');

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx.name) {
            done(new Error('no story name'))
        } else {
            done();
        }

    },

    on_post_input: function (ctx, done) {
        var name = ctx.name;
        var library = this.model('teller_library');

        library.models.stories.get_story(name, function (err, story) {
            story.update(ctx, function (err, story) {
                if (err) {
                    done(err);
                } else {
                    ctx.$out.set('story', story);
                    story.get_chapters(function (err, chapters) {
                        if (err) {
                            done(err)
                        } else {
                            ctx.$out.set('chapters', _.values(chapters));
                            console.log('done with input');
                            done();
                        }
                    })
                }
            })
        })
    },

    on_input: function (ctx, done) {
        var name = ctx.name;
        var library = this.model('teller_library');

        library.models.stories.get_story(name, function (err, story) {
            if (err) {
                done(err);
            } else {
                ctx.$out.set('story', story);
                story.get_chapters(function (err, chapters) {
                    if (err) {
                        done(err)
                    } else {
                        ctx.$out.set('chapters', _.values(chapters));
                        console.log('done with input');
                        done();
                    }
                })
            }
        })
    }
}