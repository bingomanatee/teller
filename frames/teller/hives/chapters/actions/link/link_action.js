var _ = require('underscore');
var util = require('util');

var _story_link = _.template('/stories/<%= story %>/chapter/<%= from_chapter %>');

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx.story) {
            done(new Error('no story'));
        } else if (!ctx.chapter) {
            done(new Error('no chapter'));
        } else {
            done();
        }
    },

    on_get_input: function (ctx, done) {
        if (!ctx.link_type) {
            ctx.link_type = 'continue';
        }

        ctx.$out.set('link_type', ctx.link_type);

        var library = this.model('teller_library');

        library.models.stories.get_story(ctx.story, function (err, story) {
            ctx.story = story;
            ctx.$out.set('story', story);

            library.models.chapters.get_chapter(story, ctx.chapter, function (err, chapter) {
                ctx.chapter = chapter;
                ctx.$out.set('chapter', chapter);

                library.models.chapters.chapters(story, function (err, chapters) {

                    chapters = _.reject(chapters, function (c) {
                        return c.name == chapter.name
                    });

                    _.each(chapters, function (c) {
                        c.links = [];
                    });


                    library.models.links.find_chapter_links(story, chapter.name, ctx.link_type, function (err, chapter_links) {
                        library.models.links.load_chapters(story, chapter_links, function (err, chapter_links) {
                            _.each(chapter_links, function (link) {

                                var other_chapter;
                                if (link.from_chapter == chapter.name) {
                                    other_chapter = link.to_chapter;
                                } else {
                                    other_chapter = link.from_chapter;
                                }

                                other_chapter = library.util.json.remove_suffix(other_chapter);

                                var ot_object = _.find(chapters, function(chapter){
                                    return chapter.name == other_chapter;
                                });

                                if (ot_object){
                                    ot_object.links.push(link);
                                } else {
                                    console.log('cannot find link for %s', other_chapter);
                                    console.log('in %s', util.inspect(chapters));
                                }
                            });

                            ctx.chapters = chapters;
                            ctx.$out.set('chapters', chapters);
                            done();
                        });
                    });

                })

            });

        });

    },

    on_post_process: function (ctx, done) {

        console.log('making link .... ');
        var library = this.model('teller_library');

        library.models.stories.get_story(ctx.story, function (err, story) {
            library.link_chapters(story, ctx.from_chapter, ctx.to_chapter, ctx.name || '', ctx.link_type,
                {prompt: ctx.prompt}, function(err, link){
                    console.log('link: e %s, ---- link %s', err, util.inspect(link));

                    done();
                });
        });

    },

    on_post_output: function(ctx, done){
        console.log('going to %s', util.inspect(ctx, true, 0));
        ctx.$go(_story_link(ctx), done)
    }
};