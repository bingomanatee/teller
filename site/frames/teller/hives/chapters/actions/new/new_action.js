var _ = require('underscore');
var _chapter_url = _.template("/stories/<%= story %>/chapter/<%= _id %>");

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx.story) {
            done(new Error('no story'))
        } else {
            done();
        }
    },

    on_input: function (ctx, done) {
        var story_id = ctx.story;
        var story_model = this.model('teller-story');

        console.log('story name: %s, from = ', story_id, ctx.chapter);

        ctx.$out.set('from_chapter', ctx.chapter || '');

        story_model.get(story_id, function (err, story) {
            if (err) {
                done(err);
            } else if (story) {
                ctx.story = story;
                ctx.$out.set('story', story);
                done();
            } else {
                done('cannot find story ' + story_id);
            }
        })
    },

    on_post_process: function (ctx, done) {
        var chapter_model = this.model('teller-chapter');

        var data = _.pick(ctx, 'name', 'content', 'story', 'summary');
        console.log('making new chapter with from = %s', ctx.from_chapter);
        chapter_model.put(data, function (err, chapter) {
                ctx.chapter = chapter;
                if (err) {
                    done(err);
                } else {
                    if (ctx.from_chapter) {
                        chapter_model.get(ctx.from_chapter, function(err, f_chapter){
                            if (f_chapter){
                                f_chapter.next_chapter = chapter._id;
                                f_chapter.save(done)
                            } else {
                                done();
                            }
                        });
                    } else {
                        done();
                    }
                }

            }
        )
    },

    on_post_output: function (ctx, done) {
        ctx.$go(_chapter_url(ctx.chapter), done);
    }
}