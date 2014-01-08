var _ = require('underscore');

module.exports = {

    on_validate: function(ctx, done){
        if (!ctx.name){
            done(new Error('no story name'))
        } else {
            done();
        }

    },

    on_input: function(ctx, done){
        var name = ctx.name;
        var library = this.model('teller_library');

        library.models.stories.get_story(name, function(err, story){
            if (err){
                done(err);
            } else {
                ctx.$out.set('story', story);
                story.get_chapters(function(err, chapters){
                    if (err){
                        done(err)
                    } else {
                        ctx.$out.set('chapters', _.values(chapters));
                        console.log('done with input');

                        var chapter_name = ctx.chapter ? ctx.chapter: story.start_chapter? story.start_chapter: '';

                        ctx.$out.set('chapter', chapter_name ? _.find(chapters, function(c){
                            return c.name == chapter_name;
                        }) : null);
                        done();
                    }
                })
            }
        })
    }
}