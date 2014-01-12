var _ = require('underscore');
var _chapter_url = _.template( "/stories/<%= story.name %>/chapter/<%= name %>");

module.exports = {

    on_validate: function(ctx, done){
        if (!ctx.story){
            done(new Error('no story'))
        } else {
            done();
        }
    },

    on_input: function(ctx, done){
        var story_name = ctx.story;
        var library = this.model('teller_library');

        console.log('story name: %s', story_name);

        ctx.$out.set('from_chapter', ctx.from_chapter || '');

        library.models.stories.get_story(story_name, function(err, story){
            if (err){
                done(err);
            } else if (story){
                ctx.story = story;
                ctx.$out.set('story', story);
                done();
            } else {
                done('cannot find story ' + story_name);
            }
        })
    },

    on_post_process: function(ctx, done){
        var library = this.model('teller_library');
        var data = _.pick(ctx, 'name', 'content', 'summary', 'content');
        var chapter = library.new_chapter(ctx.name, ctx.story, data);

        chapter.save(function(err, chapter){
            if (err){
                done(err);
            } else {
                ctx.$go(_chapter_url(chapter));
            }

        })
    }
}