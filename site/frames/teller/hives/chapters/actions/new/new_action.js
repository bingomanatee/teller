var _ = require('underscore');
var _chapter_url = _.template("/stories/<%= story.name %>/chapter/<%= name %>");

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx.story) {
            done(new Error('no story'))
        } else {
            done();
        }
    },

    on_input: function (ctx, done) {
        var story_name = ctx.story;
        var library = this.model('teller_library');

        console.log('story name: %s, from = ', story_name, ctx.chapter);

        ctx.$out.set('from_chapter', ctx.chapter || '');

        library.models.stories.get_story(story_name, function (err, story) {
            if (err) {
                done(err);
            } else if (story) {
                ctx.story = story;
                ctx.$out.set('story', story);
                done();
            } else {
                done('cannot find story ' + story_name);
            }
        })
    },

    on_post_process: function (ctx, done) {
        var library = this.model('teller_library');
        var data = _.pick(ctx, 'name', 'content', 'summary', 'content');
        var chapter = library.new_chapter(ctx.name, ctx.story, data);
        console.log('making new chapter with from = %s', ctx.from_chapter);
        chapter.save(function (err, chapter) {
                ctx.chapter = chapter;
                if (err) {
                    done(err);
                } else {
                    if (ctx.from_chapter) {
                        library.models.links.find_links(ctx.story, ctx.from_chapter, chapter.name, 'continue', function (err, old_links) {
                            old_links.forEach(function(link){
                               link.to_chapter = chapter.name;
                                link.save(_.identity);
                            });
                            library.link_chapters(ctx.story, ctx.from_chapter, chapter, '', 'continue', {}, done);
                        });
                    }
                    else {
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