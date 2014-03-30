var _ = require('underscore');
var util = require('util');

module.exports = {

    on_validate: function (ctx, done) {

        this.model('member').ican(ctx, ['teller create story'], done, function () {
            ctx.add_message('You do not have permission to create stories.');
            ctx.$go('/', done);
        });

    },

    on_post_input: function (ctx, done) {
        ctx.story = _.pick(ctx, 'title', 'name', 'summary');
        ctx.story.creator = ctx.$session('member')._id;
        done();
    },

    on_post_process: function (ctx, done) {
        var story = ctx.story;

        var story_model = this.model('teller_story');
        story_model.put(story, function(err, story){
            if (err){
                done(err);
            } else if (story){
                ctx.$go('/stories/' + story._id, done);
            } else {
                done('cannot create story');
            }
        });
    }

}