var _ = require('underscore');
var Gate = require('gate');
var util = require('util');

module.exports = {

    on_validate: function (ctx, done) {
        if (!ctx.name) {
            done(new Error('no story name'))
        } else {
            done();
        }

    },

    on_input: function (ctx, done) {
        var name = ctx.name;
        var library = this.model('teller_library');

        library.models.stories.get_story(name, function (err, story) {
            if (err) {
                done(err);
            } else {
                ctx.$out.set('story', story);
                ctx.story = story;
                story.thread(function (err, chapters) {
                    if (err) {
                        done(err)
                    } else {
                        ctx.$out.set('chapters', _.values(chapters));

                        var chapter_name = ctx.chapter ? ctx.chapter : story.start_chapter ? story.start_chapter : '';

                        if (chapter_name){
                            story.get_chapter(chapter_name, function(err, chapter){
                                ctx.$out.set('chapter', chapter);
                                ctx.chapter = chapter;
                                if (chapter){
                                    chapter.load_content(done);
                                }
                            })
                        } else {
                            ctx.chapter = null;
                            ctx.$out.set('chapter', null);
                        }

                    }
                })
            }
        })
    },

    on_process: function (ctx, done) {
        if (ctx.chapter) {
            var library = this.model('teller_library');
            library.models.links.find_links(ctx.story, ctx.chapter.name, '', 'continue',
                function (err, links) {
                    if (err){
                        return done(err);
                    }
                    console.log('continue links: %s', util.inspect(links));
                    ctx.$out.set('continue_links', links || []);

                    library.models.links.load_chapters(ctx.story, links, done);

                });
        } else {
            ctx.$out.set('continue_links', []);
            done();
        }
    }

};